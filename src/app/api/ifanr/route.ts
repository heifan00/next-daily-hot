/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2026-01-26 15:39:27
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-26 15:41:04
 * @Description: 爱范�?- 快讯
 */
import { NextResponse } from 'next/server';

import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export const revalidate = 600;

export async function GET() {
  // 官方 url
  const url = 'https://sso.ifanr.com/api/v5/wp/buzz/?limit=50&offset=0';
  try {
    // 请求数据
    const response = await fetch(url);
    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓�?
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：爱范儿 - 快讯`);
    }
    // 得到请求�?
    const responseBody = await response.json();
    const data = responseBody?.objects;
    if (!data) {
      return NextResponse.json(responseSuccess());
    }
    const result: App.HotListItem[] = data.map((v) => {
      return {
        id: v.post_id,
        title: v.post_title,
        url: v.buzz_original_url || `https://www.ifanr.com/${v.post_id}`,
        mobileUrl: v.buzz_original_url || `https://www.ifanr.com/digest/${v.post_id}`,
      };
    });
    return NextResponse.json(responseSuccess(result));
  } catch {
    return NextResponse.json(responseError);
  }
}