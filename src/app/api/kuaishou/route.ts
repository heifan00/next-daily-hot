/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2024-05-14 10:16:28
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-01-04 18:09:18
 * @Description: 快手-热榜
 */
import { NextResponse } from 'next/server';

import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

const parseChineseNumber = (str: string): number => {
  if (!str) return 0;
  const clean = str.replace(/,/g, '');
  if (clean.includes('万')) {
    return parseFloat(clean.replace('万', '')) * 10000;
  }
  return Number(clean) || 0;
};

export async function GET() {
  const url = 'https://www.kuaishou.com/?isHome=1';
  try {
    // 使用随机桌面 UA
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：快手-热榜`);
    }

    const html = await response.text();

    // 从 __APOLLO_STATE__ 中提取数据
    const start = html.indexOf('window.__APOLLO_STATE__=');
    if (start === -1) {
      throw new Error('快手页面结构变更，未找到 APOLLO_STATE');
    }

    const scriptSlice = html.slice(start + 'window.__APOLLO_STATE__='.length);
    const sentinelA = scriptSlice.indexOf(';(function(');
    const sentinelB = scriptSlice.indexOf('</script>');
    const cutIndex =
      sentinelA !== -1 && sentinelB !== -1
        ? Math.min(sentinelA, sentinelB)
        : Math.max(sentinelA, sentinelB);

    if (cutIndex === -1) {
      throw new Error('快手数据解析失败：未找到结束标记');
    }

    const raw = scriptSlice.slice(0, cutIndex).trim().replace(/;$/, '');
    const lastBrace = raw.lastIndexOf('}');
    const cleanRaw = lastBrace !== -1 ? raw.slice(0, lastBrace + 1) : raw;

    let jsonObject: Record<string, any>;
    try {
      jsonObject = JSON.parse(cleanRaw)['defaultClient'];
    } catch {
      throw new Error('快手数据 JSON 解析失败');
    }

    // 获取热榜列表
    const allItems =
      jsonObject['$ROOT_QUERY.visionHotRank({"page":"home"})']?.items ||
      jsonObject['$ROOT_QUERY.visionHotRank({"page":"home","platform":"web"})']?.items ||
      [];

    const result: App.HotListItem[] = [];

    allItems.forEach((item: { id: string }) => {
      const hotItem = jsonObject[item.id];
      if (!hotItem) return;

      // 从 poster URL 中提取视频 ID
      const poster = hotItem.poster || '';
      const idMatch = poster.match(/clientCacheKey=([^&]+)/);
      const videoId = idMatch?.[1] || hotItem.photoIds?.json?.[0] || hotItem.id;

      result.push({
        id: hotItem.id,
        title: hotItem.name,
        pic: poster ? decodeURIComponent(poster.split('&di=')[0]) : '',
        hot: parseChineseNumber(String(hotItem.hotValue ?? '')),
        url: `https://www.kuaishou.com/short-video/${videoId}`,
        mobileUrl: `https://www.kuaishou.com/short-video/${videoId}`,
      });
    });

    return NextResponse.json(responseSuccess(result));
  } catch {
    return NextResponse.json(responseError);
  }
}
