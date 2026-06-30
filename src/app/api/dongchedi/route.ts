/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2026-01-14 14:02:20
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-14 14:02:29
 * @Description: 懂车�?热搜�?
 */
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

import { getCacheHeaders } from '@/lib/cache';
import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export async function GET() {
  // 官方 url
  const url = 'https://www.dongchedi.com/news';
  try {
    // 请求数据
    const response = await fetch(url);
    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓�?
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}懂车�?热搜榜`);
    }
    // 得到请求�?
    const responseBody = await response.text();
    const $ = cheerio.load(responseBody);
    const json = $('script#__NEXT_DATA__', responseBody).contents().text()
    const data = JSON.parse(json);
    const result: App.HotListItem[] = (data?.props?.pageProps?.hotSearchList || []).map((v, idx) => {
      return {
        id: idx + 1,
        title: v.title,
        hot: v.score,
        url: `https://www.dongchedi.com/search?keyword=${encodeURIComponent(v.title)}`,
        mobileUrl: `https://www.dongchedi.com/search?keyword=${encodeURIComponent(v.title)}`,
      };
    });
    return NextResponse.json(responseSuccess(result), { headers: getCacheHeaders('dongchedi') });
  } catch {
    return NextResponse.json(responseError);
  }
}