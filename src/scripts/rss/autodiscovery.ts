import Hexo from 'hexo';
import { getLanguages } from '../helpers'

export default function autodiscoveryInject(this: Hexo, renderedHtml: string) {
  const { config } = this;
  const defaultLang = config.permalink_defaults.lang || config.permalink_defaults.language || 'en';
  const { feed } = config;
  const { types } = feed;
  const url_for = this.extend.helper.store.url_for;
  let autodiscoveryTag = '';
  const title = feed.title || config.title;

  if (renderedHtml.match(/type=['|"]?application\/(atom|rss)\+xml['|"]?/i) || feed.autodiscovery === false) return;

  Object.entries(types).forEach(([type, properties]) => {
    let languages = [defaultLang];
    if (properties.output.includes('{language}'))
      languages = getLanguages(this);

    for (const language of languages) {
      autodiscoveryTag += `<link rel="alternate" href="${url_for.call(this, properties.output.replace('{language}', language))}" `
        + `title="${title.replace('{type}', type).replace('{language}', language)}" type="application/${type}+xml">\n`;
    }
  });

  return renderedHtml.replace(/<head>(?!<\/head>).+?<\/head>/s, str => str.replace('</head>', `${autodiscoveryTag}</head>`));
}
