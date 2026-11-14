import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/app/actions/auth";

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(100).optional(),
  body: z.string().trim().min(5).max(2000),
  guestName: z.string().trim().max(100).optional(),
  guestEmail: z.string().trim().email().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const json = await request.json();
    const input = reviewSchema.parse(json);

    let userId = session?.id;

    if (!userId) {
      if (!input.guestEmail) {
        return NextResponse.json({ error: "Please sign in or provide your email to submit a review." }, { status: 401 });
      }
      // Find or create guest user
      const guestEmail = input.guestEmail.toLowerCase();
      let user = await db.user.findUnique({ where: { email: guestEmail } });
      if (!user) {
        user = await db.user.create({
          data: {
            name: input.guestName || "Guest Reviewer",
            email: guestEmail,
            role: "CUSTOMER",
          },
        });
      }
      userId = user.id;
    }

    const review = await db.review.create({
      data: {
        userId,
        productId: input.productId,
        rating: input.rating,
        title: input.title || null,
        body: input.body,
        approved: false, // Moderated by default in admin panel
      },
    });

    return NextResponse.json(
      {
        id: review.id,
        message: "Thank you for your review! It will appear on the site once approved by our team.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Please complete all review fields with a rating between 1 and 5." }, { status: 400 });
    }
    console.error("Review submission error:", error);
    return NextResponse.json({ error: "Unable to submit your review. Please try again." }, { status: 500 });
  }
}
