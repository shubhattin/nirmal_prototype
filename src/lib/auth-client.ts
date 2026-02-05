import { createAuthClient } from 'better-auth/react';
import { adminClient, usernameClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: (process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? 'http://localhost:5173') + '/api/auth',
  plugins: [adminClient(), usernameClient()]
});

export const { useSession, signIn, signOut, signUp } = authClient;
