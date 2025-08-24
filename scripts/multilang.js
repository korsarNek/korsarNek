const pagination = require('hexo-pagination');
const createWarehouseWrapper = require('./warehouse');
const url = require('url');
const fs = require('fs');
const yaml = require('js-yaml');
const { getLanguages } = require('./helpers');

const fmtNum = num => num.toString().padStart(2, '0');
hexo.model('Tag').schema.virtual('path', function () {
    const name = this.name;

    let basePath = makeDirectoryPath(hexo.config.tag_dir);
    const tagMap = hexo.config.tags || {};
    if (tagMap[name] !== undefined)
        basePath = '/tags/'; // Tag pages don't have a path yet when building for the first time
    else if (Object.values(tagMap).find(value => value === name))
        basePath = '/schlagwoerter/';

    return makeDirectoryPath(basePath + this.slug);
});

function makeDirectoryPath(url) {
    url = url.replace(/index.html$/, '').replace(/\.html$/, '');
    if (!url.endsWith('/')) url += '/';
    return url;
}

function makeAbsoluteDirectoryPath(url) {
    url = makeDirectoryPath(url);
    if (!url.startsWith('/')) url = '/' + url;
    return url;
}

const original_url_for = hexo.extend.helper.get('url_for').bind(hexo);
hexo.extend.helper.register('url_for', url_for.bind(hexo));

hexo.extend.filter.register('before_generate', function () {
    hexo.extend.generator.register('index', indexGenerator);
    hexo.extend.generator.register('archive', archiveGenerator);
    hexo.extend.generator.register('tag', tagGenerator);
    hexo.extend.generator.register('_hexo_generator_search', localSearchGenerator);
    hexo.extend.helper.register('export_config', generateJsConfig);
});

/**
 * 
 * @param {import('hexo').Post[]} posts
 * @param {string} lang
 * @returns {import('hexo').Post[]}
 */
function filterByLanguage(posts, lang) {
    const defaultLang = hexo.config.permalink_defaults.lang || hexo.config.permalink_defaults.language;
    return posts.filter(post => post.language === lang || (!post.language && lang === defaultLang));
}

hexo.extend.helper.register('lang_posts', function (lang) {
    return createWarehouseWrapper(filterByLanguage(hexo.locals.get('posts').data, lang));
});

hexo.extend.helper.register('lang_tags', function (lang) {
    return createWarehouseWrapper(hexo.locals.get('tags').reduce((acc, tag) => {
        const langPosts = filterByLanguage(tag.posts, lang);
        if (langPosts.length) {
            acc.push(tag);
        }

        return acc;
    }, []));
});

//const originalTagCloud = hexo.extend.helper.get('tagcloud');
// The original tagcloud didn't even use url_for helper...
hexo.extend.helper.register('tagcloud', function (tags, options) {
    /*const lang = options.language
        ? options.language
        : options.lang;
    const tagDirPrefix = '/' + hexo.config.tag_dir;*/

    //const html = originalTagCloud.call(hexo, tags, options);
    return tags.map(t => `<a href="${url_for(t.path, options)}">${t.name}</a>`).join('');

    // Can't be bothered to fix the original tagcloud, so we'll just replace the links.
    /*return html.replace(/href="([^"]+)"/g, (_, url) => {
        return 'href="' + url_for.call(hexo, url, options) + '"';
    });*/
});

hexo.extend.helper.register('has_multiple_languages', function (page) {
    if (page.layout === 'post') {
        const otherPost = hexo.locals.get('posts').data.find(p => p.id === page.id && p.language !== page.language);
        return otherPost !== undefined;
    } if (page.layout === 'tag') {
        for (const [key, value] of Object.entries(this.config.tags)) {
            if (page.tag === key || page.tag === value)
                return true;
        }
        return false;
    } else {
        const otherPage = hexo.locals.get('pages').data.find(p => p.layout === page.layout && p.language !== page.language);
        return otherPage !== undefined;
    }
});

