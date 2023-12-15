import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "../services/auth.server";
import { z } from "zod";
import Fuse from "fuse.js";
import { getApartments } from "../services/smoobu.server";

const schema = z.object({
  search: z.string().optional(),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  if (!user.isAdmin) {
    throw new Response("Unauthorized", {
      status: 401,
    });
  }

  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  const parsedParams = schema.safeParse(params);
  if (!parsedParams.success) {
    throw new Response("Validation error", {
      status: 400,
    });
  }

  const smoobuApartments = await getApartments();
  if (!smoobuApartments.success) {
    console.error(smoobuApartments.error);
    throw new Response("Invalid response from Smoobu", {
      status: 500,
    });
  }

  const fuse = new Fuse(smoobuApartments.data, {
    keys: ["name"],
  });

  return parsedParams.data.search
    ? json(fuse.search(parsedParams.data.search).map((item) => item.item).slice(0, 5))
    : json(smoobuApartments.data.slice(0, 5));
}
