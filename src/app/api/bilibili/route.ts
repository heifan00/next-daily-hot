/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2024-05-13 16:25:11
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-01-04 18:07:00
 * @Description: 哔哩哔哩-热门榜
 */
import { NextResponse } from 'next/server';

import { getCacheHeaders } from '@/lib/cache';
import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export async function GET() {
  // 使用 popular 接口，无需 WBI 签名，兼容性好
  const url = 'https://api.bilibili.com/x/web-interface/popular?ps=40&pn=1';
  try {
    const response = await fetch(url, {
      headers: {
        Referer: 'https://www.bilibili.com',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：哔哩哔哩-热门榜`);
    }

    const responseBody = await response.json();
    const list = responseBody?.data?.list;

    if (!list?.length) {
      return NextResponse.json(responseSuccess(), { headers: getCacheHeaders('bilibili') });
    }

    const result: App.HotListItem[] = list.map((v) => ({
      id: v.bvid,
      title: v.title,
      desc: v.desc || '该视频暂无简介',
      pic: v.pic?.replace(/http:/, 'https:'),
      hot: v.stat?.view || 0,
      url: v.short_link_v2 || `https://b23.tv/${v.bvid}`,
      mobileUrl: `https://m.bilibili.com/video/${v.bvid}`,
    }));

    return NextResponse.json(responseSuccess(result), { headers: getCacheHeaders('bilibili') });
  } catch {
    return NextResponse.json(responseError);
  }
}
