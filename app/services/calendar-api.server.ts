import { z } from "zod"
import { getSafeEnv } from "../lib/get-safe-env";

export const getCalendars = async () => {
  const responseSchema = z.object({
    apartments: z.array(z.object({
      calendar_iframe: z.string(),
      calendar_script: z.string(),
      id: z.number(),
      link: z.string().url(),
      og_image: z.string().url(),
      price: z.coerce.number(),
    })),
  });

  const baseUrl = getSafeEnv("CALENDAR_API_URL");
  const res = await fetch(`${baseUrl}/api/data`);
  const jsonResponse = await res.json();
  return responseSchema.safeParse(jsonResponse);
}
