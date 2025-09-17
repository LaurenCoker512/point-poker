import { NextRequest, NextResponse } from "next/server";

const NEST_API_URL =
  `${process.env.NEXT_PUBLIC_BACKEND_URL}/board` ||
  "http://localhost:3005/board";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const nestRes = await fetch(NEST_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await nestRes.json();

  return NextResponse.json(data, { status: nestRes.status });
}
