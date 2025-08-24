import Hexo from 'hexo';
import feedFn from './generator'

declare const hexo: Hexo

hexo.config.feed = Object.assign({
  type: 'atom',
  limit: 20,
  content: true,
  content_limit: 140,
  content_limit_delim: '',
  order_by: '-date',
  autodiscovery: true,
}, hexo.config.feed);

const config = hexo.config.feed;

if (typeof config.types !== 'object') {
  throw 'feed.types is not an object.';
}
hexo.config.feed
for (const [name, properties] of Object.entries(config.types)) {
  hexo.extend.generator.register(name, locals => {
    return feedFn.call(hexo, locals, properties, name);
  });
}

if (typeof config.autodiscovery !== 'boolean') config.autodiscovery = true;

if (config.autodiscovery === true) {
  hexo.extend.filter.register('after_render:html', require('./autodiscovery'));
}
