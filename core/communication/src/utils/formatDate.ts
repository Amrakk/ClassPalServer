export function formatDate(date: number | string | Date): string {
    let formattedDate;

    if (typeof date === "string") formattedDate = new Date(Date.parse(date));
    else if (typeof date === "number") formattedDate = new Date(date);
    else formattedDate = date;

    return formattedDate.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}
