'use strict';

/**
 * 
 * @param {string} renderedHtml 
 * @returns 
 */
function autodiscoveryInject(renderedHtml) {
  const { config } = this;
  const { feed } = config;
  const { types } = feed;
  const url_for = this.extend.helper.store.url_for;
  let autodiscoveryTag = '';

  //Is already an 
  if (renderedHtml.match(/type=['|"]?application\/(atom|rss)\+xml['|"]?/i) || feed.autodiscovery === false) return;

  Object.entries(types).forEach(([type, properties]) => {
    autodiscoveryTag += `<link rel="alternate" href="${url_for.call(this, properties.output)}" `
      + `title="${config.title}" type="application/${type}+xml">\n`;
  });

  return renderedHtml.replace(/<head>(?!<\/head>).+?<\/head>/s, str => str.replace('</head>', `${autodiscoveryTag}</head>`));
}

module.exports = autodiscoveryInject;
