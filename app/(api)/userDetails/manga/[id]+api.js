import { neon } from "@neondatabase/serverless";

export async function GET(request, { id }) {
  if (!id)
    return Response.json({ error: "Missing required fields" }, { status: 400 });

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
        SELECT
            mangalist.name,
            mangalist.malId,
            mangalist.coverurl,
            mangalist.status,
            mangalist.score,
            mangalist.volumes,
            mangalist.chapters
        FROM 
            mangalist
        WHERE userId=${id}
    `;

    return Response.json({ data: response });
  } catch (error) {
    console.error("Error fetching recent rides:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
