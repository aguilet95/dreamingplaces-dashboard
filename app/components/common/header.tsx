import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import type { SessionUser } from "../../services/types/session-user";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useFetcher } from "@remix-run/react";
import { Badge } from "../ui/badge";

const Header = ({ user }: { user: SessionUser | null }) => {
  const fetcher = useFetcher();
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="px-8 py-4 shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold">Dashboard</p>
        <div className="flex items-center">
          <Button type="button" onClick={() => changeLanguage('en')} disabled={i18n.language === "en"}>en</Button>
          <Button type="button" onClick={() => changeLanguage('fr')} disabled={i18n.language === "fr"}>fr</Button>
          {user &&
            <div className="ml-6">
              {user.isAdmin &&
                <Badge className="mr-4">
                  Admin
                </Badge>
              }
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar>
                      <AvatarFallback className="bg-gray-300 uppercase">
                        {user.firstname[0]}{user.lastname[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.firstname} {user.lastname}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => fetcher.submit(null, { method: "POST" })}>
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        </div>
      </div>
    </header>
  )
};

export default Header;
