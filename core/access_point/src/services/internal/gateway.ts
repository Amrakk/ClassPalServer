import { verify } from "../../middlewares/verify.js";
import { createProxyMiddleware } from "http-proxy-middleware";

import type { Router, Request } from "express";
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

            const proxyPath = `/${app.name.toLowerCase().replaceAll(" ", "-")}`;

            const proxy = createProxyMiddleware({
                target: `${app.origin}${app.basePath}`,
                changeOrigin: true,
                pathRewrite: (path) => path.replace(proxyPath, app.basePath),
                on: {
                    proxyReq: (proxyReq, req, res) => {
                        try {
                            proxyReq.setHeader("x-user-id", `${(req as Request).ctx.user._id ?? ""}`);
                            proxyReq.setHeader("x-user-role", `${(req as Request).ctx.user.role ?? ""}`);
                        } catch (e) {
                            proxyReq.setHeader("x-error", `1`);
                        }
                    },
                },
            });

            this.gatewayRouter.use(proxyPath, app.verifyRequired ? verify() : (_, __, next) => next(), proxy);
        });
    }

    public async addApplications(newApplications: IApplication[]) {
        newApplications.forEach((newApplication) => {
            const proxyPath = `/${newApplication.name.toLowerCase().replaceAll(" ", "-")}`;
            const proxy = createProxyMiddleware({
                target: `${newApplication.origin}${newApplication.basePath}`,
                changeOrigin: true,
                pathRewrite: (path) => path.replace(proxyPath, newApplication.basePath),
                on: {
                    proxyReq: (proxyReq, req, res) => {
                        try {
                            proxyReq.setHeader("x-user-id", `${(req as Request).ctx.user._id ?? ""}`);
                            proxyReq.setHeader("x-user-role", `${(req as Request).ctx.user.role ?? ""}`);
                        } catch (e) {
                            proxyReq.setHeader("x-error", `1`);
                        }
                    },
                },
            });

            this.gatewayRouter.use(
                proxyPath,
                newApplication.verifyRequired ? verify() : (_, __, next) => next(),
                proxy
            );
        });
    }

    public async updateApplication(applicationName: string, newApplication: IApplication) {
        this.removeApplication(applicationName);

        const newProxyPath = `/${newApplication.name.toLowerCase().replaceAll(" ", "-")}`;
        const proxyMiddleware = createProxyMiddleware({
            target: `${newApplication.origin}${newApplication.basePath}`,
            changeOrigin: true,
            pathRewrite: (path) => path.replace(newProxyPath, newApplication.basePath),
            on: {
                proxyReq: (proxyReq, req, res) => {
                    try {
                        proxyReq.setHeader("x-user-id", `${(req as Request).ctx.user._id ?? ""}`);
                        proxyReq.setHeader("x-user-role", `${(req as Request).ctx.user.role ?? ""}`);
                    } catch (e) {
                        proxyReq.setHeader("x-error", `1`);
                    }
                },
            },
        });

        this.gatewayRouter.use(
            newProxyPath,
            newApplication.verifyRequired ? verify() : (_, __, next) => next(),
            proxyMiddleware
        );
    }

    public async removeApplication(applicationName: string) {
        const proxyPath = `${applicationName.toLowerCase().replaceAll(" ", "-")}`;

        this.gatewayRouter.stack = this.gatewayRouter.stack.filter((layer: any) => {
            const layerPath = layer?.route?.path || layer?.regexp?.toString();
            return !layerPath?.includes(proxyPath);
        });
    }
}
