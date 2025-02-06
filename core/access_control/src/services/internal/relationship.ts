import mongooat from "../../database/db.js";
import { BATCH_SIZE } from "../../constants.js";
import { ValidateError, z, ZodObjectId } from "mongooat";
import { relationshipModel } from "../../database/models/relationship.js";

import NotFoundError from "../../errors/NotFoundError.js";

import type { ObjectId } from "mongooat";
import type { IReqRelationship } from "../../interfaces/api/request.js";
import type { IRelationship } from "../../interfaces/database/relationship.js";

export default class RelationshipService {
    private static conditionSchema = z.object({
        fromRel: z.string(),
        toRel: z.string(),
        resultRel: z.string(),
    });
    private static entitySchema = z.object({
        entityId: ZodObjectId,
        relationship: z.string(),
    });
    private static bindSchema = z.object({
        initiators: z.array(RelationshipService.entitySchema),
        targetId: ZodObjectId,
        conditions: z.array(RelationshipService.conditionSchema),
    });
    private static unbindSchema = z.object({
        terminators: z.array(RelationshipService.entitySchema),
        targetId: ZodObjectId,
        isTargetUnbound: z.boolean().default(false),
        conditions: z.array(RelationshipService.conditionSchema),
    });

    public static async bind(data: IReqRelationship.Bind): Promise<void> {
        const result = await RelationshipService.bindSchema.safeParseAsync(data);
        if (result.error) throw new ValidateError("Invalid bind data", result.error.errors);

        const { initiators, targetId, conditions } = result.data;

        const session = mongooat.getBase().startSession();
        try {
            await session.withTransaction(async () => {
                const relationships = initiators.map(({ entityId: initiatorId, relationship }) => ({
                    from: initiatorId,
                    to: targetId,
                    relationship,
                }));

                await relationshipModel.insertMany(relationships, { session });
                if (conditions.length === 0) return;

                const pipelines = conditions.flatMap(({ fromRel, toRel, resultRel }) => [
                    [
                        { $match: { to: targetId, relationship: toRel } },
                        { $project: { from: 1 } },
                        {
                            $addFields: {
                                newRelationships: {
                                    $map: {
                                        input: initiators.filter(({ relationship }) => relationship === fromRel),
                                        as: "initiator",
                                        in: {
                                            from: "$$initiator.entityId",
                                            to: "$from",
                                            relationship: resultRel,
                                        },
                                    },
                                },
                            },
                        },
                        { $unwind: "$newRelationships" },
                        { $replaceRoot: { newRoot: "$newRelationships" } },
                    ],
                    [
                        { $match: { to: targetId, relationship: fromRel } },
                        { $project: { from: 1 } },
                        {
                            $addFields: {
                                newRelationships: {
                                    $map: {
                                        input: initiators.filter(({ relationship }) => relationship === toRel),
                                        as: "initiator",
                                        in: {
                                            from: "$from",
                                            to: "$$initiator.entityId",
                                            relationship: resultRel,
                                        },
                                    },
                                },
                            },
                        },
                        { $unwind: "$newRelationships" },
                        { $replaceRoot: { newRoot: "$newRelationships" } },
                    ],
                ]);

                const pipeline = [
                    { $facet: { ...pipelines } },
                    {
                        $project: {
                            allRelationships: {
                                $reduce: {
                                    input: { $objectToArray: "$$ROOT" },
                                    initialValue: [],
                                    in: { $concatArrays: ["$$value", "$$this.v"] },
                                },
                            },
                        },
                    },
                    { $unwind: "$allRelationships" },
                    { $replaceRoot: { newRoot: "$allRelationships" } },
                ];

                const cursor = relationshipModel.aggregate(pipeline, { session });

                const bulkOperations = [];
                for await (const doc of cursor) {
                    bulkOperations.push({
                        updateOne: {
                            filter: { from: doc.from, to: doc.to, relationship: doc.relationship },
                            update: { $set: doc },
                            upsert: true,
                        },
                    });

                    if (bulkOperations.length === BATCH_SIZE) {
                        await relationshipModel.bulkWrite(bulkOperations, { session });
                        bulkOperations.length = 0;
                    }
                }

                if (bulkOperations.length > 0) await relationshipModel.bulkWrite(bulkOperations, { session });
            });
        } catch (err) {
            throw err;
        } finally {
            session.endSession();
        }
    }

    public static async unbind(data: IReqRelationship.Unbind): Promise<void> {
        const result = await RelationshipService.unbindSchema.safeParseAsync(data);
        if (result.error) throw new ValidateError("Invalid unbind data", result.error.errors);

        const { terminators, targetId, conditions, isTargetUnbound } = result.data;
        const session = mongooat.getBase().startSession();

        try {
            await session.withTransaction(async () => {
                const filterConditions: {
                    from?: ObjectId;
                    to?: ObjectId;
                    relationship?: string;
                }[] = terminators.map(({ entityId, relationship }) => ({
                    from: entityId,
                    to: targetId,
                    relationship,
                }));

                const additionConditions = conditions.flatMap(({ fromRel, toRel, resultRel }) =>
                    [
                        terminators
                            .filter(({ relationship }) => relationship === fromRel)
                            .map(({ entityId }) => ({
                                from: entityId,
                                relationship: resultRel,
                            })),
                        terminators
                            .filter(({ relationship }) => relationship === toRel)
                            .map(({ entityId }) => ({
                                to: entityId,
                                relationship: resultRel,
                            })),
                    ].flat()
                );

                filterConditions.push(...additionConditions);

                if (isTargetUnbound) filterConditions.push({ to: targetId });
                await relationshipModel.deleteMany({ $or: filterConditions }, { session });
            });
        } catch (err) {
            throw err;
        } finally {
            session.endSession();
        }
    }

