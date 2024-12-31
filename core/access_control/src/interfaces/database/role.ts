import type { ObjectId } from "mongooat";

export interface IRole {
    name: string;
    isLocked: boolean;
    privileges: IRelationGroups;
    parents: IRelationGroups;
}

export interface IRelationGroups {
    mandatory: ObjectId[];
    optional: ObjectId[];
}
