import { ZodObjectId } from "mongooat";
import { relationshipModel } from "../../database/models/relationship.js";

import NotFoundError from "../../errors/NotFoundError.js";

import type { ObjectId } from "mongooat";
import type { IReqRelationship } from "../../interfaces/api/request.js";
import type { IRelationship } from "../../interfaces/database/relationship.js";

export default class RelationshipService {
    // Query
    public static async getById(id: string | ObjectId): Promise<IRelationship | null> {
        const result = await ZodObjectId.safeParseAsync(id);
        if (result.error) throw new NotFoundError("Relationship not found");

        return relationshipModel.findById(result.data);
    }

    public static async getByFrom(from: string | ObjectId): Promise<IRelationship[]> {
        const result = await ZodObjectId.safeParseAsync(from);
        if (result.error) throw new NotFoundError("Relationship not found");

        return relationshipModel.find({ from: result.data });
    }

    public static async getByTo(to: string | ObjectId): Promise<IRelationship[]> {
        const result = await ZodObjectId.safeParseAsync(to);
        if (result.error) throw new NotFoundError("Relationship not found");

        return relationshipModel.find({ to: result.data });
    }

    // Mutation
    public static async insert(data: IReqRelationship.Insert[]): Promise<IRelationship[]> {
        return await relationshipModel.insertMany(data);
    }

    public static async updateById(id: string | ObjectId, data: IReqRelationship.Update): Promise<IRelationship> {
        const result = await ZodObjectId.safeParseAsync(id);
        if (result.error) throw new NotFoundError("Relationship not found");

        const updatedRelationship = await relationshipModel.findByIdAndUpdate(result.data, data, {
            returnDocument: "after",
        });
        if (!updatedRelationship) throw new NotFoundError("Relationship not found");

        return updatedRelationship;
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
}
