import { neon } from "@neondatabase/serverless";

export async function GET(request, { faid }) {
  if (!faid) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  const [mid, uid] = faid.split("=");

  if (!mid || !uid) {
    return new Response(JSON.stringify({ error: "Invalid aid format" }), {
      status: 400,
    });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    const response = await sql`
            SELECT * FROM animefavourite WHERE malid=${mid} AND userid=${uid}
        `;

    return new Response(JSON.stringify({ data: response }), { status: 200 });
  } catch (error) {
    console.error("Error fetching favourite anime entry:", error);

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
