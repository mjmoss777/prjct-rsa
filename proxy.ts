import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/config/auth';

// const protectedRoutes = ['/dashboard', '/checker', '/builder'];
const protectedRoutes: string[] = [];
const authRoutes = ['/sign-in', '/sign-up', '/forgot-password'];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    if (isProtectedRoute && !session) {
        const signInUrl = new URL('/sign-in', request.url);
        return NextResponse.redirect(signInUrl);
    }

    if (isAuthRoute && session) {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/checker/:path*', '/builder/:path*', '/sign-in', '/sign-up', '/forgot-password'],
};
