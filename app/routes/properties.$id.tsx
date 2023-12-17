import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "../db/db.server";
import { authenticator } from "../services/auth.server";
import { getApartment, getBookings } from "../services/smoobu.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const propertyId = params.id;
  if (!propertyId) {
    throw new Response("Missing property id", {
      status: 400,
    });
  }

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const userPropertyAccess = await db.query.propertyAccesses.findFirst({
    columns: {
      propertyId: true,
    },
    where: (propertyAccess, { eq, and }) => and(
      eq(propertyAccess.userId, user.id),
      eq(propertyAccess.propertyId, Number(propertyId)),
    ),
  });
  if (!userPropertyAccess) {
    return redirect("/");
  }

  const [apartment, bookings] = await Promise.all([
    getApartment(Number(propertyId)),
    getBookings({ apartmentId: Number(propertyId), pageSize: 10 }),
  ]);
  if (!apartment.success || !bookings.success) {
    throw new Response("Invalid response from Smoobu", {
      status: 500,
    });
  }

  return json({
    apartment: apartment.data,
    bookings: bookings.data,
  })
}

export default function PropertyPage() {
  const property = useLoaderData<typeof loader>();

  return (
    <div className="px-12">
      {JSON.stringify(property)}
    </div>
  )
}
