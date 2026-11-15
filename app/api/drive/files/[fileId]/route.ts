import { assertSameOrigin, jsonError } from "@/lib/api";
import { deleteDriveFile } from "@/lib/drive-server";
import { AuthError, requireAdmin } from "@/lib/session";

interface RouteContext {
  params: Promise<{ fileId: string }>;
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    assertSameOrigin(request);
    await requireAdmin();

    const { fileId } = await params;
    if (!fileId) {
      throw new AuthError(400, "Missing file id.");
    }

    await deleteDriveFile(fileId);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error, "Could not delete the file.");
  }
}
