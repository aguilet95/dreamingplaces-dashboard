import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { authenticator } from "../services/auth.server";
import { useLoaderData } from "@remix-run/react";
import AdminDashboard from "../components/admin/admin-dashboard";
import CustomerDashboard from "../components/customer/customer-dashboard";

export const meta: MetaFunction = () => {
  return [
    { title: "Dreaming Places - Dashboard" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  return json(user);
};

export default function Index() {
  const user = useLoaderData<typeof loader>();

  return (<div className="px-12">
    {user.isAdmin
      ? <AdminDashboard />
      : <CustomerDashboard />
    }
  </div>
  )
}
