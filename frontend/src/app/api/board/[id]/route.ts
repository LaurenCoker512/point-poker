import { NextRequest, NextResponse } from "next/server";

const NEST_API_URL = process.env.NEST_API_URL || "http://localhost:3005/board";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const boardId = params.id;
  const nestRes = await fetch(`${NEST_API_URL}/${boardId}`);
  const data = await nestRes.json();
  return NextResponse.json(data, { status: nestRes.status });
}
