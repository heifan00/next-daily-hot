/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2026-01-26 14:03:29
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-26 14:18:34
 * @Description: 36kr - 24小时热榜
 */
import { NextResponse } from 'next/server';

import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export const revalidate = 600;

export async function GET() {
  // 官方 url
  const url = 'https://gateway.36kr.com/api/mis/nav/home/nav/rank/hot';
  try {
    // 请求数据
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        partner_id: "wap",
        param: {
          siteId: 1,
          platformId: 2,
        },
        timestamp: new Date().getTime(),
      }),
    });
    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓�?
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}�?6kr - 24小时热榜`);
    }
    // 得到请求�?
    const responseBody = await response.json();
    // 处理数据
    if (responseBody.code === 0) {
      const result: App.HotListItem[] = responseBody.data?.hotRankList.map((v) => {
        return {
          id: v.itemId,
          title: v?.templateMaterial?.widgetTitle,
          pic: v?.templateMaterial.widgetImage,
          hot: v?.templateMaterial.statRead,
          url: `https://www.36kr.com/p/${v.itemId}`,
          mobileUrl: `https://m.36kr.com/p/${v.itemId}`,
        };
      });
      return NextResponse.json(responseSuccess(result));
    }
    return NextResponse.json(responseSuccess());
  } catch {
    return NextResponse.json(responseError);
  }
}