    // Query
    public static async getById(id: string | ObjectId): Promise<IRelationship | null> {
        const result = await ZodObjectId.safeParseAsync(id);
        if (result.error) throw new NotFoundError("Relationship not found");

        return relationshipModel.findById(result.data);
    }

    public static async getByFrom(from: string | ObjectId, query?: IReqRelationship.Query): Promise<IRelationship[]> {
        const result = await ZodObjectId.safeParseAsync(from);
        if (result.error) throw new NotFoundError("Relationship not found");

        const filter = {
            from: result.data,
            ...(query?.relationships ? { relationship: { $in: query.relationships } } : {}),
        };

        return relationshipModel.find(filter);
    }

    public static async getByTo(to: string | ObjectId, query?: IReqRelationship.Query): Promise<IRelationship[]> {
        const result = await ZodObjectId.safeParseAsync(to);
        if (result.error) throw new NotFoundError("Relationship not found");

        const filter = {
            to: result.data,
            ...(query?.relationships ? { relationship: { $in: query.relationships } } : {}),
        };

        return relationshipModel.find(filter);
    }

    public static async getByFromTo(from: string | ObjectId, to: string | ObjectId): Promise<IRelationship[]> {
        const resultFrom = await ZodObjectId.safeParseAsync(from);
        if (resultFrom.error) throw new NotFoundError("Relationship not found");

        const resultTo = await ZodObjectId.safeParseAsync(to);
        if (resultTo.error) throw new NotFoundError("Relationship not found");

        return relationshipModel.find({ from: resultFrom.data, to: resultTo.data });
    }

    // Mutation
    public static async upsert(data: IReqRelationship.Upsert[]): Promise<IRelationship[]> {
        const bulkOps = await Promise.all(
            data.map(
                async (relationship) =>
                    await relationshipModel.parse({ ...relationship }).then(({ _id, ...parsedRelationship }) => ({
                        updateOne: {
                            filter: { ...parsedRelationship },
                            update: { $set: parsedRelationship },
                            upsert: true,
                        },
                    }))
            )
        );

        await relationshipModel.collection.bulkWrite(bulkOps);

        const filter = { $or: bulkOps.map((op) => op.updateOne.filter) };
        return relationshipModel.find(filter);
    }

    public static async updateByFromTo(data: IReqRelationship.UpdateByFromTo): Promise<IRelationship[]> {
        const { from, to, relationships, exclude } = data;
        const resultFrom = await ZodObjectId.safeParseAsync(from);
        if (resultFrom.error) throw new NotFoundError("Relationship not found");

        const resultTo = await ZodObjectId.safeParseAsync(to);
        if (resultTo.error) throw new NotFoundError("Relationship not found");

        const filter = {
            from: resultFrom.data,
            to: resultTo.data,
            ...(exclude && { relationship: { $nin: exclude } }),
        };

        await relationshipModel.deleteMany(filter);

        const updateData = relationships.map((relationship) => ({
            from: resultFrom.data,
            to: resultTo.data,
            relationship,
        }));

        return relationshipModel.insertMany(updateData);
    }

    public static async deleteById(id: string | ObjectId): Promise<IRelationship> {
        const result = await ZodObjectId.safeParseAsync(id);
        if (result.error) throw new NotFoundError("Relationship not found");

        const deletedRelationship = await relationshipModel.findByIdAndDelete(result.data);
        if (!deletedRelationship) throw new NotFoundError("Relationship not found");

        return deletedRelationship;
    }

    public static async deleteByFrom(from: string | ObjectId): Promise<void> {
        const result = await ZodObjectId.safeParseAsync(from);
        if (result.error) throw new NotFoundError("Relationship not found");

        const deletedResult = await relationshipModel.deleteMany({ from: result.data });
        if (!deletedResult.deletedCount) throw new NotFoundError("Relationship not found");
    }

    public static async deleteByTo(to: string | ObjectId): Promise<void> {
        const result = await ZodObjectId.safeParseAsync(to);
        if (result.error) throw new NotFoundError("Relationship not found");

        const deletedResult = await relationshipModel.deleteMany({ to: result.data });
        if (!deletedResult.deletedCount) throw new NotFoundError("Relationship not found");
    }

    public static async deleteByFromToIds(ids: (string | ObjectId)[]): Promise<void> {
        const result = await z.array(ZodObjectId).safeParseAsync(ids);
        if (result.error) throw new NotFoundError("Relationship not found");

        const filter = { $or: [{ from: { $in: result.data } }, { to: { $in: result.data } }] };
        await relationshipModel.deleteMany(filter);
    }
}
