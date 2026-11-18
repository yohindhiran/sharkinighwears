import { z } from "zod";

/**
 * Accepts:
 * - Empty string, null, or undefined
 * - Relative app paths starting with "/" (e.g. "/api/uploads/abc.jpg" or "/uploads/abc.jpg")
 * - Full http:// or https:// URLs
 */
export const optionalImageUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val) return true;
      if (val.startsWith("/")) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Please provide a valid image URL or uploaded image path." }
  )
  .nullable()
  .optional()
  .transform((val) => val || "");

export const requiredImageUrlSchema = z
  .string()
  .trim()
  .min(1, "Image URL is required")
  .refine(
    (val) => {
      if (val.startsWith("/")) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Please provide a valid image URL or uploaded image path." }
  );
