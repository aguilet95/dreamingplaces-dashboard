import type { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import type { loader } from "../../routes/customer.smoobu";
import { useEffect } from "react";

const CustomerDashboard = () => {
  const { t } = useTranslation();
  const { load, state, data } = useFetcher<SerializeFrom<typeof loader>>();

  useEffect(() => {
    load("/customer/smoobu");
  }, [load]);

  return (
    <div>COUCOU</div>
  )
}

export default CustomerDashboard;
