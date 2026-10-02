import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".mpeg": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".png": "image/png",
  ".PNG": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".JPG": "image/jpeg",
  ".JPEG": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".json": "application/json",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const decodedSegments = pathSegments.map((s) => decodeURIComponent(s));

  // 1. Check local filesystem paths (works both locally and in Docker with mounted volume)
  const candidatePaths = [
    path.join(process.cwd(), "..", "Assets", ...decodedSegments),
    path.join(process.cwd(), "Assets", ...decodedSegments),
    path.join("/app", "Assets", ...decodedSegments),
    path.join("/Assets", ...decodedSegments),
  ];

  for (const localPath of candidatePaths) {
    try {
      if (fs.existsSync(localPath)) {
        const stat = fs.statSync(localPath);
        if (stat.isFile()) {
          const ext = path.extname(localPath).toLowerCase();
          const contentType = MIME_TYPES[ext] || "application/octet-stream";
          const fileSize = stat.size;

          const rangeHeader = request.headers.get("range");

          if (rangeHeader) {
            // Handle HTTP Range header for streaming audio/video seeking
            const parts = rangeHeader.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            if (start >= fileSize || end >= fileSize || start > end) {
              return new NextResponse(null, {
                status: 416,
                headers: { "Content-Range": `bytes */${fileSize}` },
              });
            }

            const chunksize = end - start + 1;
            const fileStream = fs.createReadStream(localPath, { start, end });
            // @ts-ignore Node stream to web stream adapter
            const stream = new ReadableStream({
              start(controller) {
                fileStream.on("data", (chunk) => controller.enqueue(chunk));
                fileStream.on("end", () => controller.close());
                fileStream.on("error", (err) => controller.error(err));
              },
            });

            return new NextResponse(stream, {
              status: 206,
              headers: {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": String(chunksize),
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400",
              },
            });
          }

          // Full file response
          const fileStream = fs.createReadStream(localPath);
          // @ts-ignore
          const stream = new ReadableStream({
            start(controller) {
              fileStream.on("data", (chunk) => controller.enqueue(chunk));
              fileStream.on("end", () => controller.close());
              fileStream.on("error", (err) => controller.error(err));
            },
          });

          return new NextResponse(stream, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Content-Length": String(fileSize),
              "Accept-Ranges": "bytes",
              "Cache-Control": "public, max-age=86400",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      }
    } catch {}
  }

  // 2. Direct Cloud CDN Streaming Proxy (Zero VPS Disk footprint, iOS-compatible)
  const githubRepo = process.env.GITHUB_REPO || "rajeshc-git/babu";
  const githubBranch = process.env.GITHUB_BRANCH || "main";
  const encodedPath = decodedSegments.map((segment) => encodeURIComponent(segment)).join("/");
  
  // Determine if file is tracked by Git LFS (.mp3, .mp4, .mov, .heic)
  const ext = path.extname(decodedSegments[decodedSegments.length - 1] || "").toLowerCase();
  const isLfs = [".mp3", ".mp4", ".mov", ".heic"].includes(ext);

  const cdnUrl = isLfs
    ? `https://media.githubusercontent.com/media/${githubRepo}/${githubBranch}/Assets/${encodedPath}`
    : `https://raw.githubusercontent.com/${githubRepo}/${githubBranch}/Assets/${encodedPath}`;

  try {
    const fetchHeaders: Record<string, string> = {
      "User-Agent": "Babu-Memorial-Media-Proxy",
    };
    const rangeHeader = request.headers.get("range");
    if (rangeHeader) {
      fetchHeaders["range"] = rangeHeader;
    }

    const ghRes = await fetch(cdnUrl, {
      headers: fetchHeaders,
    });

    if (ghRes.ok || ghRes.status === 206) {
      // Force iOS-compatible audio MIME type for all voice recordings
      let contentType = MIME_TYPES[ext] || "application/octet-stream";
      if (ext === ".mpeg" || decodedSegments.some(s => s.toLowerCase().includes("voice"))) {
        contentType = "audio/mpeg";
      }

      const headers = new Headers();
      headers.set("Content-Type", contentType);
      headers.set("Content-Disposition", "inline");
      headers.set("Cache-Control", "public, max-age=86400");
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Accept-Ranges", "bytes");

      const contentLength = ghRes.headers.get("content-length");
      if (contentLength) headers.set("Content-Length", contentLength);

      const contentRange = ghRes.headers.get("content-range");
      if (contentRange) headers.set("Content-Range", contentRange);

      return new NextResponse(ghRes.body, {
        status: ghRes.status,
        headers,
      });
    }
  } catch (err) {
    console.error("GitHub CDN fetch error:", err);
  }

  // Final fallback: 307 redirect
  return NextResponse.redirect(cdnUrl, {
    status: 307,
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
