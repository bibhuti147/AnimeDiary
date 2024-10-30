import { neon } from "@neondatabase/serverless";

export async function PUT(request) {
  try {
    // Parse the incoming request to get the user ID and image URL
    const { userid, imageurl } = await request.json();
    const sql = neon(`${process.env.EXPO_PUBLIC_DATABASE_URL}`);

    // Perform the update query in the database
    const response = await sql`
      UPDATE users
      SET profileimg = ${imageurl}
      WHERE clerkid = ${userid}
    `;

    // If no rows are updated, respond with an error message
    if (response.count === 0) {
      return new Response(
        JSON.stringify({ error: "User not found or no changes made." }),
        { status: 404 }
      );
    }

    // Respond with a success message
    return new Response(
      JSON.stringify({ data: "Image URL updated successfully." }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating the database:", error);
    // Return error response in case of a failure
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
