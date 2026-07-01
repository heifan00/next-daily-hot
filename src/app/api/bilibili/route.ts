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
import { logHotSourceDebug, logHotSourceError, readHotSourceText } from '@/lib/hotSourceDebug';
import { responseError, responseSuccess } from '@/lib/utils';

export async function GET() {
  // 使用 JSONP 回调接口，兼容 Cloudflare Workers
  const url = 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all&callback=__jp0';
  try {
    const response = await fetch(url, {
      headers: {
        Referer: 'https://www.bilibili.com/ranking/all',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      },
    });

    const text = await readHotSourceText('bilibili', url, response);

    if (!response.ok) {
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：哔哩哔哩-热门榜`);
    }

    // 响应是 JSONP 格式：__jp0({...})
    const jsonStr = text.replace(/^__jp0\(/, '').replace(/\)$/, '');
    const responseBody = JSON.parse(jsonStr);

    const list = responseBody?.data?.list;

    if (!list?.length) {
      logHotSourceDebug('bilibili', url, {
        stage: 'parsed-empty',
        dataKeys: Object.keys(responseBody?.data || {}),
      });

      return NextResponse.json(responseSuccess(), { headers: getCacheHeaders('bilibili') });
    }

    const result: App.HotListItem[] = list.map((v) => ({
      id: v.bvid,
      title: v.title,
      desc: v.desc || '该视频暂无简介',
      pic: v.pic?.replace(/http:/, 'https:'),
      hot: v.stat?.view || 0,
      url: `https://b23.tv/${v.bvid}`,
      mobileUrl: `https://m.bilibili.com/video/${v.bvid}`,
    }));

    return NextResponse.json(responseSuccess(result), { headers: getCacheHeaders('bilibili') });
  } catch (error) {
    logHotSourceError('bilibili', url, error);

    return NextResponse.json(responseError);
  }
}
