import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

// Seed admin user with proper bcrypt hash — call once after DB init
export async function POST() {
  try {
    const adminHash = await bcrypt.hash("blackwolf2026", 10);
    const demoHash = await bcrypt.hash("demo1234", 10);

    await pool.query(
      `INSERT INTO users (email, password_hash, nombre, role) VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
      ["admin@blackwolfsec.io", adminHash, "Admin BlackWolf"]
    );

    await pool.query(
      `INSERT INTO users (email, password_hash, nombre, role) VALUES ($1, $2, $3, 'user')
       ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
      ["demo@blackwolfsec.io", demoHash, "Demo User"]
    );

    return NextResponse.json({ success: true, message: "Users seeded" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
