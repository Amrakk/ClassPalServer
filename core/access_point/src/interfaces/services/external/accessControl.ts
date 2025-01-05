import type { ObjectId } from "mongooat";

export interface IRelationGroups<T = ObjectId> {
    mandatory: T[];
    optional: T[];
}

export interface IRole {
    _id: ObjectId;
    name: string;
    isLocked: boolean;
    privileges: IRelationGroups;
    parents: IRelationGroups;
}

export interface IRoleSimplified extends Omit<IRole, "privileges" | "parents"> {}
