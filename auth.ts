import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const allowedDomain = "cromg.org.br";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      authorization: {
        params: {
          hd: allowedDomain,
          prompt: "select_account"
        }
      }
    })
  ],
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google") {
        return false;
      }

      const email = user.email ?? (typeof profile?.email === "string" ? profile.email : "");
      const hostedDomain = typeof profile?.hd === "string" ? profile.hd : "";
      const emailVerified =
        typeof profile?.email_verified === "boolean" ? profile.email_verified : true;

      return (
        emailVerified &&
        email.toLowerCase().endsWith(`@${allowedDomain}`) &&
        hostedDomain === allowedDomain
      );
    }
  }
});
