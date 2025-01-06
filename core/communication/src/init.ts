import AccessPointService from "./services/external/accessPoint.js";

export default async function init() {
    await AccessPointService.serviceRegistry();
}