hexo.extend.helper.register('page_for_language', function (page, language) {
    if (page.layout === 'post') {
        return hexo.locals.get('posts').data.find(p => p.id === page.id && p.language === language);
    } if (page.layout === 'tag') {
        for (const [key, value] of Object.entries(this.config.tags)) {
            if (page.tag === key)
                return hexo.locals.get('tagPages').data.find(p => p.tag === value);
            else if (page.tag === value)
                return hexo.locals.get('tagPages').data.find(p => p.tag === key);
        }
        return null;
    } else {
        return hexo.locals.get('pages').data.find(p => p.layout === page.layout && p.language === language);
    }
})

hexo.locals.set('languages', () => {
    return getLanguages(hexo);
});

function indexGenerator(locals) {
    const config = this.config;
    const defaultLang = config.permalink_defaults.lang || config.permalink_defaults.language;
    const posts = locals.index_posts.sort(config.index_generator.order_by);
    const languages = getLanguages(hexo);

    posts.data.sort((a, b) => (b.sticky || 0) - (a.sticky || 0));

    const paginationDir = config.pagination_dir || 'page';
    const path = config.index_generator.path || '';

    for (const post of locals.posts.toArray()) {
        post.language ??= post.lang
    }

    return languages.reduce((acc, lang) => {
        const langPrefix = lang === defaultLang ? '' : lang;
        const langPosts = filterByLanguage(posts, lang);

        const indexPage = locals.pages.data.find(p => p.layout === 'index' && p.language === lang);

        return acc.concat(pagination('/' + langPrefix + path, langPosts, {
            perPage: config.index_generator.per_page,
            layout: 'index',
            format: paginationDir + '/%d/',
            data: {
                // Make all the front matter properties available in rendering
                ...indexPage,
                __index: true,
                layout: 'index',
                language: lang,
            }
        }));
    }, []);
};

function archiveGenerator(locals) {
    const { config } = this;

    const paginationDir = config.pagination_dir || 'page';
    const allPosts = locals.posts.sort(config.archive_generator.order_by || '-date');
    const perPage = config.archive_generator.per_page;
    const result = [];

    if (!allPosts.length) return;

    function generate(path, posts, options = {}) {
        options.archive = true;

        result.push(...pagination(path, posts, {
            perPage,
            layout: ['archive', 'index'],
            format: paginationDir + '/%d/',
            data: options,
        }));
    }

    const archivePages = hexo.locals.get('pages').data.filter(p => p.layout === 'archive');

    archivePages.forEach(page => {
        const languagePosts = filterByLanguage(allPosts, page.language);

        generate(makeDirectoryPath(page.path), languagePosts, { ...page, language: page.language });
    });

    if (!config.archive_generator.yearly) return result;

    const { Query } = this.model('Post');
    archivePages.forEach(page => {
        const posts = {};

        const languagePosts = filterByLanguage(allPosts, page.language);

        // Organize posts by date
        languagePosts.forEach(post => {
            const date = post.date;
            const year = date.year();
            const month = date.month() + 1; // month is started from 0

            if (!Object.prototype.hasOwnProperty.call(posts, year)) {
                // 13 arrays. The first array is for posts in this year
                // and the other arrays is for posts in this month
                posts[year] = [
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    [],
                    []
                ];
            }

            posts[year][0].push(post);
            posts[year][month].push(post);
            // Daily
            if (config.archive_generator.daily) {
                const day = date.date();
                if (!Object.prototype.hasOwnProperty.call(posts[year][month], 'day')) {
                    posts[year][month].day = {};
                }

                (posts[year][month].day[day] || (posts[year][month].day[day] = [])).push(post);
            }
        });

        const years = Object.keys(posts);
        let year, data, month, monthData, url;

        // Yearly
        for (let i = 0, len = years.length; i < len; i++) {
            year = +years[i];
            data = posts[year];
            url = makeDirectoryPath(page.path) + year + '/';
            if (!data[0].length) continue;

            generate(url, new Query(data[0]), { year });

            if (!config.archive_generator.monthly && !config.archive_generator.daily) continue;

            // Monthly
            for (month = 1; month <= 12; month++) {
                monthData = data[month];
                if (!monthData.length) continue;
                if (config.archive_generator.monthly) {
                    generate(url + fmtNum(month) + '/', new Query(monthData), {
                        year,
                        month
                    });
                }

                if (!config.archive_generator.daily) continue;

                // Daily
                for (let day = 1; day <= 31; day++) {
                    const dayData = monthData.day[day];
                    if (!dayData || !dayData.length) continue;
                    generate(url + fmtNum(month) + '/' + fmtNum(day) + '/', new Query(dayData), {
                        year,
                        month,
                        day
                    });
                }
            }
        }
    });

    return result;
};

