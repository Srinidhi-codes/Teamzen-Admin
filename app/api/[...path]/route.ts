import { NextRequest, NextResponse } from 'next/server';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';
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

    request.headers.forEach((value, key) => {
        // Strip accept-encoding to prevent backend from gzipping, 
        // passing compressed bytes verbatim can cause ERR_CONTENT_DECODING_FAILED
        if (!['host', 'connection', 'transfer-encoding', 'cookie', 'accept-encoding'].includes(key.toLowerCase())) {
            forwardedHeaders[key] = value;
        }
    });

    if (accessToken) {
        forwardedHeaders['Authorization'] = `Bearer ${accessToken}`;
    }

    let body: BodyInit | undefined;
    const method = request.method;
    if (!['GET', 'HEAD', 'DELETE'].includes(method)) {
        body = await request.blob();
    }

    try {
        const djangoResponse = await fetch(targetUrl, {
            method,
            headers: forwardedHeaders,
            body,
        });

        const responseHeaders = new Headers();
        djangoResponse.headers.forEach((value, key) => {
            if (!['transfer-encoding', 'connection', 'keep-alive'].includes(key.toLowerCase())) {
                responseHeaders.set(key, value);
            }
        });

        const responseBody = await djangoResponse.arrayBuffer();

        return new NextResponse(responseBody, {
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
