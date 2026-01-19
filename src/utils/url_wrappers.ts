import config from "@/config";

// Check if string is already a URL
const isUrl = (str: string) => {
    return str.startsWith("http://") || str.startsWith("https://");
};

// Wrap filename with Uploads
export const wrapFilename = (
    filename: string | undefined | null,
    key: "uploads" | "stream" = "uploads",
) => {
    if (!filename) return;
    if (isUrl(filename)) return filename;

    const wrapped = `${key === "uploads" ? config.url.uploads : config.url.stream}/${filename}`;
    return wrapped;
};

export const wrapFilenames = (
    filenames: string[],
    key: "uploads" | "stream" = "uploads",
): string[] => {
    if (!Array.isArray(filenames)) return [];

    return filenames.map((filename) => wrapFilename(filename, key));
};

// Unwrap Filenames to Uploads
export const unwrapFilename = (url: string): string => {
    if (!url) return "";
    if (!isUrl(url)) return url;

    const parts = url.split("/");
    return parts[parts.length - 1];
};

// Unwrap Filenames to Uploads
export const unwrapFilenames = (urls: string[]): string[] => {
    if (!Array.isArray(urls)) return [];

    return urls.map(unwrapFilename);
};
