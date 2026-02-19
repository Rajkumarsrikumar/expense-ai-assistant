import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: CookieToSet[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Route Handler
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }

    const errMsg = encodeURIComponent(error.message);
    return NextResponse.redirect(new URL(`/login?error=auth&details=${errMsg}`, requestUrl.origin));
  }

  if (tokenHash && type === 'email') {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: CookieToSet[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Route Handler
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'email',
    });

    if (!error) {
      return NextResponse.redirect(new URL('/login?confirmed=true', requestUrl.origin));
    }

    const errMsg = encodeURIComponent(error.message);
    return NextResponse.redirect(new URL(`/login?error=auth&details=${errMsg}`, requestUrl.origin));
  }

  return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin));
}
