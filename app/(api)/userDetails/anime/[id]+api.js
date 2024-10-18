import { neon } from "@neondatabase/serverless";

export async function GET(request, { id }) {
  if (!id)
    return Response.json({ error: "Missing required fields" }, { status: 400 });

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
        SELECT
            animelist.name,
            animelist.malid,
            animelist.coverurl,
            animelist.status,
            animelist.score,
            animelist.episodes
        FROM 
            animelist
        WHERE animelist.userId=${id}
    `;

    return Response.json({ data: response }, { status: 201 });
  } catch (error) {
    console.error("Error fetching recent rides:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