function tagGenerator(locals) {
    const config = this.config;
    const perPage = config.tag_generator.per_page;
    const paginationDir = config.pagination_dir || 'page';
    const orderBy = config.tag_generator.order_by || '-date';
    const tags = locals.tags;
    let tagDir;

    const tagPages = hexo.locals.get('pages').data.filter(p => p.layout === 'tags');

    const result = tagPages.reduce((generatedPages, p) => {
        const { source, __page, _id, date, full_source, layout, path, permalink, raw, title ,...pageProperties } = p;
        
        const pages = tags.reduce((result, tag) => {
            if (!tag.length) return result;

            const posts = filterByLanguage(tag.posts.sort(orderBy), p.language);
            if (!posts.length) return result;

            const data = pagination(makeDirectoryPath(p.path) + tag.slug, posts, {
                perPage: perPage,
                layout: 'tag',
                format: paginationDir + '/%d/',
                data: {
                    ...pageProperties,
                    tag: tag.name,
                    language: p.language,
                    title: tag.name,
                }
            });

            return result.concat(data);
        }, []);

        // generate tag index page, usually /tags/index.html
        if (config.tag_generator.enable_index_page) {
            tagDir = config.tag_dir;
            if (tagDir[tagDir.length - 1] !== '/') {
                tagDir += '/';
            }

            pages.push({
                path: tagDir,
                layout: 'tag-index',
                posts: locals.posts,
                language: p.language,
                data: {
                    ...pageProperties,
                    base: tagDir,
                    total: 1,
                    current: 1,
                    current_url: tagDir,
                    posts: locals.posts,
                    prev: 0,
                    prev_link: '',
                    next: 0,
                    next_link: '',
                    tags: tags,
                    language: p.language,
                }
            });
        }

        return generatedPages.concat(pages);
    }, []);

    hexo.locals.set('tagPages', createWarehouseWrapper(result.map(p => ({ layout: p.layout, ...p.data }))));

    return result;
};

function localSearchGenerator(locals) {
    const config = this.theme.config;
    if (!config.search.enable) {
        return;
    }

    const nunjucks = require('nunjucks');
    const env = new nunjucks.Environment();
    const pathFn = require('path');
    const fs = require('fs');

    env.addFilter('uriencode', function (str) {
        return encodeURI(str);
    });

    env.addFilter('noControlChars', function (str) {
        // eslint-disable-next-line no-control-regex
        return str && str.replace(/[\x00-\x1F\x7F]/g, '');
    });

    env.addFilter('urlJoin', function (str) {
        const base = str[0];
        const relative = str[1];
        return relative
            ? base.replace(/\/+$/, '') + '/' + relative.replace(/^\/+/, '')
            : base;
    });

    const searchTmplSrc = pathFn.join(hexo.theme_dir, './source/xml/local-search.xml');
    const searchTmpl = nunjucks.compile(fs.readFileSync(searchTmplSrc, 'utf8'), env);

    const searchConfig = config.search;
    let searchField = searchConfig.field;
    const content = searchConfig.content && true;

    let posts, pages;

    if (searchField.trim() !== '') {
        searchField = searchField.trim();
        if (searchField === 'post') {
            posts = locals.posts.sort('-date');
        } else if (searchField === 'page') {
            pages = locals.pages;
        } else {
            posts = locals.posts.sort('-date');
            pages = locals.pages;
        }
    } else {
        posts = locals.posts.sort('-date');
    }

    return getLanguages(hexo).reduce((acc, lang) => {
        const xml = searchTmpl.render({
            config: config,
            posts: createWarehouseWrapper(filterByLanguage(posts || [], lang)),
            pages: createWarehouseWrapper(filterByLanguage(pages || [], lang)),
            content: content,
            url: hexo.config.root
        });

        acc.push({
            path: url_for('/local-search.xml', { lang }),
            data: xml
        });
        return acc;
    }, []);
}

