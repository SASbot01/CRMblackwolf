import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entity_type, entity_id, tag_id } = body;

    if (!entity_type || !entity_id || !tag_id) {
      return NextResponse.json({ error: "entity_type, entity_id, and tag_id are required" }, { status: 400 });
    }

    // Check if already assigned
    const { rows: existing } = await pool.query(
      `SELECT id FROM entity_tags WHERE entity_type = $1 AND entity_id = $2 AND tag_id = $3`,
      [entity_type, entity_id, tag_id]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: "Tag already assigned" }, { status: 409 });
    }

    const { rows } = await pool.query(
      `INSERT INTO entity_tags (entity_type, entity_id, tag_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [entity_type, entity_id, tag_id]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const entity_type = req.nextUrl.searchParams.get("entity_type");
    const entity_id = req.nextUrl.searchParams.get("entity_id");
    const tag_id = req.nextUrl.searchParams.get("tag_id");

    if (!entity_type || !entity_id || !tag_id) {
      return NextResponse.json({ error: "entity_type, entity_id, and tag_id query params are required" }, { status: 400 });
    }

    const { rowCount } = await pool.query(
      `DELETE FROM entity_tags WHERE entity_type = $1 AND entity_id = $2 AND tag_id = $3`,
      [entity_type, entity_id, tag_id]
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: "Tag assignment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
