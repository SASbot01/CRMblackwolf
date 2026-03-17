import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM team_members ORDER BY nombre ASC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET team error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await pool.query(
      `INSERT INTO team_members (nombre, email, roles, status, base_rate)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [data.nombre, data.email, data.roles || [], data.status || "active", data.base_rate || 0]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("POST team error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
