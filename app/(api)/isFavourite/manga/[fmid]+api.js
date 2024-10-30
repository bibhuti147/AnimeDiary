import { neon } from "@neondatabase/serverless";

export async function GET(request, { fmid }) {
  if (!fmid) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  const [mid, uid] = fmid.split("=");

  if (!mid || !uid) {
    return new Response(JSON.stringify({ error: "Invalid aid format" }), {
      status: 400,
    });
  }

  try {
    const sql = neon(`${process.env.EXPO_PUBLIC_DATABASE_URL}`);

    const response = await sql`
        SELECT * FROM mangafavourite WHERE malid=${mid} AND userid=${uid}
    `;

    return new Response(JSON.stringify({ data: response }), { status: 200 });
  } catch (error) {
    console.error("Error fetching favourite anime entry:", error);

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
