/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2024-05-11 14:37:26
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-15 10:23:02
 * @Description: 微博-热搜�?
 */
import { NextResponse } from 'next/server';

import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export const revalidate = 600;

export async function GET() {
  // 官方 url
  const url = 'https://weibo.com/ajax/side/hotSearch';
  try {
    // 请求数据
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://weibo.com/',
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓�?
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：微�?热搜榜`);
    }
    // 得到请求�?
    const responseBody = await response.json();
    // 处理数据
    if (responseBody.ok === 1) {
      const result: App.HotListItem[] = responseBody.data.realtime.map((v) => {
        const key = v.word_scheme ? v.word_scheme : `#${v.word}`;
        return {
          id: v.mid,
          title: v.word,
          desc: key,
          hot: v.num,
          label: v.label_name,
          url: `https://s.weibo.com/weibo?q=${encodeURIComponent(key)}&t=31&band_rank=1&Refer=top`,
          mobileUrl: `https://s.weibo.com/weibo?q=${encodeURIComponent(key)}&t=31&band_rank=1&Refer=top`,
        };
      });
      return NextResponse.json(responseSuccess(result));
    }
    return NextResponse.json(responseSuccess());
  } catch {
    return NextResponse.json(responseError);
  }
}

