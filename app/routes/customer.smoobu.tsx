import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { db } from "../db/db.server";
import { authenticator } from "../services/auth.server";
import { getApartment, getBookings } from "../services/smoobu.server";

type PropertyAccessWithBookingsCount = {
  id: number;
  name: string;
  location: {
    country: string;
  };
  rooms: {
    maxOccupancy: number;
  };
  bookingsCount: number;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const userPropertyAccesses = await db.query.propertyAccesses.findMany({
    columns: {
      propertyId: true,
    },
    where: (propertyAccess, { eq }) => eq(propertyAccess.userId, user.id),
    orderBy: (propertyAccess, { asc }) => [asc(propertyAccess.propertyId)],
  });

  const properties: PropertyAccessWithBookingsCount[] = [];
  for (const userPropertyAccess of userPropertyAccesses) {
    const [apartment, bookings] = await Promise.all([
      getApartment(userPropertyAccess.propertyId),
      getBookings({ apartmentId: userPropertyAccess.propertyId, pageSize: 1 }),
    ]);
    if (!apartment.success || !bookings.success) {
      console.error("Invalid response from Smoobu", { apartment, bookings, errors: bookings.success ? undefined : bookings.error });
      throw new Response("Invalid response from Smoobu", {
        status: 500,
      });
    }

    properties.push({
      ...apartment.data,
      bookingsCount: bookings.data.total_items,
    })
  }

  return json(properties);
}
