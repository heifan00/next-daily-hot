/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-14 16:54:38
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-01-14 17:26:28
 * @Description: 虎扑-步行街热帖
 */
import { NextResponse } from 'next/server';

import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export async function GET() {
  // 使用移动端页面，兼容 Cloudflare Workers（桌面端被阿里云 WAF 拦截）
  const url = 'https://bbs.hupu.com/all-gambia';
  try {
    // 请求数据（使用移动端 UA 获取 __NEXT_DATA__）
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      },
    });
    if (!response.ok) {
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}虎扑-步行街热帖`);
    }
    const responseBody = await response.text();
    // 从 __NEXT_DATA__ 中提取数据
    const match = responseBody.match(/__NEXT_DATA__.*?>(.*?)<\/script>/);
    if (!match?.[1]) {
      throw new Error('无法解析虎扑数据');
    }
    const nextData = JSON.parse(match[1]);
    const list = nextData?.props?.pageProps?.list;
    if (!list?.length) {
      return NextResponse.json(responseSuccess());
    }
    const result: App.HotListItem[] = list.map((v) => {
      return {
        id: v.tid,
        title: v.title,
        desc: v.lightReplyResult?.content || '',
        pic: v.picList?.[0] || '',
        tip: String(v.lightReplyResult?.lightCount || v.recommendCount || 0),
        url: `https://bbs.hupu.com/${v.tid}`,
        mobileUrl: `https://bbs.hupu.com/${v.tid}`,
      };
    });
    return NextResponse.json(responseSuccess(result));
  } catch {
    return NextResponse.json(responseError);
  }
}