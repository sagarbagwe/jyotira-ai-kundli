import "server-only";

import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { fileTypeFromBuffer } from "file-type";
import { env } from "@/lib/env";

const ALLOWED = new Map([
  ["application/pdf", "pdf"],
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
]);

export interface ValidatedUpload {
  bytes: Uint8Array;
  mimeType: string;
  extension: string;
  safeName: string;
  sha256: string;
}

function safeFilename(name: string, extension: string) {
  const stem = path
    .basename(name, path.extname(name))
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${stem || "kundli"}.${extension}`;
}

export async function validateKundliUpload(file: File): Promise<ValidatedUpload> {
  const maxBytes = env.MAX_UPLOAD_MB * 1024 * 1024;
  if (file.size <= 0) throw new Error("The uploaded file is empty.");
  if (file.size > maxBytes) {
    throw new Error(`File exceeds the ${env.MAX_UPLOAD_MB} MB upload limit.`);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(bytes);
  if (!detected || !ALLOWED.has(detected.mime)) {
    throw new Error("Only genuine PDF, PNG, JPG, or JPEG files are accepted.");
  }
  if (!ALLOWED.has(file.type) || file.type !== detected.mime) {
    throw new Error(
      "The file content does not match its declared type. Please export it again and retry.",
    );
  }

  const extension = ALLOWED.get(detected.mime)!;
  return {
    bytes,
    mimeType: detected.mime,
    extension,
    safeName: safeFilename(file.name, extension),
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}

export function uploadStorageKey(userId: string, extension: string) {
  const safeUser = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `kundli-uploads/${safeUser}/${new Date().getUTCFullYear()}/${randomUUID()}.${extension}`;
}