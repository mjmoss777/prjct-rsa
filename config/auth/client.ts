'use client';

import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [emailOTPClient()],
});

export const signIn = authClient.signIn.email;
export const signUp = authClient.signUp.email;
export const signOut = authClient.signOut;
export const useSession = authClient.useSession;
export const emailOtp = authClient.emailOtp;
export const signInOtp = authClient.signIn.emailOtp;
