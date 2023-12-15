import { zodResolver } from "@hookform/resolvers/zod";
import { json, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { db } from "../db/db.server";
import { users } from "../db/schemas/users";
import { hash } from "bcrypt";

const registerSchema = z.object({
  firstname: z.string().min(1).max(255),
  lastname: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(8).max(255),
});

export async function action({ request }: ActionFunctionArgs) {
  const payload = Object.fromEntries(await request.formData());
  const parsed = await registerSchema.safeParseAsync(payload);
  if (!parsed.success) {
    throw new Response("Validation error", {
      status: 400,
    });
  }

  try {
    const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email)).limit(1);
    console.log(existingUser);
    if (existingUser.length > 0) {
      return json({ errors: { email: "email-already-exists" } }, { status: 409 });
    }

    const hashedPassword = await hash(parsed.data.password, 10);
    await db.insert(users).values({
      ...parsed.data,
      password: hashedPassword,
    });
    return redirect("/login");
  } catch (error) {
    console.error(error);
    throw new Response("Internal server error", {
      status: 500,
    });
  }
}

export default function Register({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const fetcher = useFetcher<typeof action>();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    fetcher.submit(values, {
      method: "POST",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight" title="h1">{t("signup")}</CardTitle>
          <CardDescription>
            {t("signup-description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("firstname")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("lastname")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {fetcher.state !== "submitting" &&
                <>
                  {fetcher.data?.errors?.email === "email-already-exists" && <p className="text-red-500 font-medium text-sm">{t("email-already-exists")}</p>}
                  {children}
                </>
              }
              <Button type="submit" disabled={fetcher.state === "submitting"}>{t("signup")}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export function ErrorBoundary() {
  const { t } = useTranslation();

  return (
    <Register>
      <p className="text-red-500 font-medium text-sm">
        {t("server-error")}
      </p>
    </Register>
  )
}
