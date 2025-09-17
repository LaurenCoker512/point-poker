import { NextRequest, NextResponse } from "next/server";

const NEST_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3005/board";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const boardId = params.id;
  const { userId, vote } = await req.json();

  const nestRes = await fetch(`${NEST_API_URL}/${boardId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, vote }),
  });

  const data = await nestRes.json();
  return NextResponse.json(data, { status: nestRes.status });
}
