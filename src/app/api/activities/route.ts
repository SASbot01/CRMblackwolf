import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const leadId = url.searchParams.get("lead_id");

    if (!leadId) {
      return NextResponse.json({ error: "lead_id required" }, { status: 400 });
    }

    const result = await pool.query(
      "SELECT * FROM activities WHERE lead_id = $1 ORDER BY created_at DESC",
      [leadId]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET activities error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const result = await pool.query(
      `INSERT INTO activities (lead_id, tipo, descripcion, resultado) VALUES ($1,$2,$3,$4) RETURNING *`,
      [data.lead_id, data.tipo, data.descripcion, data.resultado || ""]
    );

    // Update lead's ultima_interaccion and counters
    const updates: string[] = ["ultima_interaccion = NOW()"];
    if (data.tipo === "llamada") updates.push("llamadas_realizadas = llamadas_realizadas + 1");
    if (data.tipo === "email") updates.push("emails_enviados = emails_enviados + 1");

    await pool.query(`UPDATE leads SET ${updates.join(", ")} WHERE id = $1`, [data.lead_id]);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("POST activity error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
