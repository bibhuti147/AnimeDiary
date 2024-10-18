import { neon } from "@neondatabase/serverless";

export async function POST(request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { name, profileurl, email, clerkId } = await request.json();

    if (!name || !profileurl || !email || !clerkId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await sql`
    INSERT INTO users (
        name,
        profileimg,
        email,
        clerkId
    )
    VALUES (
        ${name},
        ${profileurl},
        ${email},
        ${clerkId}
    )
    `;

    return new Response(JSON.stringify({ data: response }), { status: 201 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: error }), { status: 500 });
  }
}
