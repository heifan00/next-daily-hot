import { NextResponse } from 'next/server';

import v2exMap from '@/lib/v2ex-map';

import { getCacheHeaders } from '@/lib/cache';

import { RESPONSE } from '@/enums';
import { logHotSourceDebug, logHotSourceError } from '@/lib/hotSourceDebug';
import { responseError, responseSuccess } from '@/lib/utils';

const { mapV2exTopics } = v2exMap;

export async function GET() {
  const url = 'https://www.v2ex.com/api/topics/hot.json';

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`${RESPONSE.label(RESPONSE.ERROR)}V2EX-热门主题`);
    }

    const responseBody = await response.json();
    const result: App.HotListItem[] = mapV2exTopics(responseBody);

    if (!result.length) {
      logHotSourceDebug('v2ex', url, {
        stage: 'parsed-empty',
        isArray: Array.isArray(responseBody),
      });
    }

    return NextResponse.json(responseSuccess(result), { headers: getCacheHeaders('v2ex') });
  } catch (error) {
    logHotSourceError('v2ex', url, error);

    return NextResponse.json(responseError);
  }
}
