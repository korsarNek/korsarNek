hexo.on('ready', () => {
    hexo.extend.generator.register('_categories', function () {
        return [];
    });

    hexo.extend.generator.register('_links', function () {
        return [];
    });
});