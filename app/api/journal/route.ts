import { NextResponse } from "next/server";
import { JournalService } from "@/lib/services/journal.service";

/**
 * GET handler to retrieve journal entries.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const user_email = url.searchParams.get("user_email");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const is_gratitude = url.searchParams.get("is_gratitude") === "true";

    if (!user_email) {
      return NextResponse.json({ error: "User email required" }, { status: 400 });
    }

    const entries = await JournalService.getEntries({ user_email, limit, is_gratitude });
    return NextResponse.json({ entries });
  } catch (err: any) {
    console.error("Journal GET error:", err);
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 },
    );
  }
}

/**
 * POST handler to create a new journal entry.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.user_email || !body?.content?.trim()) {
      return NextResponse.json({ error: "User email and content are required" }, { status: 400 });
    }

    const entry = await JournalService.createEntry(body);
    return NextResponse.json({ entry });
  } catch (err: any) {
    console.error("Journal POST error:", err);
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 },
    );
  }
}

/**
 * PATCH handler to update an existing journal entry.
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { entry_id, user_email } = body;

    if (!entry_id || !user_email) {
      return NextResponse.json({ error: "Entry ID and user email required" }, { status: 400 });
    }

    try {
      const entry = await JournalService.updateEntry(entry_id, user_email, body);
      return NextResponse.json({ entry });
    } catch (e: any) {
      const status = e.message === "Unauthorized" ? 403 : 404;
      return NextResponse.json({ error: e.message }, { status });
    }
  } catch (err: any) {
    console.error("Journal PATCH error:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

/**
 * DELETE handler to remove a journal entry.
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const entry_id = url.searchParams.get("entry_id");
    const user_email = url.searchParams.get("user_email");

    if (!entry_id || !user_email) {
      return NextResponse.json({ error: "Entry ID and user email required" }, { status: 400 });
    }

    try {
      await JournalService.deleteEntry(entry_id, user_email);
      return NextResponse.json({ ok: true });
    } catch (e: any) {
      const status = e.message === "Unauthorized" ? 403 : 404;
      return NextResponse.json({ error: e.message }, { status });
    }
  } catch (err: any) {
    console.error("Journal DELETE error:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
