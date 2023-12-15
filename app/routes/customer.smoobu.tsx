import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "../services/auth.server";
import { db } from "../db/db.server";
import { getApartment, getBookings } from "../services/smoobu.server";

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

  for (const userPropertyAccess of userPropertyAccesses) {
    const [apartment, bookings] = await Promise.all([
      getApartment(userPropertyAccess.propertyId),
      getBookings({ apartmentId: userPropertyAccess.propertyId, pageSize: 1 }),
    ]);
    if (!apartment.success || !bookings.success) {
      throw new Response("Invalid response from Smoobu", {
        status: 500,
      });
    }
  }

  return json({});
}
