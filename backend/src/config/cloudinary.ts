import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "../utils/http";

let configured = false;

function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new ApiError("Image storage is not configured", 503);
  }

  if (!configured) {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
    configured = true;
  }

  return cloudinary;
}

export function uploadProductImage(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const uploader = getCloudinary().uploader.upload_stream(
        { folder: "maison/products", resource_type: "image", transformation: [{ quality: "auto", fetch_format: "auto" }] },
        (error, result) => {
          if (error || !result?.secure_url) {
            reject(new ApiError("Image upload failed", 502));
            return;
          }
          resolve(result.secure_url);
        },
      );
      uploader.end(buffer);
    } catch (error) {
      reject(error);
    }
  });
}

export function uploadBrandImage(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const uploader = getCloudinary().uploader.upload_stream(
        { folder: "maison/brands", resource_type: "image", transformation: [{ quality: "auto", fetch_format: "auto" }] },
        (error, result) => {
          if (error || !result?.secure_url) {
            reject(new ApiError("Image upload failed", 502));
            return;
          }
          resolve(result.secure_url);
        },
      );
      uploader.end(buffer);
    } catch (error) {
      reject(error);
    }
  });
}
