import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows: pipelines } = await pool.query(
      `SELECT p.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', ps.id,
              'name', ps.name,
              'color', ps.color,
              'sort_order', ps.sort_order,
              'is_won', ps.is_won,
              'is_lost', ps.is_lost
            ) ORDER BY ps.sort_order
          )
          FROM pipeline_stages ps
          WHERE ps.pipeline_id = p.id
        ), '[]') AS stages
      FROM pipelines p
      ORDER BY p.sort_order, p.created_at`
    );

    return NextResponse.json(pipelines);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, sort_order, stages } = body;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows: pipelineRows } = await client.query(
        `INSERT INTO pipelines (name, sort_order) VALUES ($1, $2) RETURNING *`,
        [name, sort_order || 0]
      );
      const pipeline = pipelineRows[0];

      const insertedStages = [];
      if (stages && Array.isArray(stages)) {
        for (let i = 0; i < stages.length; i++) {
          const s = stages[i];
          const { rows: stageRows } = await client.query(
            `INSERT INTO pipeline_stages (pipeline_id, name, color, sort_order, is_won, is_lost)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [pipeline.id, s.name, s.color || '#6B7280', s.sort_order ?? i, s.is_won || false, s.is_lost || false]
          );
          insertedStages.push(stageRows[0]);
        }
      }

      await client.query("COMMIT");

      return NextResponse.json({ ...pipeline, stages: insertedStages }, { status: 201 });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
