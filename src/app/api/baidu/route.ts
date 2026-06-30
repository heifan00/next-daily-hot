/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2024-05-14 09:33:19
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-15 10:27:02
 * @Description: 百度-热搜�?
 */
import { NextResponse } from 'next/server';

import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export const revalidate = 600;

export async function GET() {
  // 官方 url
  const url = 'https://top.baidu.com/api/board?platform=wise&tab=realtime';
  try {
    // 请求数据
    const response = await fetch(url);
    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓�?
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：百�?热搜榜`);
    }
    // 得到请求�?
    const responseBody = await response.json();
    // 处理数据
    if (responseBody.success) {
      const result: App.HotListItem[] = responseBody.data.cards[0]?.content[0]?.content.map((v) => {
        return {
          id: v.index,
          title: v.word,
          label: v.newHotName,
          url: `https://www.baidu.com/s?wd=${encodeURIComponent(v.word)}`,
          mobileUrl: v.url,
        };
      });
      return NextResponse.json(responseSuccess(result));
    }
    return NextResponse.json(responseSuccess());
  } catch {
    return NextResponse.json(responseError);
  }
}