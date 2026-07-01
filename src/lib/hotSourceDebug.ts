const HOT_SOURCE_DEBUG_PREFIX = '[hot-source-debug]';
const BODY_PREVIEW_LENGTH = 300;

function toErrorInfo(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 4).join('\n'),
    };
  }

  return {
    message: String(error),
  };
}

export async function readHotSourceText(
  source: string,
  upstreamUrl: string,
  response: Response,
) {
  const body = await response.text();

  console.error(HOT_SOURCE_DEBUG_PREFIX, {
    source,
    upstreamUrl,
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get('content-type'),
    bodyLength: body.length,
    bodyStart: body.slice(0, BODY_PREVIEW_LENGTH),
  });

  return body;
}

export function logHotSourceDebug(
  source: string,
  upstreamUrl: string,
  details: Record<string, unknown>,
) {
  console.error(HOT_SOURCE_DEBUG_PREFIX, {
    source,
    upstreamUrl,
    ...details,
  });
}

export function logHotSourceError(
  source: string,
  upstreamUrl: string,
  error: unknown,
) {
  logHotSourceDebug(source, upstreamUrl, {
    stage: 'catch',
    error: toErrorInfo(error),
  });
}
