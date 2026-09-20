import { uploadImageToDrive } from "@/lib/drive-server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return Response.json({ error: "No file provided." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImageToDrive(
      buffer,
      file.type || "image/jpeg",
      file.name || `product-${Date.now()}.jpg`
    );
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Could not upload the image." },
      { status: 500 }
    );
  }
}