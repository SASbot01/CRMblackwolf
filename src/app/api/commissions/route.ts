import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get("period");
    const memberId = url.searchParams.get("member_id");
    const role = url.searchParams.get("role");
    const status = url.searchParams.get("status");

    let query = "SELECT * FROM commissions WHERE 1=1";
    const params: string[] = [];
    let i = 1;

    if (period) { query += ` AND period = $${i++}`; params.push(period); }
    if (memberId) { query += ` AND member_id = $${i++}`; params.push(memberId); }
    if (role) { query += ` AND role = $${i++}`; params.push(role); }
    if (status) { query += ` AND status = $${i++}`; params.push(status); }

    query += " ORDER BY commission_amount DESC";

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET commissions error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await pool.query(
      `INSERT INTO commissions (member_id, role, cash_neto, rate, commission_amount, source_lead, status, payment_date, period)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        data.member_id, data.role, data.cash_neto || 0, data.rate || 0,
        data.commission_amount || 0, data.source_lead || null,
        data.status || "pending", data.payment_date || null, data.period,
      ]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("POST commission error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
