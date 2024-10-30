import { neon } from "@neondatabase/serverless";

export async function GET(request, { muid }) {
  if (!muid) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const sql = neon(`${process.env.EXPO_PUBLIC_DATABASE_URL}`);

    const response = await sql`
        SELECT 
            mangafavourite.name,
            mangafavourite.malid,
            mangafavourite.coverurl,
            mangalist.chapters,
            mangalist.status,
            mangalist.score
        FROM mangafavourite
        LEFT JOIN mangalist
        ON mangafavourite.malid = mangalist.malid AND mangafavourite.userid = mangalist.userid
        WHERE mangafavourite.userid=${muid};
    `;

    return Response.json({ data: response }, { status: 201 });
  } catch (error) {
    console.error("Error getting animefavourite:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
