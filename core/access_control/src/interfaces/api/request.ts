import type { ObjectId } from "mongooat";

export interface IOffsetPagination {
    page?: number;
    limit?: number;
}

export interface ITimeBasedPagination {
    from?: Date;
    limit?: number;
}

export namespace IReqAccess {
    export interface Authorize {
        fromId: ObjectId | string;
        fromRoleIds: (string | ObjectId)[];
        toId: ObjectId | string;
        action: string;
    }

    export interface Node {
        role: {
            name: string;
            privileges: NodePrivilege[];
        };
        child: Node[];
    }

    export type NodePrivilege = {
        action: string;
        relationship: string;
    };

    export interface Register {
        roles?: Node[];
    }
}

export namespace IReqRole {
    export interface GetAllQuery {
        page?: string;
        limit?: string;

        searchTerm?: string;
    }

    export interface Filter {
        searchTerm?: string;
    }

    export interface Insert {
        name: string;
        isLocked?: boolean; // Default: false
        privileges?: {
            mandatory: (string | ObjectId)[];
            optional: (string | ObjectId)[];
        };
        parents?: {
            mandatory: (string | ObjectId)[];
            optional: (string | ObjectId)[];
        };
    }

    export interface PreprocessUpdate {
        name?: string;
        isLocked?: boolean;
        optionalPrivileges?: (string | ObjectId)[];
        optionalParents?: (string | ObjectId)[];
    }

    export interface Update {
        name?: string;
        isLocked?: boolean;
        privileges?: {
            mandatory: (string | ObjectId)[];
            optional: (string | ObjectId)[];
        };
        parents?: {
            mandatory: (string | ObjectId)[];
            optional: (string | ObjectId)[];
        };
    }
}

export namespace IReqPolicy {
    export interface GetAllQuery {
        page?: string;
        limit?: string;

        searchTerm?: string;
    }

    export interface Filter {
        searchTerm?: string;
    }

    export interface Insert {
        action: string;
        relationship: string;
        isLocked?: boolean; // Default: false
    }

    export interface Update {
        action?: string;
        relationship?: string;
        isLocked?: boolean;
    }
}

export namespace IReqRelationship {
    export interface Condition {
        fromRel: string;
        toRel: string;
        resultRel: string;
    }

    export interface EntityRelationship {
        entityId: string | ObjectId;
        relationship: string;
    }

    export interface Bind {
        initiators: EntityRelationship[];
        targetId: string | ObjectId;
        conditions: Condition[];
    }

    export interface Unbind {
        terminators: EntityRelationship[];
        targetId: string | ObjectId;
        isTargetUnbound?: boolean;
        conditions: Condition[];
    }

    export interface Query {
        relationships?: string[];
    }

    export interface UpsertDel {
        from: ObjectId | string;
        to: ObjectId | string;
        relationship: string;
    }

    export interface UpdateByFromTo {
        from: ObjectId | string;
        to: ObjectId | string;
        relationships: string[];
        exclude?: string[];
    }

    export interface DeleteByFromToIds {
        ids: (string | ObjectId)[];
    }
}
