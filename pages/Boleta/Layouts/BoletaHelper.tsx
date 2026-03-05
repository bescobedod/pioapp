export const formatString = (text: string): string => {
    return text
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    // return text
    //     .replace(/_/g, " ")
    //     .replace(/^./, (char) => char.toUpperCase());
}