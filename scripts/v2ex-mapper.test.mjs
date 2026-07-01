import assert from 'node:assert/strict';
import test from 'node:test';

import v2exMap from '../src/lib/v2ex-map.js';

const { mapV2exTopics } = v2exMap;

test('maps V2EX hot topics to hot list items', () => {
  const [item] = mapV2exTopics([
    {
      id: 1223840,
      title: '苹果电脑全线涨价，大家还会继续买吗？',
      url: 'https://www.v2ex.com/t/1223840',
      replies: 120,
      node: { title: 'Apple' },
      member: { username: 'rich1e' },
    },
  ]);

  assert.deepEqual(item, {
    id: 1223840,
    title: '苹果电脑全线涨价，大家还会继续买吗？',
    desc: 'Apple / rich1e',
    hot: 120,
    url: 'https://www.v2ex.com/t/1223840',
    mobileUrl: 'https://www.v2ex.com/t/1223840',
  });
});
