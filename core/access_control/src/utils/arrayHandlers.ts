import { ObjectId } from "mongooat";

export function getUniqueArray<T>(array: T[], comparison?: (a: T, b: T) => boolean): T[] {
    if (array.length > 0 && array[0] instanceof ObjectId) comparison = (a: T, b: T) => `${a}` === `${b}`;

    return array.filter(
        (value, index, self) => self.findIndex((t) => (comparison ? comparison(t, value) : t === value)) === index
    );
}

export function isDuplicate<T>(array: T[]): boolean {
    return array.length !== new Set(array).size;
}
