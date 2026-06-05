import "server-only";

import { v2 as cloudinary } from "cloudinary";
import {
  getCloudinaryFolder,
  isCloudinaryConfigured,
} from "@/lib/cloudinary/utils";

type UploadOptions = { folder?: string; publicId?: string };

export async function uploadImageBuffer(
  buffer: Buffer,
  options?: UploadOptions
): Promise<{ url: string; publicId: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error("CLOUDINARY_URL non configuré");
  }

  cloudinary.config({ secure: true });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options?.folder ?? getCloudinaryFolder(),
        public_id: options?.publicId,
        resource_type: "image",
        overwrite: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Upload Cloudinary échoué"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    stream.end(buffer);
  });
}

export async function uploadVideoBuffer(
  buffer: Buffer,
  options?: UploadOptions
): Promise<{ url: string; publicId: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error("CLOUDINARY_URL non configuré");
  }

  cloudinary.config({ secure: true });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options?.folder ?? `${getCloudinaryFolder()}/hero`,
        public_id: options?.publicId,
        resource_type: "video",
        overwrite: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Upload vidéo Cloudinary échoué"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    stream.end(buffer);
  });
}
