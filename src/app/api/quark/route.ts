/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2026-01-14 17:51:27
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-14 17:59:22
 * @Description: 夸克-今日热点
 */
import dayjs from 'dayjs';
import { NextResponse } from 'next/server';

import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export const revalidate = 600;

export async function GET() {
  // 官方 url
  const url = 'https://iflow.quark.cn/iflow/api/v1/article/aggregation?aggregation_id=16665090098771297825&count=50&bottom_pos=0';
  try {
    // 请求数据
    const response = await fetch(url);
    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓�?
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：夸�?今日热点`);
    }
    // 得到请求�?
    const responseBody = await response.json();
    // 处理数据
    if (responseBody.status === 0) {
      const result: App.HotListItem[] = responseBody.data.articles.map((v) => {
        return {
          id: v.id,
          title: v.title,
          tip: dayjs(v.publish_time).format('HH:mm'),
          url: `https://123.quark.cn/detail?item_id=${v.id}`,
          mobileUrl: `https://123.quark.cn/detail?item_id=${v.id}`,
        };
      });
      return NextResponse.json(responseSuccess(result));
    }
    return NextResponse.json(responseSuccess());
  } catch {
    return NextResponse.json(responseError);
  }
}