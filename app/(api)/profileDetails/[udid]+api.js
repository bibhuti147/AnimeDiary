import { neon } from "@neondatabase/serverless";

export async function GET(request, { udid }) {
  if (!udid) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  try {
    const sql = neon(`${process.env.EXPO_PUBLIC_DATABASE_URL}`);

    const response = await sql`
    SELECT 
      users.name,
      users.profileimg 
    FROM users WHERE users.clerkid = ${udid}
    `;
    return new Response(JSON.stringify({ data: response }), { status: 201 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: error }), { status: 500 });
  }
}
