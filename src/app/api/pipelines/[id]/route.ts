import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { rows } = await pool.query(
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
      WHERE p.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Update pipeline fields
      const pipelineFields: string[] = [];
      const pipelineValues: unknown[] = [];
      let idx = 1;

      if (body.name !== undefined) {
        pipelineFields.push(`name = $${idx++}`);
        pipelineValues.push(body.name);
      }
      if (body.sort_order !== undefined) {
        pipelineFields.push(`sort_order = $${idx++}`);
        pipelineValues.push(body.sort_order);
      }

      if (pipelineFields.length > 0) {
        pipelineValues.push(id);
        await client.query(
          `UPDATE pipelines SET ${pipelineFields.join(", ")} WHERE id = $${idx}`,
          pipelineValues
        );
      }

      // Upsert stages if provided
      if (body.stages && Array.isArray(body.stages)) {
        const stageIds: string[] = [];

        for (let i = 0; i < body.stages.length; i++) {
          const s = body.stages[i];
          if (s.id) {
            // Update existing stage
            await client.query(
              `UPDATE pipeline_stages SET name = $1, color = $2, sort_order = $3, is_won = $4, is_lost = $5
               WHERE id = $6 AND pipeline_id = $7`,
              [s.name, s.color || '#6B7280', s.sort_order ?? i, s.is_won || false, s.is_lost || false, s.id, id]
            );
            stageIds.push(s.id);
          } else {
            // Insert new stage
            const { rows: newStage } = await client.query(
              `INSERT INTO pipeline_stages (pipeline_id, name, color, sort_order, is_won, is_lost)
               VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING id`,
              [id, s.name, s.color || '#6B7280', s.sort_order ?? i, s.is_won || false, s.is_lost || false]
            );
            stageIds.push(newStage[0].id);
          }
        }

        // Delete stages not in the updated list
        if (stageIds.length > 0) {
          await client.query(
            `DELETE FROM pipeline_stages WHERE pipeline_id = $1 AND id != ALL($2::uuid[])`,
            [id, stageIds]
          );
        }
      }

      await client.query("COMMIT");

      // Fetch updated pipeline with stages
      const { rows } = await client.query(
        `SELECT p.*,
          COALESCE(
            (SELECT json_agg(
              json_build_object(
                'id', ps.id, 'name', ps.name, 'color', ps.color,
                'sort_order', ps.sort_order, 'is_won', ps.is_won, 'is_lost', ps.is_lost
              ) ORDER BY ps.sort_order
            )
            FROM pipeline_stages ps WHERE ps.pipeline_id = p.id
          ), '[]') AS stages
        FROM pipelines p WHERE p.id = $1`,
        [id]
      );

      if (rows.length === 0) {
        return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
      }

      return NextResponse.json(rows[0]);
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(`DELETE FROM pipeline_stages WHERE pipeline_id = $1`, [id]);
      const { rowCount } = await client.query(`DELETE FROM pipelines WHERE id = $1`, [id]);
      await client.query("COMMIT");

      if (rowCount === 0) {
        return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true });
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
