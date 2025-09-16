import { NextRequest, NextResponse } from "next/server";

const NEST_API_URL = process.env.NEST_API_URL || "http://localhost:3005/board";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const boardId = params.id;
  const userId = req.nextUrl.searchParams.get("userId");
  const url = userId
    ? `${NEST_API_URL}/${boardId}?userId=${encodeURIComponent(userId)}`
    : `${NEST_API_URL}/${boardId}`;
  const nestRes = await fetch(url);
  const data = await nestRes.json();
  return NextResponse.json(data, { status: nestRes.status });
}
