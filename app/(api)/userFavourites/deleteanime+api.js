import { neon } from "@neondatabase/serverless";

export async function DELETE(request) {
  const { malId, userId } = await request.json();

  if (!malId || !userId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    const response = await sql`
        DELETE FROM animefavourite WHERE malId=${malId} AND userId=${userId}
        RETURNING*;
    `;

    return Response.json({ data: response }, { status: 201 });
  } catch (error) {
    console.error("Error deleting from animefavourite:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
