import { deleteDriveFile } from "@/lib/drive-server";

export async function DELETE(_request, { params }) {
  const { fileId } = await params;
  try {
    await deleteDriveFile(fileId);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json(
      { error: err?.message || "Could not delete the file." },
      { status: 500 }
    );
  }
}