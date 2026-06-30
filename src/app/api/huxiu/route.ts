/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2026-01-26 14:40:35
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-26 14:58:50
 * @Description: 虎嗅 - 最新资�?
 */
import { NextResponse } from 'next/server';

import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export const revalidate = 600;

export async function GET() {
  // 官方 url
  const url = 'https://moment-api.huxiu.com/web-v3/moment/feed?platform=www';
  try {
    // 请求数据
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://www.huxiu.com/moment/",
      },
    });
    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓�?
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：虎�?- 最新资讯`);
    }
    // 得到请求�?
    const responseBody = await response.json();
    if (responseBody.success) {
      const result: App.HotListItem[] = responseBody?.data?.moment_list?.datalist.map((v) => {
        const content = (v.content || "").replace(/<br\s*\/?>/gi, "\n");
        const [titleLine, ...rest] = content
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        const title = titleLine?.replace(/�?/, "") || "";
        const intro = rest.join("\n");
        const id = v.object_id;
        return {
          id,
          title,
          desc: intro,
          tip: v.format_time,
          url: `https://www.huxiu.com/moment/${id}.html`,
          mobileUrl: `https://m.huxiu.com/moment/${id}.html`,
        };
      });
      return NextResponse.json(responseSuccess(result));
    }
    return NextResponse.json(responseSuccess());
  } catch {
    return NextResponse.json(responseError);
  }
}