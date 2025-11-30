import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, acceptTerms } = body as {
      email?: string;
      password?: string;
      acceptTerms?: boolean;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!acceptTerms) {
      return NextResponse.json({ error: "Terms must be accepted" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 });
    }

    // NOTE: This is a mock registration endpoint.
    // Replace with real user creation (database, hashing, email confirmation).

    return NextResponse.json({ ok: true, message: "User created (mock)" }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
