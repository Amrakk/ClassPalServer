import type { ObjectId } from "mongooat";
import type BaseError from "../../errors/BaseError.js";
import type { IApplication } from "../database/application.js";
import type { ISocialMediaAccount, IUser } from "../database/user.js";
import type { RESPONSE_CODE, RESPONSE_MESSAGE, SUPPORTED_PARADIGM } from "../../constants.js";

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
    export interface Application {
        _id: ObjectId;
        name: string;
        version: string;
        description: string;
        author: string;
        protocol: string;
        origin: string;
        basePath: string;
        paradigm: SUPPORTED_PARADIGM;
    }

    export interface User {
        _id: ObjectId;
        name: string;
        email: string;
        phoneNumber?: string;
        avatarUrl: string;
        socialMediaAccounts: ISocialMediaAccount[];
    }
}
