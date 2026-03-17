import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") || "";
    const pipeline_id = req.nextUrl.searchParams.get("pipeline_id");
    const stage_id = req.nextUrl.searchParams.get("stage_id");

    let query = `
      SELECT d.*,
        c.first_name AS contact_first_name,
        c.last_name AS contact_last_name,
        c.email AS contact_email,
        co.name AS company_name,
        ps.name AS stage_name,
        ps.color AS stage_color,
        ps.is_won,
        ps.is_lost,
        p.name AS pipeline_name,
        COALESCE(
          (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'color', t.color))
           FROM entity_tags et JOIN tags t ON t.id = et.tag_id
           WHERE et.entity_type = 'deal' AND et.entity_id = d.id
          ), '[]'
        ) AS tags
      FROM deals d
      LEFT JOIN contacts c ON c.id = d.contact_id
      LEFT JOIN companies co ON co.id = d.company_id
      LEFT JOIN pipeline_stages ps ON ps.id = d.stage_id
      LEFT JOIN pipelines p ON p.id = d.pipeline_id
      WHERE 1=1
    `;
    const values: unknown[] = [];
    let idx = 1;

    if (pipeline_id) {
      query += ` AND d.pipeline_id = $${idx++}`;
      values.push(pipeline_id);
    }

    if (stage_id) {
      query += ` AND d.stage_id = $${idx++}`;
      values.push(stage_id);
    }

    if (search) {
      query += ` AND (d.title ILIKE $${idx} OR c.first_name ILIKE $${idx} OR c.last_name ILIKE $${idx} OR co.name ILIKE $${idx})`;
      values.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY d.created_at DESC`;

    const { rows } = await pool.query(query, values);
    return NextResponse.json(rows);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, contact_id, company_id, pipeline_id, stage_id, value, currency, priority, expected_close, notes, custom_fields } = body;

    const { rows } = await pool.query(
      `INSERT INTO deals (title, contact_id, company_id, pipeline_id, stage_id, value, currency, priority, expected_close, notes, custom_fields)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [title, contact_id || null, company_id || null, pipeline_id, stage_id, value || 0, currency || 'USD', priority || null, expected_close || null, notes || null, custom_fields || null]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
