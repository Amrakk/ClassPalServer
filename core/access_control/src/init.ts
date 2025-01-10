import RoleService from "./services/internal/role.js";
import AccessPointService from "./services/external/accessPoint.js";

export default async function init() {
    await AccessPointService.serviceRegistry();
    await RoleService.init();
}
