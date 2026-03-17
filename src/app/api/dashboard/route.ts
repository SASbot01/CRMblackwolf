import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const [
        contactsResult,
        companiesResult,
        dealsResult,
        wonResult,
        recentDealsResult,
        activitiesResult,
      ] = await Promise.all([
        client.query(`SELECT COUNT(*)::int AS total_contacts FROM contacts`),
        client.query(`SELECT COUNT(*)::int AS total_companies FROM companies`),
        client.query(`SELECT COUNT(*)::int AS total_deals, COALESCE(SUM(value), 0) AS total_value FROM deals`),
        client.query(
          `SELECT COUNT(*)::int AS won_deals, COALESCE(SUM(d.value), 0) AS won_value
           FROM deals d
           JOIN pipeline_stages ps ON ps.id = d.stage_id
           WHERE ps.is_won = true`
        ),
        client.query(
          `SELECT d.*,
            c.first_name AS contact_first_name,
            c.last_name AS contact_last_name,
            co.name AS company_name,
            ps.name AS stage_name,
            ps.color AS stage_color
          FROM deals d
          LEFT JOIN contacts c ON c.id = d.contact_id
          LEFT JOIN companies co ON co.id = d.company_id
          LEFT JOIN pipeline_stages ps ON ps.id = d.stage_id
          ORDER BY d.created_at DESC
          LIMIT 10`
        ),
        client.query(`SELECT * FROM activities ORDER BY created_at DESC LIMIT 10`),
      ]);

      return NextResponse.json({
        total_contacts: contactsResult.rows[0].total_contacts,
        total_companies: companiesResult.rows[0].total_companies,
        total_deals: dealsResult.rows[0].total_deals,
        total_value: dealsResult.rows[0].total_value,
        won_deals: wonResult.rows[0].won_deals,
        won_value: wonResult.rows[0].won_value,
        recent_deals: recentDealsResult.rows,
        activities: activitiesResult.rows,
      });
    } finally {
      client.release();
    }
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
