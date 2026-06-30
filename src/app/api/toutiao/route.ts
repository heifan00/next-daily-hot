/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2024-05-14 09:19:59
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-04 18:11:42
 * @Description: 今日头条-热榜
 */
import { NextResponse } from 'next/server';

import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export const revalidate = 600;

export async function GET() {
  // 官方 url
  const url = 'https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc';
  try {
    // 请求数据
    const response = await fetch(url);
    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓�?
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：今日头�?热榜`);
    }
    // 得到请求�?
    const responseBody = await response.json();
    // 处理数据
    if (responseBody.status === 'success') {
      const result: App.HotListItem[] = responseBody.data.map((v) => {
        return {
          id: v.ClusterId,
          title: v.Title,
          pic: v.Image.url,
          hot: v.HotValue,
          url: `https://www.toutiao.com/trending/${v.ClusterIdStr}/`,
          mobileUrl: `https://api.toutiaoapi.com/feoffline/amos_land/new/html/main/index.html?topic_id=${v.ClusterIdStr}`,
        };
      });
      return NextResponse.json(responseSuccess(result));
    }
    return NextResponse.json(responseSuccess());
  } catch {
    return NextResponse.json(responseError);
  }
}
