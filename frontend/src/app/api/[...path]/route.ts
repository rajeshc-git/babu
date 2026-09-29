import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function proxyRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const subPath = path.join("/");
  const search = request.nextUrl.search;

  // Resolve backend URL dynamically at runtime from environment variable
  const backendBase = process.env.BACKEND_URL || "http://backend:8530";
  const targetUrl = `${backendBase}/api/${subPath}${search}`;

  try {
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Avoid passing host or connection headers
      if (!["host", "connection", "content-length"].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    const options: RequestInit = {
      method: request.method,
      headers,
    };

    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      options.body = await request.arrayBuffer();
    }

    const response = await fetch(targetUrl, options);
    const body = await response.arrayBuffer();

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    return new NextResponse(body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    // If backend container isn't reachable, try localhost fallback
    if (backendBase !== "http://localhost:8530") {
      try {
        const fallbackUrl = `http://localhost:8530/api/${subPath}${search}`;
        const response = await fetch(fallbackUrl, {
          method: request.method,
        });
        const body = await response.arrayBuffer();
        return new NextResponse(body, { status: response.status });
      } catch (e) {}
    }

    return NextResponse.json(
      { error: "Backend proxy error", details: String(error) },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
