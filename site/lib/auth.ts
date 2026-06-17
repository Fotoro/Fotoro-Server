import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID ?? "",
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
    Credentials({
      name: "Magic link (preview)",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        // Preview-only authorization. In production this would proxy to
        // Supabase Auth / your own user store.
        return {
          id: parsed.data.email,
          name: parsed.data.email.split("@")[0],
          email: parsed.data.email,
        };
      },
    }),
  ],
  callbacks: {
    async authorized({ request: { nextUrl } }) {
      // Dashboard uses Supabase client-side auth — do not gate with NextAuth
      if (nextUrl.pathname.startsWith("/dashboard")) return true;
      return true;
    },
  },
});
