import RoleService from "./services/internal/role.js";
import AccessControlService from "./services/external/accessControl.js";

export default async function init() {
    await AccessControlService.serviceRegistry();
    await RoleService.init();
}