let translations = undefined;

function generateJsConfig() {
    if (translations === undefined && fs.existsSync('_i18n.yml')) {
        translations = Object.entries(yaml.load(fs.readFileSync('_i18n.yml'))?.i18n?.keys);
    }

    const perPageTranslation = translations.reduce((acc, [key, data]) => {
        acc[key] = data[this.page.language];
        return acc;
    }, {});

    let { config, theme, fluid_version, page } = this;
    const exportConfig = {
        hostname: url.parse(config.url).hostname || config.url,
        root: config.root,
        version: fluid_version,
        typing: theme.fun_features.typing,
        anchorjs: theme.fun_features.anchorjs,
        progressbar: theme.fun_features.progressbar,
        code_language: theme.code.language,
        copy_btn: theme.code.copy_btn,
        image_caption: theme.post.image_caption,
        image_zoom: theme.post.image_zoom,
        toc: theme.post.toc,
        lazyload: theme.lazyload,
        web_analytics: theme.web_analytics,
        search_path: url_for(theme.search.path, { lang: page.language }),
        include_content_in_search: theme.search.content,
        translations: perPageTranslation,
    };
    return `<script id="fluid-configs">
        var Fluid = window.Fluid || {};
        Fluid.ctx = Object.assign({}, Fluid.ctx)
        var CONFIG = ${JSON.stringify(exportConfig)};

        if (CONFIG.web_analytics.follow_dnt) {
        var dntVal = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
        Fluid.ctx.dnt = dntVal && (dntVal.startsWith('1') || dntVal.startsWith('yes') || dntVal.startsWith('on'));
        }
    </script>`;
}

// https://github.com/neverbot/hexo-multilang/blob/develop/lib/helpers.js
function url_for(path = '', options = {}) {
    const defaultLang = hexo.config.permalink_defaults.lang || hexo.config.permalink_defaults.language;
    const root = hexo.config.root || '';
    const lang = options.language
        ? options.language
        : options.lang;

    let condition = (p) => false;
    if (lang) {
        if (options.layout) {
            if (options.layout === 'tag') {
                const checkPath = makeAbsoluteDirectoryPath(path);
                if (lang !== defaultLang) {
                    const tag = hexo.locals.get('tags').data.find(t => t.path === checkPath);

                    const tagMap = hexo.config.tags || {};
                    if (tagMap[tag.name] !== undefined)
                        return hexo.locals.get('tags').data.find(t => t.name === tagMap[tag.name]).path;
                    else {
                        const key = Object.keys(tagMap).find(key => tagMap[key] === tag.name);
                        if (key !== undefined) {
                            return hexo.locals.get('tags').data.find(t => t.name === key).path;
                        }
                    }
                } else
                    return checkPath;
            }
            if (options.id) {
                condition = (p) => p.id === options.id && (p.language == lang || (!p.language && lang === defaultLang)) && p.layout == options.layout;
            } else {
                condition = (p) => p.layout == options.layout && (p.language == lang || (!p.language && lang === defaultLang));
            }
        } else if (options.id) {
            condition = (p) => p.id === options.id && (p.language == lang || (!p.language && lang === defaultLang));
        }
    }

    const page = hexo.locals.get('pages').data.find(condition);
    if (page)
        return original_url_for(page.path);
    else {
        const post = hexo.locals.get('posts').data.find(condition);
        if (post)
            path = post.path;
        else {
            const checkPath = makeAbsoluteDirectoryPath(path);
            const tag = hexo.locals.get('tags').data.find(t => t.path === checkPath);
            if (tag !== undefined)
                return checkPath;
        }
    }

    const url = original_url_for(path);

    // ignore multilang transformation, useful for assets, etc
    if (options.ignore) {
        return url;
    }

    if (url === '#' || url.startsWith('//')) {
        return url;
    }

    if (!url.startsWith('/')) {
        return url;
    }

    // If we have an id, assume the original_url_for already created it with a language prefix.
    if (!options.id && lang && lang !== defaultLang && !path.startsWith('/' + lang + '/')) {
        const relativeUrl = url.replace(root, '/');
        return root + lang + relativeUrl;
    }

    return url;
}

