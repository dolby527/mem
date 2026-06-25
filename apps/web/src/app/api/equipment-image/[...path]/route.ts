import { readFileSync, existsSync } from "node:fs";
import { join, normalize } from "node:path";
import { NextResponse } from "next/server";

const UPLOAD_ROOT = join(process.cwd(), "../../uploads/equipment");
const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (!path?.length || path.length !== 2 || path.some((p) => p.includes(".."))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const [hospitalId, filename] = path.map((p) => decodeURIComponent(p));
  if (!hospitalId || !filename || !/^[a-z0-9]+(?:-[a-z0-9]+)*\.(jpg|jpeg|png|webp)$/i.test(filename)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const relative = normalize(join(hospitalId, filename));
  const fullPath = join(UPLOAD_ROOT, relative);

  if (!fullPath.startsWith(UPLOAD_ROOT) || !existsSync(fullPath)) {
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
