import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (session) {
      return NextResponse.json(session, { status: 200 });
    } else {
      return NextResponse.json("Not authenticated", { status: 401 });
    }
  } catch (error) {
    console.log("[SESSION]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
