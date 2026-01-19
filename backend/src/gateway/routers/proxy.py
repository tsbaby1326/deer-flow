import logging
from collections.abc import AsyncGenerator

import httpx
from fastapi import APIRouter, Request, Response
from fastapi.responses import StreamingResponse

from src.gateway.config import get_gateway_config

logger = logging.getLogger(__name__)

router = APIRouter(tags=["proxy"])

# Shared httpx client for all proxy requests
# This avoids creating/closing clients during streaming responses
_http_client: httpx.AsyncClient | None = None


def get_http_client() -> httpx.AsyncClient:
    """Get or create the shared HTTP client.

    Returns:
        The shared httpx AsyncClient instance.
    """
    global _http_client
    if _http_client is None:
        _http_client = httpx.AsyncClient()
    return _http_client


async def close_http_client() -> None:
    """Close the shared HTTP client if it exists."""
    global _http_client
    if _http_client is not None:
        await _http_client.aclose()
        _http_client = None


# Hop-by-hop headers that should not be forwarded
EXCLUDED_HEADERS = {
    "host",
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "content-length",
}


async def stream_sse_response(stream_ctx, response: httpx.Response) -> AsyncGenerator[bytes, None]:
    """Stream SSE response from the upstream server.

    Args:
        stream_ctx: The httpx stream context manager.
        response: The httpx streaming response.

    Yields:
        Response chunks.
    """
    try:
        async for chunk in response.aiter_bytes():
            yield chunk
    finally:
        # Ensure stream is properly closed when done
        await stream_ctx.__aexit__(None, None, None)


async def proxy_request(request: Request, path: str) -> Response | StreamingResponse:
    """Proxy a request to the LangGraph server.

    Args:
        request: The incoming FastAPI request.
        path: The path to proxy to.

    Returns:
        Response or StreamingResponse depending on content type.
    """
    config = get_gateway_config()
    target_url = f"{config.langgraph_url}/{path}"

    # Preserve query parameters
    if request.url.query:
        target_url = f"{target_url}?{request.url.query}"

    # Prepare headers (exclude hop-by-hop headers)
    headers = {key: value for key, value in request.headers.items() if key.lower() not in EXCLUDED_HEADERS}

    # Read request body for non-GET requests
    body = None
    if request.method not in ("GET", "HEAD"):
        body = await request.body()

    client = get_http_client()

    try:
        # Use streaming request to avoid waiting for full response
        # This allows us to check headers immediately and stream SSE without delay
        stream_ctx = client.stream(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
            timeout=config.stream_timeout,
        )

        response = await stream_ctx.__aenter__()

        content_type = response.headers.get("content-type", "")

        # Check if response is SSE (Server-Sent Events)
        if "text/event-stream" in content_type:
            # For SSE, stream the response immediately
            return StreamingResponse(
                stream_sse_response(stream_ctx, response),
                status_code=response.status_code,
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",
                },
            )

        # For non-SSE responses, read full content and close the stream
        content = await response.aread()
        await stream_ctx.__aexit__(None, None, None)

        # Prepare response headers
        response_headers = dict(response.headers)
        for header in ["transfer-encoding", "connection", "keep-alive"]:
            response_headers.pop(header, None)

        return Response(
            content=content,
            status_code=response.status_code,
            headers=response_headers,
        )

    except httpx.TimeoutException:
        logger.error(f"Proxy request to {target_url} timed out")
        return Response(
            content='{"error": "Proxy request timed out"}',
            status_code=504,
            media_type="application/json",
        )
    except httpx.RequestError as e:
        logger.error(f"Proxy request to {target_url} failed: {e}")
        return Response(
            content='{"error": "Proxy request failed"}',
            status_code=502,
            media_type="application/json",
        )


@router.api_route(
    "/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
)
async def proxy_langgraph(request: Request, path: str) -> Response:
    """Proxy all requests to LangGraph server.

    This catch-all route forwards requests to the LangGraph server.
    """
    return await proxy_request(request, path)
