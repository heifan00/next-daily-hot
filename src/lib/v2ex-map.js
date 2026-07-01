function mapV2exTopics(topics) {
  if (!Array.isArray(topics)) return [];

  return topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    desc: [topic.node?.title, topic.member?.username].filter(Boolean).join(' / '),
    hot: topic.replies || 0,
    url: topic.url,
    mobileUrl: topic.url,
  }));
}

module.exports = {
  mapV2exTopics,
};
