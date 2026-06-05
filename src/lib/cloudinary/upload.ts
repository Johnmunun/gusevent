import "server-only";

import { v2 as cloudinary } from "cloudinary";
import {
  getCloudinaryFolder,
  isCloudinaryConfigured,
} from "@/lib/cloudinary/utils";

export async function uploadImageBuffer(
  buffer: Buffer,
  options?: { folder?: string; publicId?: string }
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
