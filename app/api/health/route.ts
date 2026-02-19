import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({
      ok: false,
      error: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
    });
  }

  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    return NextResponse.json({
      ok: res.ok,
      url,
      status: res.status,
      message: res.ok
        ? 'Supabase connection OK'
        : `Supabase returned ${res.status}. Check that URL and keys match the same project.`,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      url,
      error: err instanceof Error ? err.message : 'Connection failed',
    });
  }
}
