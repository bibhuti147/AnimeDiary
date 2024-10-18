import { neon } from "@neondatabase/serverless";

export async function DELETE(request) {
  const { malid, userid } = await request.json();

  if (!malid || !userid) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    const response = await sql`
        DELETE FROM mangalist
        WHERE malid=${malid} AND userid=${userid} 
    `;

    return Response.json({ data: response }, { status: 201 });
  } catch (error) {
    console.error("Error deleting from mangalist:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
