import {
  assertSameOrigin,
  jsonError,
  optionalString,
  readJson,
  requireNumber,
  requireString,
} from "@/lib/api";
import { createProduct, listProducts } from "@/lib/firestore-admin";
import { requireAdmin } from "@/lib/session";
import type { ProductInput } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ProductBody {
  name?: unknown;
  description?: unknown;
  price?: unknown;
  category?: unknown;
  stock?: unknown;
  image?: unknown;
  driveFileId?: unknown;
  isOffer?: unknown;
  percentOff?: unknown;
}

function parseProductInput(body: ProductBody): ProductInput {
  return {
    name: requireString(body.name, "Name", 200),
    description: optionalString(body.description, 4000),
    price: requireNumber(body.price, "price", { min: 1 }),
    category: requireString(body.category, "Category", 100),
    stock: requireNumber(body.stock, "stock", { min: 1, integer: true }),
    image: optionalString(body.image, 2000),
    driveFileId: optionalString(body.driveFileId, 200),
    isOffer: body.isOffer === true,
    percentOff:
      body.isOffer === true
        ? requireNumber(body.percentOff ?? 0, "percent off", { min: 1, max: 100 })
        : 0,
  };
}

export async function GET() {
  try {
    return Response.json(await listProducts(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const body = await readJson<ProductBody>(request);
    const id = await createProduct(parseProductInput(body));
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
