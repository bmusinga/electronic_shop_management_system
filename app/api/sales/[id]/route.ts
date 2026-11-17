import {
  assertSameOrigin,
  jsonError,
  readJson,
  requireNumber,
  requireString,
} from "@/lib/api";
import { deleteSale, updateSale } from "@/lib/firestore-admin";
import { requireAdmin } from "@/lib/session";
import type { SaleInput } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface SaleBody {
  productId?: unknown;
  productName?: unknown;
  quantity?: unknown;
  unitPrice?: unknown;
}

function parseSaleInput(body: SaleBody): SaleInput {
  const productId = requireString(body.productId, "Product", 200);
  const productName = requireString(body.productName, "Product name", 200);
  const quantity = requireNumber(body.quantity, "quantity", {
    min: 1,
    integer: true,
  });
  const unitPrice = requireNumber(body.unitPrice, "unit price", { min: 0 });
  const total = Math.round(quantity * unitPrice * 100) / 100;

  return { productId, productName, quantity, unitPrice, total };
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const { id } = await context.params;
    const body = await readJson<SaleBody>(request);
    await updateSale(id, parseSaleInput(body));
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
    await deleteSale(id);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
