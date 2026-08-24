import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

const schema = z.object({ status: z.enum(["NEW", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"]) });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); try { const input = schema.parse(await request.json()); return NextResponse.json(await db.order.update({ where: { id: (await params).id }, data: { status: input.status } })); } catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid order status." }, { status: 400 }); return NextResponse.json({ error: "Unable to update order." }, { status: 500 }); } }
