import { deleteDriveFile } from "@/lib/drive-server";

interface RouteContext {
  params: Promise<{ fileId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { fileId } = await params;
  try {
    await deleteDriveFile(fileId);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Could not delete the file." },
      { status: 500 }
    );
  }
}