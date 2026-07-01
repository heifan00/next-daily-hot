type ProxySource = 'bilibili' | 'hupu' | 'kuaishou';

const proxyPaths: Record<ProxySource, string> = {
  bilibili: '/hot/bilibili',
  hupu: '/hot/hupu',
  kuaishou: '/hot/kuaishou',
};

export function getHotProxyRequest(
  source: ProxySource,
  fallbackUrl: string,
  init?: RequestInit,
): { url: string; init?: RequestInit; proxied: boolean } {
  const proxyBase = process.env.HOT_PROXY_BASE?.replace(/\/$/, '');
  const proxyToken = process.env.HOT_PROXY_TOKEN;

  if (!proxyBase || !proxyToken) {
    return { url: fallbackUrl, init, proxied: false };
  }

  const headers = new Headers(init?.headers);
  headers.set('x-proxy-token', proxyToken);

  return {
    url: `${proxyBase}${proxyPaths[source]}`,
    init: {
      ...init,
      headers,
    },
    proxied: true,
  };
}
