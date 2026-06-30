/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2024-05-14 14:02:04
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-04 18:07:27
 * @Description: 豆瓣电影-新片�?
 */
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export const revalidate = 600;

export async function GET() {
  // 官方 url
  const url = 'https://movie.douban.com/chart/';
  try {
    // 请求数据
    const response = await fetch(url);
    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓�?
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：豆瓣电�?新片榜`);
    }
    // 得到请求�?
    const responseBody = await response.text();
    // 处理数据
    const getNumbers = (text: string | undefined) => {
      if (!text) return 10000000;
      const regex = /\d+/;
      const match = text.match(regex);
      if (match) {
        return Number(match[0]);
      } else {
        return 10000000;
      }
    };
    const $ = cheerio.load(responseBody);
    const listDom = $('.article tr.item');
    const result: App.HotListItem[] = listDom.toArray().map((item) => {
      const dom = $(item);
      const url = dom.find('a').attr('href') || '';
      const score = dom.find('.rating_nums').text() ?? '0.0';
      return {
        id: String(getNumbers(url)),
        title: `${dom.find('.pl2 a').text().replace(/\s+/g, ' ').trim().replace(/\n/g, '')}`,
        desc: dom.find('p.pl').text(),
        hot: getNumbers(dom.find('span.pl').text()),
        score: Number(score),
        url,
        mobileUrl: `https://m.douban.com/movie/subject/${getNumbers(url)}/`,
      };
    });
    return NextResponse.json(responseSuccess(result));
  } catch {
    return NextResponse.json(responseError);
  }
}
