import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendWholesaleEnquiryNotification } from "@/lib/email";

const enquirySchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  contactName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(8).max(20),
  email: z.string().email(),
  location: z.string().trim().min(2).max(120),
  gstNumber: z.string().trim().max(30).optional(),
  products: z.string().trim().max(500).optional(),
  expectedQuantity: z.coerce.number().int().positive().max(100000).optional(),
  message: z.string().trim().max(2000).optional(),
});

export async function POST(request: Request) {
  try {
    const input = enquirySchema.parse(await request.json());
    const enquiry = await db.wholesaleEnquiry.create({ data: input });

    // Non-blocking email alert to admin
    sendWholesaleEnquiryNotification(input).catch((err) =>
      console.error("Failed to send wholesale notification email:", err)
    );

    return NextResponse.json({ id: enquiry.id, success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Please check the enquiry details and required fields." }, { status: 400 });
    }
    console.error("Wholesale enquiry error:", error);
    return NextResponse.json({ error: "Unable to save enquiry. Please try again." }, { status: 500 });
  }
}
