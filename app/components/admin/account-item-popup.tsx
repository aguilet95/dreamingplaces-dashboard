import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { PlusIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { z } from "zod";
import type { loader as smoobuLoader } from "../../routes/admin.smoobu";
import type { loader } from "../../routes/admin.users";
import type { ManageAccountSchema } from "../../routes/admin.users.$id";
import { manageAccountSchema } from "../../routes/admin.users.$id";
import { Button } from "../ui/button";
import { DialogHeader, DialogTitle } from "../ui/dialog";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, Form as UiForm } from "../ui/form";
import { Input } from "../ui/input";
import { Loader } from "../ui/loader";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Switch } from "../ui/switch";

const AccountItemPopup = ({ account }: { account: SerializeFrom<typeof loader>[number] }) => {
  const { t } = useTranslation();
  const { submit } = useFetcher();
  const form = useForm({
    resolver: zodResolver(manageAccountSchema),
    defaultValues: {
      active: account.active,
      properties: account.propertyAccesses,
    },
  });

  const onSubmit = (data: z.infer<typeof manageAccountSchema>) => {
    submit(data, { action: `admin/users/${account.id}`, method: "POST", encType: "application/json" });
  }

  return (
    <DialogHeader>
      <DialogTitle className="mb-4">
        {t("manage-account-details")}
      </DialogTitle>
      <UiForm {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>
                      Accès au dashboard
                    </FormLabel>
                    <FormDescription className="text-xs">
                      L'utilisateur peut accéder au dashboard
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="properties"
              render={({ field }) => (
                <FormItem className="rounded-lg border p-4">
                  <div>
                    <FormLabel>
                      Propriétés
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Gérer les propriétés auquel l'utilisateur a accès
                    </FormDescription>
                  </div>
                  <FormControl>
                    <AccountItemPopupPropertiesList properties={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="mt-6" disabled={!form.formState.isDirty}>
            Enregistrer
          </Button>
        </form>
      </UiForm>
    </DialogHeader>
  )
};

const AccountItemPopupPropertiesList = ({ properties, onChange }: { properties: ManageAccountSchema["properties"]; onChange: (properties: ManageAccountSchema["properties"]) => void }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { load, state, data } = useFetcher<SerializeFrom<typeof smoobuLoader>>();
  useEffect(() => {
    load(`/admin/smoobu?search=${search}`);
  }, [load, search]);

  const reset = () => {
    setOpen(false);
    setSearch("");
  }

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open}>
            <span className="text-xs">
              Ajouter une propriété
            </span>
            <PlusIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <Input value={search} onChange={(e) => setSearch(e.currentTarget.value)} className="h-6 px-2" />
          <div className="mt-4">
            {search === ""
              ? <p className="text-xs text-gray-500">Commencez à taper pour rechercher une propriété</p>
              : state === "loading"
                ? <Loader className="w-4 h-4" />
                : data
                  ? data.filter((property) => !properties.some((p) => p.propertyId === property.id)).map((property) => (
                    <div key={property.id} className="text-sm p-1 cursor-pointer rounded-md hover:bg-gray-100" onClick={(e) => {
                      onChange([...properties, { propertyId: property.id, name: property.name }]);
                      reset();
                    }}>
                      {property.name}
                    </div>
                  ))
                  : <p>Aucune propriété</p>
            }
          </div>
        </PopoverContent>
      </Popover>
      {properties.length > 0
        ? <div className="mt-4 flex flex-col space-y-1">
          {properties.map((property) => (
            <div key={property.propertyId} className="p-1 rounded-md flex items-center text-sm font-medium cursor-pointer transition-all hover:bg-red-50 group" onClick={(e) => onChange(properties.filter((p) => p.propertyId !== property.propertyId))}>
              <div className="flex-grow">
                {property.name}
              </div>
              <div className="overflow-hidden w-0 group-hover:w-4 transition-all">
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
            </div>
          ))}
        </div>
        : <p className="mt-4 text-xs text-gray-500 text-center">Aucune propriété</p>
      }
    </div>
  );
}

export default AccountItemPopup;
