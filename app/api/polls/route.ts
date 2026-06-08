import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
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
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
  source: "new-deployment",
  data: data ?? [],
});
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
  question,
  options,
  minutes,
} = await req.json();

const closes_at = new Date(
  Date.now() +
  minutes * 60 * 1000
).toISOString();

    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({
  question,
  closes_at,
})
      .select()
      .single();

    if (pollError) {
      return NextResponse.json(
        { error: pollError.message },
        { status: 500 }
      );
    }

    const optionRows = options.map((option: string) => ({
      poll_id: poll.id,
      option_text: option,
    }));

    const { error: optionError } = await supabase
      .from("poll_options")
      .insert(optionRows);

    if (optionError) {
      return NextResponse.json(
        { error: optionError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(poll);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const { searchParams } =
    new URL(req.url);

  const id =
    searchParams.get("id");

  if (!id) {
    return Response.json(
      { error: "Missing id" },
      { status: 400 }
    );
  }

  await supabase
    .from("poll_votes")
    .delete()
    .in(
      "option_id",
      (
        await supabase
          .from("poll_options")
          .select("id")
          .eq("poll_id", id)
      ).data?.map(
        (x: any) => x.id
      ) || []
    );

  await supabase
    .from("poll_options")
    .delete()
    .eq("poll_id", id);

  await supabase
    .from("poll_predictions")
    .delete()
    .eq("poll_id", id);

  const { error } =
    await supabase
      .from("polls")
      .delete()
      .eq("id", id);

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