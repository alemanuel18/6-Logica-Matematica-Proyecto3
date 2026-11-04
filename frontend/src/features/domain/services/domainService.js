export const parseDomain = (text) =>
  text
    .split(/[,\n]/)
    .map((value) => value.trim())
    .filter(Boolean);
