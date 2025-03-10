import type { IUser } from "../database/user.js";
import type BaseError from "../../errors/BaseError.js";
import type { IApplication } from "../database/application.js";
import type { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../constants.js";

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

// API RESPONSE INTERFACES
export interface IResLogin {
    user: Omit<IUser, "password">;
}

export namespace IResGetAll {
    export interface Application {
        applications: IApplication[];
        totalDocuments: number;
    }

    export interface User {
        users: Omit<IUser, "password">[];
        totalDocuments: number;
    }
}

export namespace IResGetById {
    export interface Application extends IApplication {}

    export interface User extends Omit<IUser, "password"> {}
}
