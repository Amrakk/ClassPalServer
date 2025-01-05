import type { IPolicy } from "../database/policy.js";
import type BaseError from "../../errors/BaseError.js";
import type { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../constants.js";
import type { IRelationGroups, IRole, IRoleSimplified } from "../database/role.js";

// CORE RESPONSE INTERFACE
export interface IResponse<T = undefined> {
    /** Response code */
    code: RESPONSE_CODE;
    /** Response message */
    message: RESPONSE_MESSAGE;
    /** Response data */
    data?: T;
    /** Error details */
    error?: BaseError | Record<string, unknown> | Array<unknown>;
}

export namespace IResGetAll {
    export interface Role {
        roles: IRole[];
        totalDocuments: number;
    }

    export interface Policy {
        policies: IPolicy[];
        totalDocuments: number;
    }
}

export namespace IResGetById {
    export interface Role extends IRoleSimplified {
        privileges: IRelationGroups<IPolicy>;
        parents: IRelationGroups<IRoleSimplified>;
        children: IRoleSimplified[];
    }
}
