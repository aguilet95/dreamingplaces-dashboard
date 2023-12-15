import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import type { SessionUser } from "./types/session-user";
import { FormStrategy } from "remix-auth-form";
import { db } from "../db/db.server";
import { users } from "../db/schemas/users";
import { eq } from "drizzle-orm";
import { compare } from "bcrypt";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<SessionUser>(sessionStorage);
export const AUTH_KEY = "auth";

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");
    if (!email || !password) {
      throw new Error("Missing email or password");
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toString()),
    });
    if (!user) {
      throw new Response("Unauthorized", {
        status: 401,
      });
    }

    const match = await compare(password.toString(), user.password);
    if (!match) {
      throw new Response("Unauthorized", {
        status: 401,
      });
    }

    // the type of this user must match the type you pass to the Authenticator
    // the strategy will automatically inherit the type if you instantiate
    // directly inside the `use` method
    return {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      isAdmin: user.isAdmin
    };
  }),
  AUTH_KEY,
);
