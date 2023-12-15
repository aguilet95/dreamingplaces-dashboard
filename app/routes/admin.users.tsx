import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { db } from "../db/db.server";
import { authenticator } from "../services/auth.server";
import { getApartments } from "../services/smoobu.server";

const schema = z.object({
  // limit: z.coerce.number().int().min(1).max(100),
  // offset: z.coerce.number().int().min(0),
  withoutProperties: z.coerce.boolean().optional(),
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

  const result = await db.query.users.findMany({
    columns: {
      id: true,
      email: true,
      firstname: true,
      lastname: true,
      active: true,
      createdAt: true,
    },
    with: {
      propertyAccesses: {
        columns: {
          propertyId: true,
        },
      },
    },
    where: (user, { eq }) => eq(user.isAdmin, false),
    orderBy: (user, { desc }) => [desc(user.createdAt)]
    // limit: parsedParams.data.limit,
    // offset: parsedParams.data.offset,
  });

  const smoobuApartments = await getApartments();
  if (!smoobuApartments.success) {
    console.error(smoobuApartments.error);
    throw new Response("Invalid response from Smoobu", {
      status: 500,
    });
  }

  /** ugly hack, improve with a proper sql query */
  const users = parsedParams.data.withoutProperties
    ? result.filter((u) => u.propertyAccesses.length === 0)
    : result.filter((u) => u.propertyAccesses.length > 0);

  const usersWithProperties = users.map((user) => ({
    ...user,
    propertyAccesses: user.propertyAccesses.reduce<Array<typeof users[number]["propertyAccesses"][number] & { name: string }>>((acc, pa) => {
      const smoobuProperty = smoobuApartments.data.find((p) => p.id === pa.propertyId);
      if (smoobuProperty) {
        acc.push({ propertyId: pa.propertyId, name: smoobuProperty.name });
      }
      return acc;
    }, []),
  }));


  return json(usersWithProperties);
}
