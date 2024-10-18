import { neon } from "@neondatabase/serverless";

export async function POST(request) {
  const { name, malid, coverurl, status, score, chapters, volumes, userid } =
    await request.json();

  if (
    !name ||
    !malid ||
    !coverurl ||
    !status ||
    !score ||
    !chapters ||
    !volumes ||
    !userid
  ) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    const response = await sql`
            INSERT INTO mangalist (name,malid,coverurl,status,score,volumes,chapters,userid)
            VALUES (${name},${malid},${coverurl},${status},${score},${volumes},${chapters},${userid})
            ON CONFLICT (malid,userid) DO UPDATE
            SET 
                status=EXCLUDED.status,
                score=EXCLUDED.score,
                volumes=EXCLUDED.volumes,
                chapters=EXCLUDED.chapters
            RETURNING*;
        `;

    return Response.json({ data: response }, { status: 201 });
  } catch (error) {
    console.error("Error fetching mangalist:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
