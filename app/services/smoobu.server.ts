import { z } from "zod";
import { getSafeEnv } from "../lib/get-safe-env";

export const getApartments = async () => {
  const responseSchema = z.array(z.object({
    id: z.number(),
    name: z.string(),
  }));

  const apiKey = getSafeEnv("SMOOBU_API_KEY");
  const res = await fetch("https://login.smoobu.com/api/apartments", {
    headers: {
      "Api-Key": apiKey,
      "Cache-Control": "no-cache",
    },
  });
  const jsonResponse = await res.json();
  return responseSchema.safeParse(jsonResponse.apartments);
}

export const getApartment = async (id: number) => {
  const responseSchema = z.object({
    id: z.number(),
    name: z.string(),
    location: z.object({
      country: z.string(),
    }),
    rooms: z.object({
      maxOccupancy: z.number(),
    }),
  });

  const apiKey = getSafeEnv("SMOOBU_API_KEY");
  const res = await fetch(`https://login.smoobu.com/api/apartments/${id}`, {
    headers: {
      "Api-Key": apiKey,
      "Cache-Control": "no-cache",
    }
  });
  const jsonResponse = await res.json();
  return responseSchema.safeParse(jsonResponse);
}

export const getBookings = async ({ apartmentId, pageSize }: { apartmentId?: number; pageSize?: number }) => {
  const responseSchema = z.object({
    page_count: z.number(),
    page_size: z.number(),
    total_items: z.number(),
    page: z.number(),
    bookings: z.array(z.object({
      id: z.number(),
    })),
  });

  const url = new URL("https://login.smoobu.com/api/reservations");
  if (typeof apartmentId !== "undefined") {
    url.searchParams.append("apartmentId", apartmentId.toString());
  }
  if (typeof pageSize !== "undefined") {
    url.searchParams.append("pageSize", pageSize.toString());
  }

  const apiKey = getSafeEnv("SMOOBU_API_KEY");
  const res = await fetch(url, {
    headers: {
      "Api-Key": apiKey,
      "Cache-Control": "no-cache",
    }
  });
  const jsonResponse = await res.json();
  return responseSchema.safeParse(jsonResponse);
}
