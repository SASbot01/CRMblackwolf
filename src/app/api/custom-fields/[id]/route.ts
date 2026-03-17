import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { rows } = await pool.query(`SELECT * FROM custom_fields WHERE id = $1`, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Custom field not found" }, { status: 404 });
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

    const allowedFields = ["name", "field_key", "field_type", "options", "required", "sort_order"];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        fields.push(`${field} = $${idx++}`);
        values.push(field === "options" ? JSON.stringify(body[field]) : body[field]);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);

    const { rows } = await pool.query(
      `UPDATE custom_fields SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Custom field not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { rowCount } = await pool.query(`DELETE FROM custom_fields WHERE id = $1`, [id]);

    if (rowCount === 0) {
      return NextResponse.json({ error: "Custom field not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
