import { analyzeChannelsAndSuggest } from "@/lib/seo";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await analyzeChannelsAndSuggest(payload);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
