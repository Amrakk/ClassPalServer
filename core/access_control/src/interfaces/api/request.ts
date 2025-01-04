import type { ObjectId } from "mongooat";

export interface IOffsetPagination {
    page?: number;
    limit?: number;
}

export interface ITimeBasedPagination {
    from?: Date;
    limit?: number;
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
        isLocked: boolean;
    }

    export interface Update {
        action?: string;
        relationship?: string;
        isLocked?: boolean;
    }
}

export namespace IReqRelationship {
    export interface Insert {
        from: ObjectId | string;
        to: ObjectId | string;
        relationship: string;
    }

    export interface Update {
        from?: ObjectId | string;
        to?: ObjectId | string;
        relationship?: string;
    }
}
