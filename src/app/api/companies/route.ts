import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") || "";

    let query = `
      SELECT co.*,
        (SELECT COUNT(*) FROM contacts c WHERE c.company_id = co.id)::int AS contact_count,
        (SELECT COUNT(*) FROM deals d WHERE d.company_id = co.id)::int AS deal_count,
        COALESCE((SELECT SUM(d.value) FROM deals d WHERE d.company_id = co.id), 0) AS deal_value,
        COALESCE(
          (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'color', t.color))
           FROM entity_tags et JOIN tags t ON t.id = et.tag_id
           WHERE et.entity_type = 'company' AND et.entity_id = co.id
          ), '[]'
        ) AS tags
      FROM companies co
    `;
    const values: string[] = [];

    if (search) {
      values.push(`%${search}%`);
      query += ` WHERE (co.name ILIKE $1 OR co.industry ILIKE $1 OR co.email ILIKE $1)`;
    }

    query += ` ORDER BY co.created_at DESC`;

    const { rows } = await pool.query(query, values);
    return NextResponse.json(rows);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, industry, website, phone, email, address, region, notes, custom_fields } = body;

    const { rows } = await pool.query(
      `INSERT INTO companies (name, industry, website, phone, email, address, region, notes, custom_fields)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, industry || null, website || null, phone || null, email || null, address || null, region || null, notes || null, custom_fields || null]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
