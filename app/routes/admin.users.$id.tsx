import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticator } from "../services/auth.server";
import { z } from "zod";
import { db } from "../db/db.server";
import { propertyAccesses, users } from "../db/schemas";
import { eq } from "drizzle-orm";

export const manageAccountSchema = z.object({
  active: z.boolean(),
  properties: z.array(z.object({
    propertyId: z.number(),
    name: z.string(),
  })),
});
export type ManageAccountSchema = z.infer<typeof manageAccountSchema>;

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  if (!user.isAdmin) {
    throw new Response("Unauthorized", {
      status: 401,
    });
  }

  const userId = params.id;
  if (!userId) {
    throw new Response("Missing user id", {
      status: 400,
    });
  }

  const body = await request.json();
  const parsedParams = manageAccountSchema.safeParse(body);
  if (!parsedParams.success) {
    throw new Response("Validation error", {
      status: 400,
    });
  }

  await db.transaction(async (tx) => {
    await tx.update(users)
      .set({
        active: parsedParams.data.active,
      })
      .where(eq(users.id, userId));

    await tx.delete(propertyAccesses)
      .where(eq(propertyAccesses.userId, userId));

    if (parsedParams.data.properties.length > 0) {
      await tx.insert(propertyAccesses).values(parsedParams.data.properties.map((property) => ({
        propertyId: property.propertyId,
        userId,
      })));
    }
  });

  return new Response();
}
