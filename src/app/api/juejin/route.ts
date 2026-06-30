/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2024-05-14 09:47:41
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-04 18:08:51
 * @Description: 稀土掘�?热榜
 */
import { NextResponse } from 'next/server';

import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export const revalidate = 600;

export async function GET() {
  // 官方 url
  const url = 'https://api.juejin.cn/content_api/v1/content/article_rank?category_id=1&type=hot';
  try {
    // 请求数据
    const response = await fetch(url);
    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓�?
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：稀土掘�?热榜`);
    }
    // 得到请求�?
    const responseBody = await response.json();
    // 处理数据
    if (responseBody.err_msg === 'success') {
      const result: App.HotListItem[] = responseBody.data.map((v) => {
        return {
          id: v.content.content_id,
          title: v.content.title,
          hot: v.content_counter.hot_rank,
          url: `https://juejin.cn/post/${v.content.content_id}`,
          mobileUrl: `https://juejin.cn/post/${v.content.content_id}`,
        };
      });
      return NextResponse.json(responseSuccess(result));
    }
    return NextResponse.json(responseSuccess());
  } catch {
    return NextResponse.json(responseError);
  }
}
