/**
 * 动态缓存策略：根据请求频率自动调整缓存时间
 * - 不频繁：10 分钟（600 秒）
 * - 频繁（5 分钟内 >10 次请求）：1 分钟（60 秒）
 */

interface RequestRecord {
  timestamps: number[];
}

const requestRecords = new Map<string, RequestRecord>();

const WINDOW_MS = 5 * 60 * 1000; // 5 分钟窗口
const FREQUENT_THRESHOLD = 10; // 频繁阈值
const DEFAULT_REVALIDATE = 600; // 默认 10 分钟
const FREQUENT_REVALIDATE = 60; // 频繁时 1 分钟

/**
 * 清理过期的时间戳
 */
function cleanTimestamps(timestamps: number[], now: number): number[] {
  return timestamps.filter((t) => now - t < WINDOW_MS);
}

/**
 * 记录请求并返回建议的缓存时间（秒）
 */
export function trackRequest(endpoint: string): number {
  const now = Date.now();
  let record = requestRecords.get(endpoint);

  if (!record) {
    record = { timestamps: [] };
    requestRecords.set(endpoint, record);
  }

  record.timestamps.push(now);
  record.timestamps = cleanTimestamps(record.timestamps, now);

  // 判断是否频繁
  if (record.timestamps.length > FREQUENT_THRESHOLD) {
    return FREQUENT_REVALIDATE;
  }
  return DEFAULT_REVALIDATE;
}

/**
 * 获取当前缓存时间（不记录请求）
 */
export function getCacheDuration(endpoint: string): number {
  const now = Date.now();
  const record = requestRecords.get(endpoint);
  if (!record) return DEFAULT_REVALIDATE;

  const recentCount = cleanTimestamps(record.timestamps, now).length;
  return recentCount > FREQUENT_THRESHOLD ? FREQUENT_REVALIDATE : DEFAULT_REVALIDATE;
}

/**
 * 生成 Cache-Control 头
 */
export function getCacheHeaders(endpoint: string): Record<string, string> {
  const revalidate = trackRequest(endpoint);
  return {
    'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate * 2}`,
  };
}
