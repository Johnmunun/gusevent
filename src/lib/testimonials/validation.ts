import { z } from "zod";

export const testimonialSubmitSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().max(120).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  text: z.string().trim().min(20).max(3000),
  image: z.string().trim().max(500).optional().or(z.literal("")),
});

export const testimonialInviteSchema = z.object({
  quoteId: z.string().min(1),
  sendEmail: z.boolean().optional(),
});

export type TestimonialSubmitInput = z.infer<typeof testimonialSubmitSchema>;
