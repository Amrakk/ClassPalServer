import ServiceResponseError from "../../errors/ServiceResponseError.js";
import { ACCESS_POINT_API_URL, APP_REGISTRY_KEY, BASE_PATH, ORIGIN } from "../../constants.js";

export default class AccessPointService {
    public static async serviceRegistry(): Promise<void> {
        const isDev = process.env.ENV === "development";

        const data = JSON.stringify({
            author: "Amrakk",
            basePath: BASE_PATH,
            name: "Access Control",
            description: "Access Control service is responsible for managing the access to the services and resources.",
            protocol: isDev ? "http" : "https",
            origin: ORIGIN,
            version: "0.0.0",
            paradigm: 0,
        });

        const retry = async (retries: number): Promise<void> => {
            try {
                const res = await fetch(`${ACCESS_POINT_API_URL}/applications/register`, {
                    headers: {
                        "x-app-registry-key": APP_REGISTRY_KEY,
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: data,
                });

                const jsonResponse = await res.json();

                if (jsonResponse.code !== 0) {
                    throw new ServiceResponseError(
                        "AccessPointService",
                        "serviceRegistry",
                        "Failed to register service",
                        jsonResponse
                    );
                }
            } catch (error) {
                if (retries > 0) {
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                    return retry(retries - 1);
                } else {
                    throw error;
                }
            }
        };

        await retry(3);
    }
}
