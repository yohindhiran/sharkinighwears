import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) { if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); await db.mediaAsset.delete({ where: { id: (await params).id } }); return NextResponse.json({ ok: true }); }
