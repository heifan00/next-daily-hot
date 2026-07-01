/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2024-05-14 10:16:28
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-01-04 18:09:18
 * @Description: 快手-热榜
 */
import { NextResponse } from 'next/server';

import { getCacheHeaders } from '@/lib/cache';

import { RESPONSE } from '@/enums';
import { getHotProxyRequest } from '@/lib/hotProxy';
import { logHotSourceDebug, logHotSourceError, readHotSourceText } from '@/lib/hotSourceDebug';
import { responseError, responseSuccess } from '@/lib/utils';

export async function GET() {
  // 官方 url
  const upstreamUrl = 'https://www.kuaishou.com/?isHome=1';
  const request = getHotProxyRequest('kuaishou', upstreamUrl);
  try {
    // 请求数据
    const response = await fetch(request.url, request.init);
    const responseBody = await readHotSourceText('kuaishou', request.url, response);

    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓存
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：快手-热榜`);
    }
    // 处理数据
    const result: App.HotListItem[] = [];
    const pattern = /window.__APOLLO_STATE__=(.*);\(function\(\)/s;
    const idPattern = /clientCacheKey=([A-Za-z0-9]+)/s;
    const matchResult = responseBody.match(pattern);

    if (!matchResult) {
      logHotSourceDebug('kuaishou', request.url, {
        stage: 'apollo-state-missing',
        hasVisionHotRank: responseBody.includes('visionHotRank'),
        proxied: request.proxied,
      });
    }

    const jsonObject = matchResult ? JSON.parse(matchResult[1])['defaultClient'] : [];

    // 获取所有分类
    const allItems = jsonObject['$ROOT_QUERY.visionHotRank({"page":"home"})']?.items || [];
    if (!allItems?.length) {
      logHotSourceDebug('kuaishou', request.url, {
        stage: 'parsed-empty',
        proxied: request.proxied,
      });
    }

    // 遍历所有分类
    allItems.forEach((v) => {
      // 基础数据
      const image = jsonObject[v.id]['poster'];
      const id = image.match(idPattern)[1];
      // 数据处理
      result.push({
        id,
        title: jsonObject[v.id]['name'],
        hot: jsonObject[v.id]['hotValue']?.replace('万', '') * 10000,
        url: `https://www.kuaishou.com/short-video/${id}`,
        mobileUrl: `https://www.kuaishou.com/short-video/${id}`,
      });
    });
    return NextResponse.json(responseSuccess(result), { headers: getCacheHeaders('kuaishou') });
  } catch (error) {
    logHotSourceError('kuaishou', request.url, error);

    return NextResponse.json(responseError);
  }
}
