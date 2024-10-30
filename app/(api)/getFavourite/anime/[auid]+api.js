import { neon } from "@neondatabase/serverless";

export async function GET(request, { auid }) {
  if (!auid) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const sql = neon(`${process.env.EXPO_PUBLIC_DATABASE_URL}`);

    const response = await sql`
        SELECT 
            animefavourite.name,
            animefavourite.malid,
            animefavourite.coverurl,
            animelist.score,
            animelist.status,    
            animelist.episodes    
        FROM animefavourite
        LEFT JOIN animelist
        ON animefavourite.malid = animelist.malid AND animefavourite.userid = animelist.userid  
        WHERE animefavourite.userid = ${auid};
    `;

    return Response.json({ data: response }, { status: 201 });
  } catch (error) {
    console.error("Error getting animefavourite:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
