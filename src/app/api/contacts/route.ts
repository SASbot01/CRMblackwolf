import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") || "";

    let query = `
      SELECT c.*,
        co.name AS company_name,
        COALESCE(
          (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'color', t.color))
           FROM entity_tags et JOIN tags t ON t.id = et.tag_id
           WHERE et.entity_type = 'contact' AND et.entity_id = c.id
          ), '[]'
        ) AS tags
      FROM contacts c
      LEFT JOIN companies co ON co.id = c.company_id
    `;
    const values: string[] = [];

    if (search) {
      values.push(`%${search}%`);
      query += ` WHERE (c.first_name ILIKE $1 OR c.last_name ILIKE $1 OR c.email ILIKE $1 OR co.name ILIKE $1)`;
    }

    query += ` ORDER BY c.created_at DESC`;

    const { rows } = await pool.query(query, values);
    return NextResponse.json(rows);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company_id, first_name, last_name, email, phone, position, region, notes, custom_fields } = body;

    const { rows } = await pool.query(
      `INSERT INTO contacts (company_id, first_name, last_name, email, phone, position, region, notes, custom_fields)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [company_id || null, first_name, last_name, email || null, phone || null, position || null, region || null, notes || null, custom_fields || null]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
