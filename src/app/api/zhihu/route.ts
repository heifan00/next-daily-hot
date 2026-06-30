/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2024-05-14 09:28:41
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-04 18:12:56
 * @Description: 知乎-热榜
 */
import { NextResponse } from 'next/server';

import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export const revalidate = 600;

export async function GET() {
  // 官方 url
  const url = 'https://api.zhihu.com/topstory/hot-list';
  try {
    // 请求数据
    const response = await fetch(url);
    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓�?
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：知�?热榜`);
    }
    // 得到请求�?
    const responseBody = await response.json();
    // 处理数据
    if (responseBody.data) {
      const result: App.HotListItem[] = responseBody.data.map((v) => {
        return {
          id: v.id,
          title: v.target.title,
          pic: v.children[0].thumbnail,
          hot: parseInt(v.detail_text.replace(/[^\d]/g, '')) * 10000,
          url: `https://www.zhihu.com/question/${v.card_id.replace('Q_', '')}`,
          mobileUrl: `https://www.zhihu.com/question/${v.card_id.replace('Q_', '')}`,
        };
      });
      return NextResponse.json(responseSuccess(result));
    }
    return NextResponse.json(responseSuccess());
  } catch {
    return NextResponse.json(responseError);
  }
}
