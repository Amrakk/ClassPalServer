import type { ObjectId } from "mongooat";
import type { Model } from "mongooat/build/model.js";

export async function isIdsExist(model: Model<any, any>, ids: ObjectId[]): Promise<boolean> {
    return model.countDocuments({ _id: { $in: ids } }).then((count) => count === ids.length);
}
