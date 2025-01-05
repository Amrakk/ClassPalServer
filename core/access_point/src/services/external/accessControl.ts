import { ACCESS_CONTROL_API_URL } from "../../constants.js";

import ServiceResponseError from "../../errors/ServiceResponseError.js";

import type { IResponse } from "../../interfaces/api/response.js";
import type { IRole, IRoleSimplified } from "../../interfaces/services/external/accessControl.js";

export default class AccessControlService {
    public static async getRoles(): Promise<IRoleSimplified[]> {
        return fetch(`${ACCESS_CONTROL_API_URL}/roles`, { method: "GET" })
            .then((res) => res.json())
            .then((res: IResponse<{ roles: IRole[]; totalDocuments: number }>) => {
                if (res.code !== 0)
                    throw new ServiceResponseError("AccessControlService", "getRoles", "Failed to get roles", res);

                return res.data?.roles.map(({ privileges, parents, ...role }) => role) ?? [];
            });
    }
}
