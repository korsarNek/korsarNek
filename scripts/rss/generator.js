'use strict';

const nunjucks = require('nunjucks');
const env = new nunjucks.Environment();
const { readFileSync } = require('fs');
const { encodeURL, gravatar, full_url_for } = require('hexo-util');
const Locals = require('hexo/dist/hexo/locals');
const Post = require('hexo/dist/hexo/post');
const { getLanguages } = require('../helpers');

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
 * @param {string} name
 * @returns 
 */
module.exports = function (locals, properties, name) {
  const { config } = this;
  const defaultLang = config.permalink_defaults.lang || config.permalink_defaults.language;
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

    const feed_url = full_url_for.call(this, properties.output);

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
