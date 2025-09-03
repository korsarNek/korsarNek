// The original word count wasn't able to handle languages other than Chinese, at all.

import { PageData, PostData } from "hexo"

// It supposedly supported English, but it was sooo far off the real number... 
const getWordCount = (post: PostData) => {
    // post.origin is the original post content of hexo-blog-encrypt
    const content = post.origin || post.content
    // remove tags
    let stripped = content.replace(/<[^>]*>?/gm, '')

    // These are not necessary on content that has already been processed.
    // But, we are currently not stripping code if it is already processed.
    // remove code
    //stripped = stripped.replace(/```.+?```/gm, '');
    // remove headlines
    //stripped = stripped.replace(/#+/gm, '');
    // remove group image nunjucks
    //stripped = stripped.replace(/{%\s*gi\s*.+?%}.+?{%\s*endgi\s*%}/gm, '');
    // replace links only by their text content
    //stripped = stripped.replace(/\[([^\]]+?)\]\(.+?\)/gm, '$1');
    // replace punctuation with a space
    stripped = stripped.replace(/[\r\n\?\.\!,;\-\(\)"']/gm, ' ')
    // replace multiple spaces by a single one
    stripped = stripped.replace(/\s{2,}/gm, ' ')

    const words = stripped.split(' ')

    return post.wordcount = words.length
}

const symbolsCount = (count: number): string => {
    if (count > 9999) {
        return Math.round(count / 1000) + 'k' // > 9999 => 11k
    } else if (count > 999) {
        return (Math.round(count / 100) / 10) + 'k' // > 999 => 1.1k
    } // < 999 => 111
    return `${count}`;
}

hexo.on('ready', () => {
    //override theme fluid handlers
    hexo.extend.helper.register('wordtotal', (site: PageData) => {
        let count = 0;
        site.posts.forEach(post => {
            count += getWordCount(post)
        });
        return symbolsCount(count)
    })
    hexo.extend.helper.register('wordcount', (page) => {
        return symbolsCount(getWordCount(page))
    })
    hexo.extend.helper.register('min2read', (post, { awl, wpm }) => {
        return `${Math.floor(getWordCount(post) / ((awl || 2) * (wpm || 60))) + 1}`
    })
})
