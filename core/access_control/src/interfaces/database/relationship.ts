import type { ObjectId } from "mongooat";

export interface IRelationship {
    _id: ObjectId;
    from: ObjectId;
    to: ObjectId;
    relationship: string;
}
