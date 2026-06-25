import { readFileSync, existsSync } from "node:fs";
import { join, normalize } from "node:path";
import { NextResponse } from "next/server";

const SEED_IMAGES = join(process.cwd(), "../../docs/seed/images");
const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (!path?.length || path.some((p) => p.includes(".."))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const relative = normalize(join(...path));
  const fullPath = join(SEED_IMAGES, relative);

  if (!fullPath.startsWith(SEED_IMAGES) || !existsSync(fullPath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = fullPath.split(".").pop()?.toLowerCase() ?? "jpg";
  const body = readFileSync(fullPath);

  return new NextResponse(body, {
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
