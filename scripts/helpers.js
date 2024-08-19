function getLanguages(hexo) {
    let languages = [...hexo.config.language];
    var defaultLangIndex = languages.indexOf('default');
    if (defaultLangIndex !== -1) {
        languages.splice(defaultLangIndex, 1);
    }
    return languages;
}

module.exports = {
    getLanguages,
};
