import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  
  // Encode each segment of the path to handle spaces safely (e.g. "Rajesh Father.png", "Babu Voice 1.mp3")
  const encodedPath = path.map((segment) => encodeURIComponent(segment)).join("/");
  
  const githubRepo = process.env.GITHUB_REPO || "rajeshc-git/babu";
  const githubBranch = process.env.GITHUB_BRANCH || "main";
  
  const targetUrl = `https://raw.githubusercontent.com/${githubRepo}/${githubBranch}/Assets/${encodedPath}`;

  // Direct 307 redirect so client browsers stream directly from GitHub's global CDN
  return NextResponse.redirect(targetUrl, {
    status: 307,
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
