import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/slow.js") {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return new Response("");
  }
  return new Response("Hello, world!");
}
