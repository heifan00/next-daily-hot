/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2024-05-13 16:25:11
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-04 18:07:00
 * @Description: 哔哩哔哩-热门�? */
import md5 from 'crypto-js/md5';
import { NextResponse } from 'next/server';

import { getCacheHeaders } from '@/lib/cache';
import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29,
  28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25,
  54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
];

const getMixinKey = (orig: string): string =>
  mixinKeyEncTab
    .map((n) => orig[n])
    .join('')
    .slice(0, 32);

const encWbi = (params: Record<string, string | number>, imgKey: string, subKey: string): string => {
  const mixinKey = getMixinKey(imgKey + subKey);
  const currTime = Math.round(Date.now() / 1000);
  const chrFilter = /[!'()*]/g;
  params.wts = currTime;
  const query = Object.keys(params)
    .sort()
    .map((key) => {
      const value = String(params[key]).replace(chrFilter, '');
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
  const wbiSign = md5(query + mixinKey).toString();
  return `${query}&w_rid=${wbiSign}`;
};

async function getWbiKeys() {
  const response = await fetch('https://api.bilibili.com/x/web-interface/nav', {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      Referer: 'https://www.bilibili.com/',
    },
  });
  const data = await response.json();
  const imgUrl: string = data?.data?.wbi_img?.img_url ?? '';
  const subUrl: string = data?.data?.wbi_img?.sub_url ?? '';
  return {
    imgKey: imgUrl.slice(imgUrl.lastIndexOf('/') + 1, imgUrl.lastIndexOf('.')),
    subKey: subUrl.slice(subUrl.lastIndexOf('/') + 1, subUrl.lastIndexOf('.')),
  };
}

export const revalidate = 600;

export async function GET() {
  try {
    // 获取 WBI 签名密钥
    const { imgKey, subKey } = await getWbiKeys();
    const wbiQuery = encWbi({ rid: '0', type: 'all' }, imgKey, subKey);
    const url = `https://api.bilibili.com/x/web-interface/ranking/v2?${wbiQuery}`;

    const response = await fetch(url, {
      headers: {
        Referer: 'https://www.bilibili.com/ranking/all',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：哔哩哔�?热门榜`);
    }

    const responseBody = await response.json();
    const list = responseBody?.data?.list;

    if (!list?.length) {
      return NextResponse.json(responseSuccess(), { headers: getCacheHeaders('bilibili') });
    }

    const result: App.HotListItem[] = list.map((v) => ({
      id: v.bvid,
      title: v.title,
      desc: v.desc || '该视频暂无简�?,
      pic: v.pic?.replace(/http:/, 'https:'),
      hot: v.stat?.view || 0,
      url: v.short_link_v2 || `https://b23.tv/${v.bvid}`,
      mobileUrl: `https://m.bilibili.com/video/${v.bvid}`,
    }));

    return NextResponse.json(responseSuccess(result), { headers: getCacheHeaders('bilibili') });
  } catch {
    return NextResponse.json(responseError);
  }
}
