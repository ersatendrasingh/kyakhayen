import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { z } from "zod";

import { currentUser } from "@/lib/auth";

export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

const voiceSchema = z.object({
  input: z.string().trim().min(12).max(4000),
  provider: z.enum(["default", "ai"]).default("default"),
  voice: z
    .enum([
      "alloy",
      "ash",
      "ballad",
      "coral",
      "echo",
      "fable",
      "marin",
      "nova",
      "onyx",
      "sage",
      "shimmer",
      "verse",
      "cedar",
    ])
    .default("shimmer"),
  speed: z.number().min(0.6).max(1.2).default(0.9),
});

function normalizeSpeechInput(input: string) {
  return input
    .replace(/\bKya\s+Khayen\b/gi, "क्या खाएं")
    .replace(/\bKyakhayen\b/gi, "क्या खाएं");
}

async function generateMacVoice(input: string) {
  const outputPath = join(tmpdir(), `kyakhayen-reel-voice-${randomUUID()}.m4a`);
  try {
    await execFileAsync("/usr/bin/say", [
      "-v",
      process.env.MACOS_TTS_VOICE || "Lekha",
      "-r",
      process.env.MACOS_TTS_RATE || "150",
      "-o",
      outputPath,
      normalizeSpeechInput(input),
    ]);

    return await readFile(outputPath);
  } finally {
    await rm(outputPath, { force: true }).catch(() => undefined);
  }
}

export async function POST(request: Request) {
  const admin = await currentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const parsed = voiceSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(parsed.error.issues[0]?.message || "Invalid voice request.", {
      status: 400,
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || parsed.data.provider === "default") {
    try {
      const audio = await generateMacVoice(parsed.data.input);
      return new Response(audio, {
        headers: {
          "Content-Type": "audio/mp4",
          "Content-Disposition": 'inline; filename="kyakhayen-default-voice.m4a"',
          "Cache-Control": "no-store",
        },
      });
    } catch {
      if (!apiKey) {
        return NextResponse.json(
          "Default voice generation is not available on this server. Upload a voiceover audio file.",
          { status: 503 }
        );
      }
    }
  }

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice: parsed.data.voice,
      input: normalizeSpeechInput(parsed.data.input),
      response_format: "mp3",
      speed: parsed.data.speed,
      instructions:
        "Speak in a clear Indian female recipe narrator voice. Prioritize clean pronunciation and easy understanding over dramatic naturalness. Keep the delivery smooth, steady, and continuous, without long pauses, broken phrases, or robotic stops. Pronounce the brand name clearly as 'क्या खाएं'.",
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.json(message || "Unable to generate AI voice.", {
      status: response.status,
    });
  }

  const audio = await response.arrayBuffer();
  return new Response(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": 'inline; filename="kyakhayen-reel-voice.mp3"',
      "Cache-Control": "no-store",
    },
  });
}
