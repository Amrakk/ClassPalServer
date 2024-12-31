import type { ObjectId } from "mongooat";

export interface IRelationship {
    from: ObjectId;
    to: ObjectId;
    relationship: string;
}
