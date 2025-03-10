// Mail
export namespace IReqMail {
    export interface SendForgotOTP {
        email: string;
        otp: number;
    }

    export interface Recipient {
        email: string;
        role: string;
        expiredAt: Date;
        navigateUrl: string;
        name: string;
    }

    export interface SendInvitation {
        recipients: Recipient[];
        senderName: string;
        groupName: string;
        groupType: string;
    }
}
