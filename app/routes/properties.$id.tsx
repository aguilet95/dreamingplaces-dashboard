import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "../db/db.server";
import { authenticator } from "../services/auth.server";
import { getApartment, getBookings } from "../services/smoobu.server";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useTranslation } from "react-i18next";
import { BedDouble, BookCheck, BookIcon, Euro, ExternalLink } from "lucide-react";
import { getCalendars } from "../services/calendar-api.server";

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

  const scripts = await getCalendars();
  if (!scripts.success) {
    throw new Response("Invalid response from Calendar API", {
      status: 500,
    });
  }
  const apiData = scripts.data.apartments.find((script) => script.id === Number(propertyId));

  return json({
    apartment: apartment.data,
    bookings: bookings.data,
    apiData,
  })
}

export default function PropertyPage() {
  const { t } = useTranslation();
  const property = useLoaderData<typeof loader>();

  return (
    <div className="px-12">
      <div className="flex items-center space-x-6">
        <div className="w-28 h-28 rounded-full bg-gray-300 bg-cover bg-center border border-gray-300" style={{ backgroundImage: `url(${property.apiData?.og_image})` }} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{property.apartment.name}</h1>
          <p className="text-xs text-gray-500">{property.apartment.id}</p>
          {property.apiData?.link &&
            <a href={property.apiData.link} target="__blank" className="text-sm">
              {t("consult-on-site")}
              <ExternalLink className="inline-block w-3 h-3 ml-1" />
            </a>
          }
        </div>
      </div>
      <div className="mt-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {typeof property.apiData?.price === "number" &&
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("starting-price")}
                </CardTitle>
                <Euro className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{property.apiData.price} €</div>
              </CardContent>
            </Card>
          }
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("bed-count")}
              </CardTitle>
              <BedDouble className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{property.apartment.rooms.maxOccupancy}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {t("bookings")}
              </CardTitle>
              <BookIcon className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{property.bookings.total_items}</div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("recent-bookings")}</CardTitle>
              <BookCheck className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              {property.bookings.bookings.length === 0
                ? <p className="text-center py-4 text-sm text-gray-600">{t("no-bookings")}</p>
                : <div className="flex flex-col">
                  {property.bookings.bookings.map((booking) => (
                    <div key={booking.id} className="flex flex-row justify-between items-center my-2">
                      <div>
                        <div className="text-sm font-medium">{booking["guest-name"] ?? t("not-defined")}</div>
                        <div className="text-gray-500 text-xs">{new Date(booking.arrival).toLocaleDateString()} - {new Date(booking.departure).toLocaleDateString()}</div>
                      </div>
                      <div>
                        {new Date(booking["created-at"]).toLocaleDateString()}
                      </div>
                      {/* {JSON.stringify(booking)} */}
                    </div>
                  ))}
                </div>
              }
            </CardContent>
          </Card>
          {property.apiData &&
            <Card className="col-span-3">
              <CardContent>
                <div dangerouslySetInnerHTML={{ __html: property.apiData.calendar_iframe }} className="text-xs w-full" />
              </CardContent>
            </Card>
          }
        </div>
      </div>
    </div>
  )
}
