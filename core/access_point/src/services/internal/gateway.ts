import { BASE_PATH } from "../../constants.js";
import { verify } from "../../middlewares/verify.js";
import { createProxyMiddleware } from "http-proxy-middleware";

import type { Router } from "express";
import type { IApplication } from "../../interfaces/database/application.js";

export default class ApiGateway {
    private gatewayRouter: Router;

    constructor(router: Router) {
        this.gatewayRouter = router;
    }

    public async init(applications: IApplication[]) {
        const coreApplications = ["Access Point", "Access Control", "Communication"];

        applications.forEach((app) => {
            if (coreApplications.includes(app.name)) return;

            const proxyPath = `${BASE_PATH}/${app.name.toLowerCase().replaceAll(" ", "-")}`;

            const proxy = createProxyMiddleware({
                target: `${app.origin}${app.basePath}`,
                changeOrigin: true,
                pathRewrite: (path) => path.replace(proxyPath, app.basePath),
            });

            this.gatewayRouter.use(proxyPath, app.verifyRequired ? verify() : (_, __, next) => next(), proxy);
        });
    }

    // TODO: test this method
    public async addApplications(newApplications: IApplication[]) {
        newApplications.forEach((newApplication) => {
            const proxyPath = `${BASE_PATH}/${newApplication.name.toLowerCase().replaceAll(" ", "-")}`;
            const proxy = createProxyMiddleware({
                target: `${newApplication.origin}${newApplication.basePath}`,
                changeOrigin: true,
                pathRewrite: (path) => path.replace(proxyPath, newApplication.basePath),
            });

            this.gatewayRouter.use(
                proxyPath,
                newApplication.verifyRequired ? verify() : (_, __, next) => next(),
                proxy
            );
        });
    }

    // TODO: test this method
    public async updateApplication(applicationName: string, newApplication: IApplication) {
        const proxyPath = `${BASE_PATH}/${applicationName.toLowerCase().replaceAll(" ", "-")}`;
        this.gatewayRouter.stack = this.gatewayRouter.stack.filter((layer: any) => {
            const pathMatch = layer?.route?.path?.startsWith(proxyPath);
            return !pathMatch;
        });

        const newProxyPath = `${BASE_PATH}/${newApplication.name.toLowerCase().replaceAll(" ", "-")}`;
        const proxyMiddleware = createProxyMiddleware({
            target: `${newApplication.origin}${newApplication.basePath}`,
            changeOrigin: true,
            pathRewrite: (path) => path.replace(newProxyPath, newApplication.basePath),
        });

        this.gatewayRouter.use(
            newProxyPath,
            newApplication.verifyRequired ? verify() : (_, __, next) => next(),
            proxyMiddleware
        );
    }

    // TODO: test this method
    public async removeApplication(applicationName: string) {
        this.gatewayRouter.stack = this.gatewayRouter.stack.filter((layer: any) => {
            const proxyPath = `${applicationName.toLowerCase().replaceAll(" ", "-")}`;
            return !layer?.route?.path?.startsWith(proxyPath);
        });
    }
}
