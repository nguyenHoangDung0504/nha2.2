'use strict';

class Home {
    static urlParams = new URLSearchParams(window.location.search);
    static page = Number(Home.urlParams.get('page') || 1);
    static cv = Home.urlParams.get('cv');
    static tag = Home.urlParams.get('tag');
    static series = Home.urlParams.get('series');
    static sort = Home.urlParams.get('sort');
    static search = Home.urlParams.get('search') || Home.urlParams.get('s');
    static reuableElements = {
        messageBox: document.querySelector('.message'),
        hiddenDataContainer: document.querySelector('.hidden-data-container')
    }
    static keyList = null;

    static build() {
        if (Home.search) {
            Home.keyList = Database.searchTracksKey(Home.search.trim());
            Home.setMessage(`<br>Search result for key word: <b><i>"${search}"</i></b> (${keyList.length})`);
            if (search == '@newest' || search == '@n') {
                Database.sortByUploadOrder();
                Home.setMessage('NHD Hentai - ASMR Hentai Tracks');
            }
        } else {
            if (Home.series) {
                Home.series = Home.series.trim();
                Home.keyList = Database.getTracksKeyByCategory(Database.categoryType.SERIES, Home.series);
                Home.setMessage(`<br>Series: ${Database.getCategory(Database.categoryType.SERIES, Home.series).getHtml()}`);
            } else if (Home.cv) {
                // listTrack = window.databasefs.getTracksByCV(cv, listTrack);
                // window.homeView.messageContent += `<br>CV: ${window.databasefs.findSingleCvOrTag('cv', cv).getHtml('yes', 'yes')}`;
            } else if (Home.tag) {
                // listTrack = window.databasefs.getTracksByTag(tag, listTrack);
                // window.homeView.messageContent += `<br>Tag: ${window.databasefs.findSingleCvOrTag('tag', tag).getHtml('yes', 'yes')}`;
            }
        }
    }

    static setMessage(message) {
        Home.reuableElements.messageBox.textContent = message;
    }
}