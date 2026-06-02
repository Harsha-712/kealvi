import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { optionId } = await req.json();

  const { error } = await supabase
    .from("poll_votes")
    .insert({
      option_id: optionId,
      voter_id: "demo-user",
    });

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json({
    success: true,
  });
}