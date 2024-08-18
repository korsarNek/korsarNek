'use strict';

const nunjucks = require('nunjucks');
const env = new nunjucks.Environment();
const { readFileSync } = require('fs');
const { encodeURL, gravatar, full_url_for } = require('hexo-util');
const Locals = require('hexo/dist/hexo/locals');
const Post = require('hexo/dist/hexo/post');

env.addFilter('uriencode', str => {
  return encodeURL(str);
});

env.addFilter('noControlChars', str => {
  return str.replace(/[\x00-\x1F\x7F]/g, ''); // eslint-disable-line no-control-regex
});

/**
 * @typedef {Object} RssProperties
 * @property {string} input
 * @property {string} output
 */

/**
 * 
 * @param {Locals} locals 
 * @param {RssProperties} properties
 * @returns 
 */
module.exports = function(locals, properties) {
  const { config } = this;
  const { email, feed, url: urlCfg } = config;
  const { icon: iconCfg, limit, order_by } = feed;

  env.addFilter('formatUrl', str => {
    return full_url_for.call(this, str);
  });

  env.addFilter('filterByLanguage', (posts, language) => {
    return posts.filter(p => p.language === language);
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

  if (limit) posts = posts.limit(limit);

  let url = urlCfg;
  if (url[url.length - 1] !== '/') url += '/';

  let icon = '';
  if (iconCfg) icon = full_url_for.call(this, iconCfg);
  else if (email) icon = gravatar(email);

  const feed_url = full_url_for.call(this, properties.output);

  //TODO: generate one per language.
  const data = template.render({
    config,
    url,
    icon,
    posts,
    feed_url,
    languages: locals.languages,
  });

  return {
    path: properties.output,
    data
  };
};
