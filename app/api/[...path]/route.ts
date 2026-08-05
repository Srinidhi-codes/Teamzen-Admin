import { NextRequest, NextResponse } from 'next/server';

// In Docker: INTERNAL_API_URL = http://backend:8000/api (container-to-container via Docker network)
// In local dev: falls back to NEXT_PUBLIC_API_URL = http://localhost:8000/api
const RAW_API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/';
// Strip /api if it exists so we can target root level endpoints like /graphql/
const DJANGO_BASE = RAW_API_URL.replace(/\/api\/?$/, '');

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;

    // If the Next.js route is /api/graphql, the path array is ['graphql']
    // For /api/users, the path array is ['users']
    const isGraphQL = path[0] === 'graphql';

    // Build the Django path. If it's not graphql, prepend 'api/' since we stripped it from base.
    const djangoPath = isGraphQL ? path.join('/') : `api/${path.join('/')}`;

    const trailingSlash = djangoPath.endsWith('/') ? '' : '/';
    const searchParams = request.nextUrl.searchParams.toString();
    const targetUrl = `${DJANGO_BASE}/${djangoPath}${trailingSlash}${searchParams ? `?${searchParams}` : ''}`;

    const accessToken = request.cookies.get('access_token')?.value;
    const forwardedHeaders: Record<string, string> = {};

    // Drop hop-by-hop / framing headers. We re-read the body below, so the
    // original content-length is often wrong and triggers UND_ERR_REQ_CONTENT_LENGTH_MISMATCH.
    const stripRequestHeaders = new Set([
        'host',
        'connection',
        'transfer-encoding',
        'cookie',
        'accept-encoding',
        'content-length',
        'content-encoding',
    ]);

    request.headers.forEach((value, key) => {
        if (!stripRequestHeaders.has(key.toLowerCase())) {
            forwardedHeaders[key] = value;
        }
    });

    if (accessToken) {
        forwardedHeaders['Authorization'] = `Bearer ${accessToken}`;
    }

    let body: BodyInit | undefined;
    const method = request.method;
    if (!['GET', 'HEAD', 'DELETE'].includes(method)) {
        body = await request.arrayBuffer();
    }

    try {
        const djangoResponse = await fetch(targetUrl, {
            method,
            headers: forwardedHeaders,
            body,
        });

        const responseHeaders = new Headers();
        djangoResponse.headers.forEach((value, key) => {
            // Next.js fetch automatically decompresses the response body.
            // If we forward the 'content-encoding' header (e.g. gzip) but serve 
            // the decompressed bytes, the browser will fail to decode it.
            // We also strip content-length because the uncompressed size differs.
            const stripHeaders = [
                'transfer-encoding',
                'connection',
                'keep-alive',
                'content-encoding',
                'content-length'
            ];
            if (!stripHeaders.includes(key.toLowerCase())) {
                responseHeaders.set(key, value);
            }
        });

        return new NextResponse(djangoResponse.body, {
            status: djangoResponse.status,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error(`[API Proxy] Error forwarding ${method} ${targetUrl}:`, error);
        return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
    }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
