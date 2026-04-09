import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

let activeUpload = null;

function toSafeSegment(value) {
  return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function sanitizeFileName(fileName) {
  const normalized = String(fileName || "file")
    .normalize("NFC")
    .replace(/\s+/g, "_")
    .replace(/[^\w\-.\u4e00-\u9fa5]/g, "-")
    .replace(/-+/g, "-")
    .replace(/_+/g, "_")
    .replace(/^[-_.]+|[-_.]+$/g, "");
  return normalized || "file";
}

function createS3Client({ region, endpoint, credentials }) {
  const opts = { region };
  if (endpoint) {
    opts.endpoint = endpoint;
    opts.forcePathStyle = true;
  }
  if (credentials) opts.credentials = credentials;
  return new S3Client(opts);
}

function generateUuid() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

export function buildS3ObjectKey(userId, originalName) {
  // 默认只保留第一层文件夹（userId），并在文件名前加上 uuid 以避免冲突。
  // 若需要保留原先的按日期分层结构，可传入第三个参数 `{ keepStructure: true }`。
  const opts = arguments[2] || {};
  const keepStructure = Boolean(opts.keepStructure);
  const uid = generateUuid();
  const name = String(originalName || "").replace(/^\/+/, "");
  if (keepStructure) {
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(now.getUTCDate()).padStart(2, "0");
    return `${toSafeSegment(userId)}/${yyyy}/${mm}/${dd}/${uid}_${name}`;
  }
  return `${toSafeSegment(userId)}/${uid}_${name}`;
}

export async function uploadFileToS3({
  region,
  bucket,
  endpoint,
  credentials,
  file,
  key,
  queueSize = 4,
  partSize = 8 * 1024 * 1024,
  onProgress,
}) {
  const client = createS3Client({ region, endpoint, credentials });

  const uploader = new Upload({
    client,
    queueSize,
    partSize,
    leavePartsOnError: true,
    params: {
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: file.type || "application/octet-stream",
    },
  });

  activeUpload = uploader;
  if (typeof onProgress === "function") {
    uploader.on("httpUploadProgress", (event) => {
      onProgress({ loaded: event?.loaded || 0, total: event?.total || file.size });
    });
  }

  try {
    const result = await uploader.done();
    return { s3Key: key, etag: result?.ETag ? String(result.ETag).replace(/"/g, "") : undefined, raw: result };
  } finally {
    activeUpload = null;
  }
}

export async function deleteS3Object({
  region,
  bucket,
  endpoint,
  credentials,
  key,
}) {
  const client = createS3Client({ region, endpoint, credentials });
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

export function abortActiveUpload() {
  if (activeUpload) {
    activeUpload.abort();
    activeUpload = null;
  }
}

export function classifyS3Error(error) {
  const statusCode = error?.$metadata?.httpStatusCode || error?.response?.status;
  const code = String(error?.name || error?.Code || error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();

  if (statusCode === 403 && /(expired|token|security token|expire)/.test(`${code} ${message}`)) {
    return { code: "credentials_expired" };
  }

  if (statusCode === 403 || code.includes("accessdenied")) {
    return { code: "permission_error" };
  }

  if (/signature|signing|signaturedoesnotmatch/.test(`${code} ${message}`)) {
    return { code: "signature_error" };
  }

  if (/cors|cros|failed to fetch|networkerror|network error/.test(`${code} ${message}`)) {
    return { code: "cors_error" };
  }

  if (/timeout|network|econn|enotfound|connection/.test(`${code} ${message}`)) {
    return { code: "network_error" };
  }

  return { code: "unknown" };
}
