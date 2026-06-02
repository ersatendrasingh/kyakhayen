import { NextResponse } from "next/server";

import { currentUser } from "@/lib/auth";
import {
  getPinterestBoardId,
  listPinterestBoards,
  setPinterestBoardId,
} from "@/lib/content-pipeline/pinterest-oauth";

async function requireAdmin() {
  const admin = await currentUser();
  return admin?.role === "ADMIN" ? admin : null;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  try {
    const [boards, selectedBoardId] = await Promise.all([
      listPinterestBoards(),
      getPinterestBoardId(),
    ]);
    return NextResponse.json({ boards, selectedBoardId });
  } catch (error) {
    return NextResponse.json(errorMessage(error, "Unable to load Pinterest boards."), {
      status: 400,
    });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { boardId?: unknown } | null;
  const boardId = typeof body?.boardId === "string" ? body.boardId.trim() : "";
  if (!boardId) {
    return NextResponse.json("Choose a Pinterest board.", { status: 400 });
  }

  try {
    await setPinterestBoardId(boardId);
    return NextResponse.json({ selectedBoardId: boardId });
  } catch (error) {
    return NextResponse.json(errorMessage(error, "Unable to save Pinterest board."), {
      status: 400,
    });
  }
}
