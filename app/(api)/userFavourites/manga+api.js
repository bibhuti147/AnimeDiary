import { neon } from "@neondatabase/serverless";

export async function POST(request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { name, malId, coverurl, userId } = await request.json();

    if (!name || !malId || !coverurl || !userId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const insertResult = await sql`
      INSERT INTO mangafavourite (name, malId, coverurl, userId)
      VALUES (${name}, ${malId}, ${coverurl}, ${userId})  
      RETURNING*;
    `;

    return Response.json({ data: insertResult }, { status: 201 });
  } catch (error) {
    console.error("Error inseting to animefavourite:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
