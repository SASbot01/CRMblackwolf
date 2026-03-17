import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { rows } = await pool.query(
      `SELECT d.*,
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
      WHERE d.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const allowedFields = ["title", "contact_id", "company_id", "pipeline_id", "stage_id", "value", "currency", "priority", "expected_close", "notes"];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        fields.push(`${field} = $${idx++}`);
        values.push(body[field]);
      }
    }

    if (body.custom_fields !== undefined) {
      fields.push(`custom_fields = COALESCE(custom_fields, '{}'::jsonb) || $${idx++}::jsonb`);
      values.push(JSON.stringify(body.custom_fields));
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE deals SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { rowCount } = await pool.query(`DELETE FROM deals WHERE id = $1`, [id]);

    if (rowCount === 0) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
