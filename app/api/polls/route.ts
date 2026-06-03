import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";



export async function GET() {
  const { data, error } = await supabase
    .from("polls")
    .select(`
      *,
      poll_options (
        id,
        option_text
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const { question, options } = await req.json();

    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({ question })
      .select()
      .single();

    if (pollError) {
      return NextResponse.json({ error: pollError.message }, { status: 500 });
    }

    const optionRows = options.map((option: string) => ({
      poll_id: poll.id,
      option_text: option,
    }));

    const { error: optionError } = await supabase
      .from("poll_options")
      .insert(optionRows);

    if (optionError) {
      return NextResponse.json({ error: optionError.message }, { status: 500 });
    }

    return NextResponse.json(poll);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
  
}