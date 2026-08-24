import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const enquirySchema = z.object({
  businessName: z.string().trim().min(2).max(120), contactName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(8).max(20), email: z.string().email(), location: z.string().trim().min(2).max(120),
  gstNumber: z.string().trim().max(30).optional(), products: z.string().trim().max(500).optional(),
  expectedQuantity: z.coerce.number().int().positive().max(100000).optional(), message: z.string().trim().max(2000).optional(),
});

export async function POST(request: Request) {
  try {
    const input = enquirySchema.parse(await request.json());
    const enquiry = await db.wholesaleEnquiry.create({ data: input });
    return NextResponse.json({ id: enquiry.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the enquiry details." }, { status: 400 });
    return NextResponse.json({ error: "Unable to save enquiry." }, { status: 500 });
  }
}
