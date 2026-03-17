import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await pool.query("SELECT * FROM leads WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("GET lead error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();

    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    const allowed = [
      "nombre", "empresa", "email", "telefono", "cargo", "status", "source",
      "prioridad", "valor_estimado", "notas", "ultima_interaccion",
      "proxima_accion", "fecha_proxima_accion", "llamadas_realizadas", "emails_enviados",
    ];

    for (const key of allowed) {
      if (key in data) {
        fields.push(`${key} = $${i++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE leads SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("PATCH lead error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await pool.query("DELETE FROM leads WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE lead error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
