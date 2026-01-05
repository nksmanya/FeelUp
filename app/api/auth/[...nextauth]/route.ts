import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { name, email, password } = credentials as {
          name?: string;
          email?: string;
          password?: string;
        };

        if (!email || !password) return null;

        // Mock validation: accept any password with length >= 6
        // Replace with your real user lookup & password check
        if (password.length >= 6) {
          // Prefer a provided name, otherwise derive a friendly name from the email local-part
          const friendlyName =
            (name && name.trim()) || email.split("@")[0] || email;
          return { id: email, name: friendlyName, email };
        }

        return null;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: !!process.env.NEXTAUTH_DEBUG,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        // If a relative path, resolve against baseUrl
        if (url.startsWith("/")) return new URL(url, baseUrl).toString();

        // If absolute and same origin, allow it
        const dest = new URL(url);
        if (dest.origin === baseUrl) return url;
      } catch (e) {
        // ignore and fallthrough to default
      }
      return `${baseUrl}/mood-feed`;
    },
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
});

// Export the handler for all common HTTP methods to avoid method mismatches
export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH, handler as OPTIONS, handler as HEAD };
