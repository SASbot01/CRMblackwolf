import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query(`SELECT * FROM tags ORDER BY name`);
    return NextResponse.json(rows);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, color } = body;

    const { rows } = await pool.query(
      `INSERT INTO tags (name, color) VALUES ($1, $2) RETURNING *`,
      [name, color || '#6B7280']
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
