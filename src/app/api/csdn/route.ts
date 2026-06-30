/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2026-01-21 09:20:44
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-21 09:54:17
 * @Description: CSDN - 热榜
 */
import { NextResponse } from 'next/server';

import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export async function GET() {
  // 官方 url
  const url = 'https://blog.csdn.net/phoenix/web/blog/hot-rank?page=0&pageSize=100';
  try {
    // 请求数据
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
    });
    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓�?
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)} CSDN - 热榜`);
    }
    // 得到请求�?
    const responseBody = await response.json();
    // 处理数据
    if (responseBody.code === 200) {
      const result: App.HotListItem[] = responseBody.data.map((v) => {
        return {
          id: v.articleDetailUrl,
          title: v.articleTitle,
          tip: v.pcHotRankScore,
          url: v.articleDetailUrl,
          mobileUrl: v.articleDetailUrl,
        };
      });
      return NextResponse.json(responseSuccess(result));
    }
    return NextResponse.json(responseSuccess());
  } catch {
    return NextResponse.json(responseError);
  }
}