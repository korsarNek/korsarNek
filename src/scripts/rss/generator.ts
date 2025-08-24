import nunjucks from 'nunjucks'
const env = new nunjucks.Environment();

import { readFileSync } from 'node:fs'
import { encodeURL, gravatar, full_url_for } from 'hexo-util'
import { getLanguages } from '../helpers'
import Hexo, { GeneratorFunction, RssProperties } from 'hexo';

env.addFilter('uriencode', str => {
  return encodeURL(str);
});

env.addFilter('noControlChars', str => {
  return str.replace(/[\x00-\x1F\x7F]/g, ''); // eslint-disable-line no-control-regex
});

export default function (this: Hexo, locals: Parameters<GeneratorFunction>[0], properties: RssProperties, name: string) {
  const { config } = this;
  const defaultLang = config.permalink_defaults.lang || config.permalink_defaults.language || 'en';
  const { email, feed, url: urlCfg } = config;
  const { icon: iconCfg, limit, order_by } = feed;
  const title = feed.title || config.title;

  env.addFilter('formatUrl', str => {
    return full_url_for.call(this, str);
  });

  const template = nunjucks.compile(readFileSync(properties.input, 'utf8'), env);

  /** @type {Post[]} */
  let posts = locals.posts.sort(order_by || '-date');
  posts = posts.filter(post => {
    return !post.draft;
  });

  if (posts.length <= 0) {
    feed.autodiscovery = false;
    return;
  }

  let languages = [defaultLang];
  if (properties.output.includes('{language}')) {
    languages = getLanguages(this);
  }

  const result = [];
  for (const language of languages) {
    let filteredPosts = posts.filter(p => p.language === language);

    if (limit) filteredPosts = filteredPosts.limit(limit);

    let url = urlCfg;
    if (url[url.length - 1] !== '/') url += '/';

    let icon = '';
    if (iconCfg) icon = full_url_for.call(this, iconCfg);
    else if (email) icon = gravatar(email);

    const feed_url = full_url_for.call(this, properties.output.replace('{language}', language));

    const data = template.render({
      config,
      title: title.replace('{type}', name).replace('{language}', language),
      url,
      icon,
      posts: filteredPosts,
      feed_url,
      language,
    });

    result.push({
      path: properties.output.replace('{language}', language),
      data
    });
  }

  return result;
};
