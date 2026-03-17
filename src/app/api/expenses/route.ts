import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");
    const period = url.searchParams.get("period");

    let query = "SELECT * FROM expenses WHERE 1=1";
    const params: string[] = [];
    let i = 1;

    if (category) { query += ` AND category = $${i++}`; params.push(category); }
    if (status) { query += ` AND status = $${i++}`; params.push(status); }
    if (period) { query += ` AND date::text LIKE $${i++}`; params.push(`${period}%`); }

    query += " ORDER BY date DESC";

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET expenses error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await pool.query(
      `INSERT INTO expenses (concept, amount, category, status, date, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [data.concept, data.amount || 0, data.category || "operational", data.status || "pending", data.date, data.notes || ""]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("POST expense error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
