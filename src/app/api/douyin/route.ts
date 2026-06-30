/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2024-05-14 09:14:07
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-04 18:07:56
 * @Description: 抖音-热点�?
 */
import { NextResponse } from 'next/server';

import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export const revalidate = 600;

export async function GET() {
  // 官方 url
  const url = 'https://aweme.snssdk.com/aweme/v1/hot/search/list/';
  try {
    // 请求数据
    const response = await fetch(url);
    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓�?
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：抖�?热点榜`);
    }
    // 得到请求�?
    const responseBody = await response.json();
    // 处理数据
    const wordList = responseBody.data?.word_list;
    if (wordList?.length) {
      const result: App.HotListItem[] = wordList.map((v) => {
        return {
          id: v.group_id,
          title: v.word,
          pic: `${v.word_cover?.url_list?.[0] || ''}`,
          hot: Number(v.hot_value),
          url: `https://www.douyin.com/hot/${encodeURIComponent(v.sentence_id)}`,
          mobileUrl: `https://www.douyin.com/hot/${encodeURIComponent(v.sentence_id)}`,
        };
      });
      return NextResponse.json(responseSuccess(result));
    }
    return NextResponse.json(responseSuccess());
  } catch {
    return NextResponse.json(responseError);
  }
}

