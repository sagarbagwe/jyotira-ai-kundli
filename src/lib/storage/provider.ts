import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

export interface StoredObject {
  key: string;
  size: number;
  mimeType: string;
}

export interface StorageProvider {
  put(
    key: string,
    bytes: Uint8Array,
    mimeType: string,
    originalName: string,
  ): Promise<StoredObject>;
  signedDownloadUrl(key: string, originalName?: string): Promise<string>;
  read(key: string): Promise<Uint8Array>;
}

class LocalStorageProvider implements StorageProvider {
  private root = path.join(process.cwd(), ".local-storage");

  private resolveKey(key: string) {
    const normalized = path.posix.normalize(key).replace(/^(\.\.(\/|\\|$))+/, "");
    const resolved = path.resolve(this.root, normalized);
    if (!resolved.startsWith(this.root)) {
      throw new Error("Invalid storage key.");
    }
    return resolved;
  }

  async put(
    key: string,
    bytes: Uint8Array,
    mimeType: string,
  ): Promise<StoredObject> {
    const destination = this.resolveKey(key);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes, { mode: 0o600 });
    return { key, size: bytes.byteLength, mimeType };
  }

  async signedDownloadUrl(): Promise<string> {
    throw new Error(
      "Local storage does not expose files over HTTP. Configure STORAGE_DRIVER=s3 for downloadable private objects.",
    );
  }

  async read(key: string) {
    return new Uint8Array(await readFile(this.resolveKey(key)));
  }
}

class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    if (
      !env.S3_BUCKET ||
      !env.S3_ACCESS_KEY_ID ||
      !env.S3_SECRET_ACCESS_KEY
    ) {
      throw new Error("S3 storage configuration is incomplete.");
    }
    this.bucket = env.S3_BUCKET;
    this.client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT || undefined,
      forcePathStyle: env.S3_FORCE_PATH_STYLE,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async put(
    key: string,
    bytes: Uint8Array,
    mimeType: string,
    originalName: string,
  ): Promise<StoredObject> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: bytes,
        ContentType: mimeType,
        ContentDisposition: `attachment; filename="${originalName.replace(/["\r\n]/g, "_")}"`,
        CacheControl: "private, no-store",
      }),
    );
    return { key, size: bytes.byteLength, mimeType };
  }

  signedDownloadUrl(key: string, originalName = "download") {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${originalName.replace(/["\r\n]/g, "_")}"`,
      }),
      { expiresIn: env.SIGNED_URL_TTL_SECONDS },
    );
  }

  async read(key: string) {
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    if (!response.Body) throw new Error("Stored object is empty.");
    return new Uint8Array(await response.Body.transformToByteArray());
  }
}

let storage: StorageProvider | undefined;

export function getStorageProvider() {
  if (!storage) {
    storage =
      env.STORAGE_DRIVER === "s3"
        ? new S3StorageProvider()
        : new LocalStorageProvider();
  }
  return storage;
}