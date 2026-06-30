/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2026-01-26 15:47:22
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-26 15:52:15
 * @Description: IT之家- 热榜
 */
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export const revalidate = 600;

export async function GET() {
  // 官方 url
  const url = 'https://m.ithome.com/rankm';
  try {
    // 请求数据
    const response = await fetch(url);
    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓�?
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：IT之家- 热榜`);
    }
    // 得到请求�?
    const responseBody = await response.text();
    // 链接处理
    const replaceLink = (url: string, getId: boolean = false) => {
      const match = url.match(/[html|live]\/(\d+)\.htm/);
      // 是否匹配成功
      if (match && match[1]) {
        return getId
          ? match[1]
          : `https://www.ithome.com/0/${match[1].slice(0, 3)}/${match[1].slice(3)}.htm`;
      }
      // 返回原始 URL
      return url;
    };
    const $ = cheerio.load(responseBody);
    const listDom = $(".rank-box .placeholder");
    const result: App.HotListItem[] = listDom.toArray().map((item, index) => {
      const dom = $(item);
      const href = dom.find("a").attr("href");
      return {
        id: index,
        title: dom.find(".plc-title").text().trim(),
        pic: dom.find("img").attr("data-original"),
        hot: Number(dom.find(".review-num").text().replace(/\D/g, "")),
        url: href ? replaceLink(href) : "",
        mobileUrl: href ? replaceLink(href) : "",
      };
    });
    return NextResponse.json(responseSuccess(result));
  } catch {
    return NextResponse.json(responseError);
  }
}