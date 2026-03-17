import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const { email, password, nombre } = await request.json();

    if (!email || !password || !nombre) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password_hash, nombre, role) VALUES ($1, $2, $3, 'user') RETURNING id, email, nombre, role",
      [email.toLowerCase(), hash, nombre]
    );

    const user = result.rows[0];
    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({ token, user });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
