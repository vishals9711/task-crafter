import GithubProvider from "next-auth/providers/github";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

// Extend the types to include accessToken
interface ExtendedToken extends JWT {
    accessToken?: string;
}

interface ExtendedSession extends Session {
    accessToken?: string;
}

// Define the Account type
interface Account {
    provider: string;
    type: string;
    providerAccountId: string;
    access_token?: string;
    expires_at?: number;
    refresh_token?: string;
    token_type?: string;
    scope?: string;
    id_token?: string;
}

export const authOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error',
    },
    callbacks: {
        async jwt({ token, account }: { token: ExtendedToken; account: Account | null }) {
            // Persist the OAuth access_token to the token right after signin
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }: { session: ExtendedSession; token: ExtendedToken }) {
            // Send properties to the client, like an access_token from a provider
            session.accessToken = token.accessToken;
            return session;
        },
    },
}; 
