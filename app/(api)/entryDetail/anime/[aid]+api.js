import { neon } from "@neondatabase/serverless";

export async function GET(request, { aid }) {
  if (!aid) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  const [mid, uid] = aid.split("=");

  if (!mid || !uid) {
    return new Response(JSON.stringify({ error: "Invalid aid format" }), {
      status: 400,
    });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    const response = await sql`
      SELECT 
        animelist.status,
        animelist.score,
        animelist.episodes
      FROM 
        animelist
      WHERE 
        animelist.userid = ${uid} AND animelist.malid=${mid}
    `;

    return new Response(JSON.stringify({ data: response }), { status: 200 });
  } catch (error) {
    console.error("Error fetching anime entry:", error);

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
