import type { ISocialMediaAccount } from "../database/user.js";
import type { SUPPORTED_PARADIGM, USER_ROLE, USER_STATUS } from "../../constants.js";

export interface IOffsetPagination {
    page?: number;
    limit?: number;
}

export interface ITimeBasedPagination {
    from?: Date;
    limit?: number;
}

// Auth
export namespace IReqAuth {
    export interface Login {
        emailOrPhone: string;
        password: string;
    }

    export interface Register {
        name: string;
        email: string;
        password: string;
        phoneNumber?: string;
    }

    export interface ForgotPassword {
        email: string;
    }

    export interface ResetPassword {
        email: string;
        otp: string;
        password: string;
    }
}

// Application
export namespace IReqApplication {
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
        version: string;
        author: string;
        description: string;
        verifyRequired?: boolean;
        protocol: string;
        origin: string;
        basePath: string;
        paradigm: SUPPORTED_PARADIGM;
    }

    export interface Register {
        name: string;
        version: string;
        author: string;
        description: string;
        verifyRequired?: boolean;
        protocol: string;
        origin: string;
        basePath: string;
        paradigm: SUPPORTED_PARADIGM;
    }

    export interface Update {
        name?: string;
        version?: string;
        author?: string;
        description?: string;
        verifyRequired?: boolean;
        protocol?: string;
        origin?: string;
        basePath?: string;
        paradigm?: SUPPORTED_PARADIGM;
    }
}

// User
export namespace IReqUser {
    export interface GetAllQuery {
        page?: string;
        limit?: string;

        searchTerm?: string;
        roles?: USER_ROLE[];
        statuses?: USER_STATUS[];
    }

    export interface Filter {
        searchTerm?: string;
        roles?: USER_ROLE[];
        statuses?: USER_STATUS[];
    }

    export interface Insert {
        name: string;
        email: string;
        password?: string;
        phoneNumber?: string;
        avatarUrl?: string;
        socialMediaAccounts?: ISocialMediaAccount[];
    }

    export interface Update {
        name?: string;
        password?: string;
        phoneNumber?: string;
        avatarUrl?: string;
        socialMediaAccounts?: ISocialMediaAccount[];
    }
}

export namespace IReqClass {
    export interface GetAllQuery {
        page?: string;
        limit?: string;

        searchTerm?: string;
        schoolId: string;
    }

    export interface Filter {
        searchTerm?: string;
        schoolId: string;
    }

    export interface Insert {
        name: string;
        creatorId: string;
        schoolId?: string;
        avatarUrl?: string;
    }

    export interface Update {
        name?: string;
        avatarUrl?: string;
    }
}
