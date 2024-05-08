'use strict';

class App {
    static Database = Database;

    static buildApp() {
        console.time('Home - Build app time');

        App.startSendAppStatus();
        console.timeEnd('Home - Build app time');
    }

    static startSendAppStatus() {
        // Send status to the app that embeds this app
        parent.postMessage({ type: 'urlChange', version: 2.2, url: window.location.href }, '*');
        setInterval(() => parent.postMessage({ type: 'alive' }, '*'), 2500);
        window.addEventListener('beforeunload', () => parent.postMessage({ type: 'beforeUnload' }, '*'));
    }
}

App.buildApp();