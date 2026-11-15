import {
  assertSameOrigin,
  jsonError,
  readJson,
  requireNumber,
  requireString,
} from "@/lib/api";
import { listSales, recordSale } from "@/lib/firestore-admin";
import { requireAdmin } from "@/lib/session";
import type { SaleInput } from "@/lib/types";

export const dynamic = "force-dynamic";

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

export async function GET() {
  try {
    await requireAdmin();
    return Response.json(await listSales(), {
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
    const body = await readJson<SaleBody>(request);
    const input = parseSaleInput(body);
    await recordSale(input.productId, input);
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
