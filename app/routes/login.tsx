import { zodResolver } from "@hookform/resolvers/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form as UiForm } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { AUTH_KEY, authenticator } from "../services/auth.server";
import { AuthorizationError } from "remix-auth";
import { useMemo } from "react";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
});

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    return await authenticator.authenticate(AUTH_KEY, request, {
      successRedirect: "/",
      throwOnError: true,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      throw new Response("auth-error", {
        status: 401,
      });
    }
    throw error;
  }
}

export default function Login({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: z.infer<typeof loginSchema>, e?: React.BaseSyntheticEvent) => {
    e?.target.submit();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight" title="h1">{t("signin")}</CardTitle>
          <CardDescription>
            {t("signin-description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UiForm {...form}>
            <Form method="post" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
              {children}
              <div className="mt-4">
                <Link to="/register" className="underline">
                  {t("signin-no-account")}
                </Link>
              </div>
              <Button type="submit" className="mt-2">{t("signin")}</Button>
            </Form>
          </UiForm>
        </CardContent>
      </Card>
    </div>
  )
}

export function ErrorBoundary() {
  const { t } = useTranslation();
  const error = useRouteError();

  const errorMessageSlug = useMemo(() => {
    if (isRouteErrorResponse(error)) {
      if (error.status === 401) {
        return "auth-error";
      }
    }
    return "server-error";
  }, [error]);

  return (
    <Login>
      <p className="text-red-500 font-medium text-sm mt-2">
        {t(errorMessageSlug)}
      </p>
    </Login>
  )
}
