import type { SerializeFrom } from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { loader } from "../../routes/customer.smoobu";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Loader } from "../ui/loader";
import { BookCheck, BedDouble } from "lucide-react";

const CustomerDashboard = () => {
  const { t } = useTranslation();
  const { load, state, data } = useFetcher<SerializeFrom<typeof loader>>();

  useEffect(() => {
    load("/customer/smoobu");
  }, [load]);

  return (
    state === "loading"
      ? <Loader className="h-10 w-10 animate-spin mx-auto my-4" />
      : data && data.length > 0
        ? <div className="grid grid-cols-4 gap-4">
          {data.map((property) => (
            <Link key={property.id} to={`/properties/${property.id}`}>
              <Card className="cursor-pointer transition-all hover:shadow-lg">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold tracking-tight" title="h2">{property.name}</CardTitle>
                  <CardDescription className="flex items-center space-x-1">
                    <BedDouble className="w-4 h-4 text-gray-500" />
                    <span>{property.rooms.maxOccupancy}</span>
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <div className="flex items-center">
                    <BookCheck className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-500 font-normal mt-px">{property.bookingsCount} {t("bookings")}</span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
        : <p>{t("no-properties")}</p>
  )
}

export default CustomerDashboard;
