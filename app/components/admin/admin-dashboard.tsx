import type { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { loader } from "../../routes/admin.users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import AccountItem from "./account-item";
import { Loader } from "../ui/loader";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { load: allAccountsLoad, state: allAccountsState, data: allAccountsData } = useFetcher<SerializeFrom<typeof loader>>();
  const { load: withoutPropsLoad, state: withoutPropsState, data: withoutPropsData } = useFetcher<SerializeFrom<typeof loader>>();

  useEffect(() => {
    allAccountsLoad("/admin/users");
  }, [allAccountsLoad]);
  useEffect(() => {
    withoutPropsLoad("/admin/users?withoutProperties=true");
  }, [withoutPropsLoad])

  return (
    <Tabs defaultValue="accounts">
      <TabsList>
        <TabsTrigger value="accounts">{t("manage-accounts")}</TabsTrigger>
      </TabsList>
      <TabsContent value="accounts">
        <div className="flex flex-col items-start space-y-6 lg:flex-row lg:space-x-6 lg:space-y-0">
          <Card className="w-full lg:w-1/2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight" title="h2">{t("all-accounts")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
              {allAccountsState === "loading"
                ? <Loader className="h-10 w-10 animate-spin mx-auto my-4" />
                : allAccountsData && allAccountsData.length > 0
                  ? allAccountsData?.map((account) => <AccountItem key={account.id} account={account} />)
                  : <p>{t("no-accounts")}</p>
              }
            </CardContent>
          </Card>
          <Card className="w-full lg:w-1/2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight" title="h2">{t("recent-accounts")}</CardTitle>
              <CardDescription>
                {t("recent-accounts-description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
              {withoutPropsState === "loading"
                ? <Loader className="h-10 w-10 animate-spin mx-auto my-4" />
                : withoutPropsData && withoutPropsData.length > 0
                  ? withoutPropsData?.map((account) => <AccountItem key={account.id} account={account} />)
                  : <p>{t("no-accounts")}</p>
              }
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
};

export default AdminDashboard;
