import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const source = url.searchParams.get("source");
    const prioridad = url.searchParams.get("prioridad");
    const search = url.searchParams.get("search");

    let query = "SELECT * FROM leads WHERE 1=1";
    const params: string[] = [];
    let i = 1;

    if (status) { query += ` AND status = $${i++}`; params.push(status); }
    if (source) { query += ` AND source = $${i++}`; params.push(source); }
    if (prioridad) { query += ` AND prioridad = $${i++}`; params.push(prioridad); }
    if (search) {
      query += ` AND (nombre ILIKE $${i} OR empresa ILIKE $${i} OR email ILIKE $${i})`;
      params.push(`%${search}%`);
      i++;
    }

    query += " ORDER BY updated_at DESC";

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET leads error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await pool.query(
      `INSERT INTO leads (nombre, empresa, email, telefono, cargo, status, source, prioridad, valor_estimado, notas, proxima_accion, fecha_proxima_accion, llamadas_realizadas, emails_enviados)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        data.nombre, data.empresa, data.email || "", data.telefono || "",
        data.cargo || "", data.status || "nuevo", data.source || "web",
        data.prioridad || "media", data.valor_estimado || 0, data.notas || "",
        data.proxima_accion || null, data.fecha_proxima_accion || null,
        data.llamadas_realizadas || 0, data.emails_enviados || 0,
      ]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("POST lead error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
