import type { ObjectId } from "mongooat";

export interface IInvitation {
    _id: ObjectId;
    email: string;
    profileId: ObjectId;
    senderId: ObjectId;
    createdAt: Date;
}
