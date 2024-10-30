import { neon } from "@neondatabase/serverless";

export async function POST(request) {
  const { name, malid, coverurl, status, score, episodes, userid } =
    await request.json();

  if (
    !name ||
    !malid ||
    !coverurl ||
    !status ||
    !score ||
    !episodes ||
    !userid
  ) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const sql = neon(`${process.env.EXPO_PUBLIC_DATABASE_URL}`);

    const response = await sql`
            INSERT INTO animelist (name,malid,coverurl,status,score,episodes,userid)
            VALUES (${name},${malid},${coverurl},${status},${score},${episodes},${userid})
            ON CONFLICT (malid,userid) DO UPDATE
            SET 
                status=EXCLUDED.status,
                score=EXCLUDED.score,
                episodes=EXCLUDED.episodes
            RETURNING*;
        `;

    return Response.json({ data: response }, { status: 201 });
  } catch (error) {
    console.error("Error fetching animelist:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
