import { neon } from "@neondatabase/serverless";

export async function PUT(request) {
  const { userid, newname } = await request.json();

  if (!userid || !newname) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  const sql = neon(`${process.env.EXPO_PUBLIC_DATABASE_URL}`);

  try {
    const response = await sql`
            UPDATE users
            SET name = ${newname}
            WHERE clerkid = ${userid}
        `;

    return new Response(
      JSON.stringify({ data: "Name updated successfully." }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: error }), { status: 500 });
  }
}
