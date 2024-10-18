import { neon } from "@neondatabase/serverless";

export async function GET(request, { maid }) {
  if (!maid) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  const [mid, uid] = maid.split("=");

  if (!mid || !uid) {
    return new Response(JSON.stringify({ error: "Invalid aid format" }), {
      status: 400,
    });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    const response = await sql`
      SELECT 
        mangalist.status,
        mangalist.score,
        mangalist.chapters,
        mangalist.volumes
      FROM 
        mangalist
      WHERE 
        mangalist.userid = ${uid} AND mangalist.malid=${mid}
    `;

    return new Response(JSON.stringify({ data: response }), { status: 200 });
  } catch (error) {
    console.error("Error fetching anime entry:", error);

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
