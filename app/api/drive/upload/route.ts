import { assertSameOrigin, jsonError } from "@/lib/api";
import { uploadImageToDrive } from "@/lib/drive-server";
import { AuthError, requireAdmin } from "@/lib/session";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      throw new AuthError(400, "No image file provided.");
    }

    const mimeType = file.type || "application/octet-stream";
    if (!ALLOWED_TYPES.has(mimeType)) {
      throw new AuthError(
        400,
        "Unsupported image type. Use JPG, PNG, WEBP, or GIF."
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new AuthError(413, "Image is too large. Maximum size is 4 MB.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImageToDrive(
      buffer,
      mimeType,
      file.name || `product-${Date.now()}.jpg`
    );

    return Response.json({
      success: true,
      imageUrl: result.url,
      driveFileId: result.id,
    });
  } catch (error) {
    return jsonError(error, "Could not upload the image.");
  }
}
