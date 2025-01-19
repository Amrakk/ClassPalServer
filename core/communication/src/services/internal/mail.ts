import fs from "fs";
import path from "path";
import { createTransport } from "nodemailer";
import { formatDate } from "../../utils/formatDate.js";
import { EMAIL, EMAIL_PASS, APP_NAME } from "../../constants.js";

import type { IReqMail } from "../../interfaces/api/request.js";

export default class MailService {
    public static async sendForgotOTP(email: string, otp: number) {
        const transporter = createTransport({
            service: "gmail",
            auth: {
                user: EMAIL,
                pass: EMAIL_PASS,
            },
        });

        const absPath = path.join(process.cwd(), "templates", "forgotPassword.html");
        let html = await fs.promises.readFile(absPath, "utf8");
        html = html.replace("{{ OTP }}", otp.toString());
        html = html.replaceAll("{{ appName }}", APP_NAME);

        const mailOptions = {
            from: `${APP_NAME} <${EMAIL}>`,
            to: email,
            subject: "Reset Password",
            html,
        };

        await transporter.sendMail(mailOptions);
    }

    public static async sendInvitation(data: IReqMail.SendInvitation) {
        const transporter = createTransport({
            service: "gmail",
            auth: {
                user: EMAIL,
                pass: EMAIL_PASS,
            },
        });

        const absPath = path.join(process.cwd(), "templates", "groupInvitation.html");
        const template = await fs.promises.readFile(absPath, "utf8");

        for (const recipient of data.recipients) {
            let html = template;

            html = html.replaceAll("{{ appName }}", APP_NAME);
            html = html.replace("{{ recipientName }}", recipient.name);
            html = html.replace("{{ senderName }}", data.senderName);
            html = html.replace("{{ groupName }}", data.groupName);
            html = html.replace("{{ role }}", recipient.role);
            html = html.replace("{{ expiredAt }}", formatDate(recipient.expiredAt));
            html = html.replace("{{ navigateUrl }}", recipient.navigateUrl);

            const mailOptions = {
                from: `${APP_NAME} <${EMAIL}>`,
                to: recipient.email,
                subject: `Invitation to Join ${data.groupName}`,
                html,
            };

            transporter.sendMail(mailOptions);
        }
    }
}
