import { ZodObjectId } from "mongooat";
import { apiGateway } from "../../init.js";
import redis from "../../database/redis.js";
import { ApplicationModel } from "../../database/models/application.js";
import { removeUndefinedKeys } from "../../utils/removeUndefinedKeys.js";

import NotFoundError from "../../errors/NotFoundError.js";

import type { ObjectId } from "mongooat";
import type { IApplication } from "../../interfaces/database/application.js";
import type { IOffsetPagination, IReqApplication } from "../../interfaces/api/request.js";
import BaseError from "../../errors/BaseError.js";
import ServiceResponseError from "../../errors/ServiceResponseError.js";

export default class ApplicationService {
    private static cacheKey = "applications";

    // Query
    public static async getAll(query: IReqApplication.Filter & IOffsetPagination): Promise<[IApplication[], number]> {
        const cache = redis.getRedis();
        const { page, limit, searchTerm } = query;

        if (!page && !limit && !searchTerm) {
            const applications = JSON.parse((await cache.get(this.cacheKey)) ?? "null") as IApplication[] | null;
            if (applications) return [applications, applications.length];
        }

        const skip = ((page ?? 1) - 1) * (limit ?? 0);

        const filter = {
            $or: searchTerm
                ? [
                      { name: { $regex: searchTerm, $options: "i" } },
                      { version: { $regex: searchTerm, $options: "i" } },
                      { author: { $regex: searchTerm, $options: "i" } },
                      { description: { $regex: searchTerm, $options: "i" } },
                  ]
                : undefined,
        };

        const cleanedFilter = removeUndefinedKeys(filter);

        const [applications, totalDocuments] = await Promise.all([
            ApplicationModel.collection
                .find(cleanedFilter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit ?? 0)
                .toArray(),
            ApplicationModel.countDocuments(cleanedFilter),
        ]);

        if (!page && !limit && !searchTerm)
            await cache.set(this.cacheKey, JSON.stringify(applications), "EX", 60 * 60 * 24);
        return [applications, totalDocuments];
    }

    public static async getById(id: string | ObjectId): Promise<IApplication | null> {
        const result = await ZodObjectId.safeParseAsync(id);
        if (result.error) throw new NotFoundError("Application not found");

        return ApplicationModel.findById(result.data);
    }

    public static async getByName(name: string): Promise<IApplication | null> {
        return ApplicationModel.findOne({ name });
    }

    // Mutation
    public static async insert(data: IReqApplication.Insert[]): Promise<IApplication[]> {
        const newApplications = await ApplicationModel.insertMany(data);
        const cache = redis.getRedis();
        const cachedApplications = JSON.parse((await cache.get(this.cacheKey)) ?? "[]") as IApplication[];

        cachedApplications.push(...newApplications);
        await cache.set(this.cacheKey, JSON.stringify(cachedApplications), "EX", 60 * 60 * 24);

        if (!apiGateway)
            throw new ServiceResponseError("Access Point", "Application Insert", "ApiGateway is not initialized");
        await apiGateway.addApplications(newApplications);

        return newApplications;
    }

    public static async updateById(id: string | ObjectId, data: IReqApplication.Update): Promise<IApplication> {
        const result = await ZodObjectId.safeParseAsync(id);
        if (result.error) throw new NotFoundError("Application not found");

        const updatedApplication = await ApplicationModel.findByIdAndUpdate(result.data, data, {
            returnDocument: "after",
        });
        if (!updatedApplication) throw new NotFoundError("Application not found");

        const cache = redis.getRedis();
        const applications = JSON.parse((await cache.get(this.cacheKey)) ?? "[]") as IApplication[];

        const index = applications.findIndex((app) => app._id === updatedApplication._id);
        applications[index] = updatedApplication;
        await cache.set(this.cacheKey, JSON.stringify(applications), "EX", 60 * 60 * 24);

        if (data.basePath || data.origin || data.name || data.verifyRequired !== undefined) {
            if (!apiGateway)
                throw new ServiceResponseError("Access Point", "Application Update", "ApiGateway is not initialized");
            await apiGateway.updateApplication(updatedApplication.name, updatedApplication);
        }

        return updatedApplication;
    }

    public static async deleteById(id: string | ObjectId): Promise<IApplication> {
        const result = await ZodObjectId.safeParseAsync(id);
        if (result.error) throw new NotFoundError("Application not found");

        const deletedApplication = await ApplicationModel.findByIdAndDelete(result.data);
        if (!deletedApplication) throw new NotFoundError("Application not found");

        const cache = redis.getRedis();
        const applications = JSON.parse((await cache.get(this.cacheKey)) ?? "[]") as IApplication[];

        const index = applications.findIndex((app) => app._id === deletedApplication._id);
        applications.splice(index, 1);
        await cache.set(this.cacheKey, JSON.stringify(applications), "EX", 60 * 60 * 24);

        if (!apiGateway)
            throw new ServiceResponseError("Access Point", "Application Delete", "ApiGateway is not initialized");
        await apiGateway.removeApplication(deletedApplication.name);

        return deletedApplication;
    }
}
