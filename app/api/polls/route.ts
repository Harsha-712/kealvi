import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("polls")
    .select(`
  *,
  poll_options (
    id,
    option_text,
    poll_votes(count)
  )
`)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const { question, options } = await req.json();

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert({ question })
    .select()
    .single();

  if (pollError) {
    return Response.json({ error: pollError.message }, { status: 500 });
  }

  const optionRows = options.map((option: string) => ({
    poll_id: poll.id,
    option_text: option,
  }));

  const { error: optionError } = await supabase
    .from("poll_options")
    .insert(optionRows);

  if (optionError) {
    return Response.json({ error: optionError.message }, { status: 500 });
  }

  return Response.json(poll);
}