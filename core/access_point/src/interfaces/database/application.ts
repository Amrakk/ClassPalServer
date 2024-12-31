import type { ObjectId } from "mongooat";
import type { SUPPORTED_PARADIGM } from "../../constants.js";

export interface IApplication {
    _id: ObjectId;
    name: string;
    version: string;
    description: string;
    author: string;
    verifyRequired: boolean;
    protocol: string;
    origin: string;
    basePath: string;
    paradigm: SUPPORTED_PARADIGM;
}
