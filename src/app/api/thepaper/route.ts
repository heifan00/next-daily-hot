/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2024-05-14 10:12:17
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-04 18:11:17
 * @Description: 澎湃新闻-热榜
 */
import { NextResponse } from 'next/server';

import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export const revalidate = 600;

export async function GET() {
  // 官方 url
  const url = 'https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar';
  try {
    // 请求数据
    const response = await fetch(url);
    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓�?
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：澎湃新�?热榜`);
    }
    // 得到请求�?
    const responseBody = await response.json();
    // 处理数据
    if (responseBody.resultCode === 1) {
      const result: App.HotListItem[] = responseBody.data.hotNews.map((v) => {
        return {
          id: v.contId,
          title: v.name,
          pic: v.pic,
          hot: v.praiseTimes,
          url: `https://www.thepaper.cn/newsDetail_forward_${v.contId}`,
          mobileUrl: `https://m.thepaper.cn/newsDetail_forward_${v.contId}`,
        };
      });
      return NextResponse.json(responseSuccess(result));
    }
    return NextResponse.json(responseSuccess());
  } catch {
    return NextResponse.json(responseError);
  }
}
