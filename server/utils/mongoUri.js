const DEFAULT_DB_NAME = "villfresh";

export function getMongoUri() {
  const rawUri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/villfresh";
  const dbName = process.env.MONGODB_DB_NAME || DEFAULT_DB_NAME;

  const [base, query = ""] = rawUri.split("?");
  const hostAndPath = base.replace(/^mongodb(\+srv)?:\/\//, "");
  const slashIndex = hostAndPath.indexOf("/");

  if (slashIndex === -1) {
    return `${base}/${dbName}${query ? `?${query}` : ""}`;
  }

  const pathAfterHost = hostAndPath.slice(slashIndex + 1);
  if (!pathAfterHost) {
    return `${base}${dbName}${query ? `?${query}` : ""}`;
  }

  return rawUri;
}
