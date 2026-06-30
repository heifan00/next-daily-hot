/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2026-01-20 15:22:39
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-21 14:12:45
 * @Description: Github - 热门仓库
 */

import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export async function GET() {
  // 官方 url
  const url = 'https://github.com';
  try {
    // 请求数据
    const response = await fetch(`${url}/trending`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
    });
    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓�?
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：Github - 热门仓库`);
    }

    // 格式�?star �?
    function formatStars(count: number): string {
      if (count < 1000) return count.toString();

      if (count < 1_000_000) {
        return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
      }

      return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }

    // 得到请求�?
    const responseBody = await response.text();
    const $ = cheerio.load(responseBody);
    const listDom = $('.Box article.Box-row');
    const result: App.HotListItem[] = listDom.get().map((repo, index) => {
      const $repo = $(repo);
      const relativeUrl = $repo.find('.h3').find('a').attr('href');
      return {
        id: relativeUrl || String(index),
        title: (relativeUrl || '').replace(/^\//, ''),
        desc: $repo.find('p.my-1').text().trim() || '',
        tip: formatStars(parseInt(
          $repo
            .find(".mr-3 svg[aria-label='star']")
            .first()
            .parent()
            .text()
            .trim()
            .replace(',', '') || '0',
          10
        )),
        url: `${url}${relativeUrl}`,
        mobileUrl: `${url}${relativeUrl}`,
      };
    });
    return NextResponse.json(responseSuccess(result));
  } catch (err) {
    return NextResponse.json(responseError);
  }
}
