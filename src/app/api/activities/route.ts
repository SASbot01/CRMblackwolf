import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const entity_type = req.nextUrl.searchParams.get("entity_type");
    const entity_id = req.nextUrl.searchParams.get("entity_id");

    let query = `SELECT * FROM activities`;
    const values: unknown[] = [];
    const conditions: string[] = [];
    let idx = 1;

    if (entity_type) {
      conditions.push(`entity_type = $${idx++}`);
      values.push(entity_type);
    }

    if (entity_id) {
      conditions.push(`entity_id = $${idx++}`);
      values.push(entity_id);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY created_at DESC`;

    const { rows } = await pool.query(query, values);
    return NextResponse.json(rows);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entity_type, entity_id, type, title, description, completed, due_date, user_id } = body;

    const { rows } = await pool.query(
      `INSERT INTO activities (entity_type, entity_id, type, title, description, completed, due_date, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [entity_type, entity_id, type, title, description || null, completed || false, due_date || null, user_id || null]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
