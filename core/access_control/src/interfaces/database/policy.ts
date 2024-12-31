import type { ObjectId } from "mongooat";

export interface IPolicy {
    _id: ObjectId;
    action: string;
    relationship: string;
    isLocked: boolean;
}
