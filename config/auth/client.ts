'use client';

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const signIn = authClient.signIn.email;
export const signUp = authClient.signUp.email;
export const signOut = authClient.signOut;
export const useSession = authClient.useSession;
