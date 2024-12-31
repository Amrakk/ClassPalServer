import { COMMUNICATION_API_URL } from "../../constants.js";

import ServiceResponseError from "../../errors/ServiceResponseError.js";

export default class CommunicationService {
    public static async sendForgotOTP(email: string, otp: number): Promise<void> {
        const data = JSON.stringify({ email, otp });

        return fetch(`${COMMUNICATION_API_URL}/mail/send-forgot-otp`, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: data,
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.code !== 0)
                    throw new ServiceResponseError(
                        "CommunicationService",
                        "sendForgotOTP",
                        "Failed to send OTP to email",
                        res
                    );
            });
    }
}
