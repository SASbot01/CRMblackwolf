import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();

    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    for (const key of ["member_id", "role", "cash_neto", "rate", "commission_amount", "source_lead", "status", "payment_date", "period"]) {
      if (key in data) {
        fields.push(`${key} = $${i++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields" }, { status: 400 });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE commissions SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("PATCH commission error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query("DELETE FROM commissions WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE commission error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
