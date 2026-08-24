import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

const schema = z.object({ url: z.string().url(), alt: z.string().max(200).optional(), filename: z.string().max(200).optional() });
export async function GET() { if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); return NextResponse.json(await db.mediaAsset.findMany({ orderBy: { createdAt: "desc" } })); }
export async function POST(request: Request) { if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); try { return NextResponse.json(await db.mediaAsset.create({ data: schema.parse(await request.json()) }), { status: 201 }); } catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ error: "Enter a valid image URL." }, { status: 400 }); return NextResponse.json({ error: "Unable to save media." }, { status: 500 }); } }
