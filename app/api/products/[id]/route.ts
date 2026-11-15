import {
  assertSameOrigin,
  jsonError,
  optionalString,
  readJson,
  requireNumber,
  requireString,
} from "@/lib/api";
import {
  deleteProduct,
  getProduct,
  updateProduct,
} from "@/lib/firestore-admin";
import { AuthError, requireAdmin } from "@/lib/session";
import type { ProductInput } from "@/lib/types";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface ProductBody {
  name?: unknown;
  description?: unknown;
  price?: unknown;
  category?: unknown;
  stock?: unknown;
  image?: unknown;
  driveFileId?: unknown;
}

function parseProductInput(body: ProductBody): ProductInput {
  return {
    name: requireString(body.name, "Name", 200),
    description: optionalString(body.description, 4000),
    price: requireNumber(body.price, "price", { min: 0 }),
    category: requireString(body.category, "Category", 100),
    stock: requireNumber(body.stock, "stock", { min: 0, integer: true }),
    image: optionalString(body.image, 2000),
    driveFileId: optionalString(body.driveFileId, 200),
  };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const product = await getProduct(id);
    if (!product) {
      throw new AuthError(404, "Product not found.");
    }
    return Response.json(product, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const { id } = await context.params;
    const existing = await getProduct(id);
    if (!existing) {
      throw new AuthError(404, "Product not found.");
    }

    const body = await readJson<ProductBody>(request);
    await updateProduct(id, parseProductInput(body));
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const { id } = await context.params;
    const product = await deleteProduct(id);
    if (!product) {
      throw new AuthError(404, "Product not found.");
    }
    return Response.json({ product });
  } catch (error) {
    return jsonError(error);
  }
}
