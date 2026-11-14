import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactMessageNotification } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  message: z.string().trim().min(5).max(3000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = contactSchema.parse(body);

    await sendContactMessageNotification(input);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Please enter a valid name, email, and message." }, { status: 400 });
    }
    console.error("Contact form submission error:", error);
    return NextResponse.json({ error: "Unable to send your message right now." }, { status: 500 });
  }
}
