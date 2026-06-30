/*
 * @Author: 白雾茫茫�?baiwumm.com>
 * @Date: 2024-05-14 09:38:02
 * @LastEditors: 白雾茫茫�?baiwumm.com>
 * @LastEditTime: 2026-01-04 18:06:29
 * @Description: 百度贴吧-热议�?
 */
import { NextResponse } from 'next/server';

import { getCacheHeaders } from '@/lib/cache';
import { RESPONSE } from '@/enums';
import { responseError, responseSuccess } from '@/lib/utils';

export async function GET() {
  // 官方 url
  const url = 'https://tieba.baidu.com/hottopic/browse/topicList';
  try {
    // 请求数据
    const response = await fetch(url);
    if (!response.ok) {
      // 如果请求失败，抛出错误，不进行缓�?
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}：百度贴�?热议榜`);
    }
    // 得到请求�?
    const responseBody = await response.json();
    // 处理数据
    if (responseBody.errmsg === 'success') {
      const result: App.HotListItem[] = responseBody.data.bang_topic.topic_list.map((v) => {
        return {
          id: v.topic_id.toString(),
          title: v.topic_name,
          desc: v.topic_desc,
          pic: v.topic_pic,
          hot: v.discuss_num,
          url: v.topic_url,
          mobileUrl: v.topic_url,
        };
      });
      return NextResponse.json(responseSuccess(result), { headers: getCacheHeaders('baidutieba') });
    }
    return NextResponse.json(responseSuccess(), { headers: getCacheHeaders('baidutieba') });
  } catch {
    return NextResponse.json(responseError);
  }
}
