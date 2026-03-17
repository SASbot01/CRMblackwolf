import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const entity_type = req.nextUrl.searchParams.get("entity_type");

    let query = `SELECT * FROM custom_fields`;
    const values: string[] = [];

    if (entity_type) {
      query += ` WHERE entity_type = $1`;
      values.push(entity_type);
    }

    query += ` ORDER BY sort_order, created_at`;

    const { rows } = await pool.query(query, values);
    return NextResponse.json(rows);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entity_type, name, field_key, field_type, options, required, sort_order } = body;

    const { rows } = await pool.query(
      `INSERT INTO custom_fields (entity_type, name, field_key, field_type, options, required, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [entity_type, name, field_key, field_type, options || null, required || false, sort_order || 0]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
