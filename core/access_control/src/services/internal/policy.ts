import { z, ZodObjectId } from "mongooat";
import { isIdsExist } from "../../utils/isIdExist.js";
import { policyModel } from "../../database/models/policy.js";
import { removeUndefinedKeys } from "../../utils/removeUndefinedKeys.js";

import NotFoundError from "../../errors/NotFoundError.js";

import type { ObjectId } from "mongooat";
import type { ClientSession } from "mongodb";
import type { IPolicy } from "../../interfaces/database/policy.js";
import type { IOffsetPagination, IReqPolicy } from "../../interfaces/api/request.js";

export default class PolicyService {
    public static async isPolicyExists(id: ObjectId, options?: { session?: ClientSession }): Promise<boolean>;
    public static async isPolicyExists(ids: ObjectId[], options?: { session?: ClientSession }): Promise<boolean>;
    public static async isPolicyExists(
        ids: ObjectId | ObjectId[],
        options?: { session?: ClientSession }
    ): Promise<boolean> {
        return isIdsExist(policyModel, Array.isArray(ids) ? ids : [ids], options);
    }

    // Query
    public static async getAll(query: IReqPolicy.Filter & IOffsetPagination): Promise<[IPolicy[], number]> {
        const { page, limit, searchTerm } = query;
        const skip = ((page ?? 1) - 1) * (limit ?? 0);

        const filter = {
            $or: searchTerm ? [{ action: { $regex: searchTerm, $options: "i" } }] : undefined,
        };

        const cleanedFilter = removeUndefinedKeys(filter);

        const [policies, totalDocuments] = await Promise.all([
            policyModel.collection
                .find(cleanedFilter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit ?? 0)
                .toArray(),
            policyModel.countDocuments(cleanedFilter),
        ]);

        return [policies, totalDocuments];
    }

    public static async getById(id: string | ObjectId): Promise<IPolicy | null>;
    public static async getById(ids: (string | ObjectId)[]): Promise<IPolicy[]>;
    public static async getById(ids: string | ObjectId | (string | ObjectId)[]): Promise<IPolicy[] | IPolicy | null> {
        if (Array.isArray(ids)) {
            const result = await z.array(ZodObjectId).safeParseAsync(ids);
            if (result.error) throw new NotFoundError("Policies not found");

            return policyModel.find({ _id: { $in: result.data } });
        }

        const result = await ZodObjectId.safeParseAsync(ids);
        if (result.error) throw new NotFoundError("Policy not found");

        return policyModel.findById(result.data);
    }

    public static async getByAction(action: string): Promise<IPolicy[]> {
        return policyModel.find({ action });
    }

    // Mutation
    public static async insert(data: IReqPolicy.Insert[], options?: { session?: ClientSession }): Promise<IPolicy[]> {
        return await policyModel.insertMany(data, { session: options?.session });
    }

    public static async updateById(id: string | ObjectId, data: IReqPolicy.Update): Promise<IPolicy> {
        const result = await ZodObjectId.safeParseAsync(id);
        if (result.error) throw new NotFoundError("Policy not found");

        const updatedPolicy = await policyModel.findOneAndUpdate({ _id: result.data, isLocked: false }, data, {
            returnDocument: "after",
        });
        if (!updatedPolicy) throw new NotFoundError("Policy not found or is locked");

        return updatedPolicy;
    }

    public static async upsert(data: IReqPolicy.Insert[], options?: { session?: ClientSession }): Promise<IPolicy[]> {
        const bulkOps = await Promise.all(
            data.map(
                async (policy) =>
                    await policyModel.parse({ ...policy }).then(({ _id, ...parsedPolicy }) => ({
                        updateOne: {
                            filter: { action: parsedPolicy.action, relationship: parsedPolicy.relationship },
                            update: { $set: parsedPolicy },
                            upsert: true,
                        },
                    }))
            )
        );

        await policyModel.collection.bulkWrite(bulkOps, { session: options?.session });

        const filter = {
            $or: data.map((policy) => ({
                action: policy.action,
                relationship: policy.relationship,
            })),
        };

        return policyModel.find(filter, { session: options?.session });
    }

    public static async deleteById(id: string | ObjectId): Promise<IPolicy> {
        const result = await ZodObjectId.safeParseAsync(id);
        if (result.error) throw new NotFoundError("Policy not found");

        const deletedPolicy = await policyModel.findOneAndDelete({ _id: result.data, isLocked: false });
        if (!deletedPolicy) throw new NotFoundError("Policy not found or is locked");

        return deletedPolicy;
    }
}
