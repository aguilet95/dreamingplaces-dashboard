import type { SerializeFrom } from "@remix-run/node";
import { PenLine } from "lucide-react";
import type { loader } from "../../routes/admin.users";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import AccountItemPopup from "./account-item-popup";

const AccountItem = ({ account }: { account: SerializeFrom<typeof loader>[number] }) => {
  return (
    <Dialog>
      <DialogTrigger className="flex items-center justify-between rounded-md p-2 transition-colors hover:cursor-pointer hover:bg-gray-100 group">
        <div className="flex flex-col flex-grow text-left">
          <div className="font-medium text-sm">{account.firstname} {account.lastname}</div>
          <div className="text-sm text-gray-500 font-normal mt-px">{account.email}</div>
        </div>
        <div>
          {!account.active &&
            <span className="text-xs bg-red-100 text-red-500 px-2 py-1 rounded-md mr-4">Accès désactivé</span>
          }
        </div>
        <div className="flex flex-col text-right">
          <div className="font-medium">
            {account.propertyAccesses.length} propriété(s)
          </div>
          <div className="text-xs text-gray-500 font-normal mt-px">
            Créé le {new Date(account.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex justify-end pl-2 w-0 group-hover:w-8 transition-all duration-300 ease-in-out">
          <PenLine className="w-5 h-5 text-gray-500" />
        </div>
      </DialogTrigger>
      <DialogContent>
        <AccountItemPopup account={account} />
      </DialogContent>
    </Dialog>
  )
};

export default AccountItem;
