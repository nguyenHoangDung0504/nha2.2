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
        hiddenDataContainer: document.querySelector('.hidden-data-container'),
        gridContainer: document.querySelector('.grid-container')
    }
    static keyList = Database.keyList;

    static build() {
        // Reset html
        for (const element in Home.reuableElements) {
            if (Object.hasOwnProperty.call(Home.reuableElements, element)) {
                Home.reuableElements[element].innerHTML = '';
            }
        }

        Home.setMessage('NHD Hentai - ASMR Hentai Tracks');
        Home.buildGrid();

        let limitPage = Math.ceil(Home.keyList.length / Config.trackPerPage);
        limitPage == 0 ? limitPage = 1 : limitPage;
        Home.page = !Home.page ? 1 : Home.page;
        Home.page < 1 || Home.page > limitPage ? window.history.back() : '';
    }

    static buildGrid() {
        // Search handling
        if (Home.search) {
            if (search == '@newest' || search == '@n') {
                Database.sortByUploadOrder();
            } else {
                const searchValues = Home.search.split(',').map(v => v.trim()).filter(v => v);
                searchValues.forEach(searchValue => {
                    Home.keyList = Database.searchTracksKey(searchValue, Home.keyList);
                });
                const resultCount = Home.keyList.length;
                Home.setMessage(`Search result for keyword${resultCount > 0 ? 's' : ''}: <b><i>"${searchValues.map(v => `"${v}"`).join(', ')}"</i></b> (${resultCount})`);
            }
        } 
        // CV, tag, series handling
        else {
            processGetCategory('cv', Database.categoryType.CV, Home.setMessage);
            processGetCategory('tag', Database.categoryType.TAG, Home.setMessagePlus);
            processGetCategory('series', Database.categoryType.SERIES, Home.setMessagePlus);

            function processGetCategory(category, type, messageFunction) {
                if (Home[category]) {
                    const listOfItems = Home[category].split(',').map(v => v.trim()).filter(v => v);
                    listOfItems.forEach(item => {
                        Home.keyList = Database.getTracksKeyByCategory(type, item, Home.keyList);
                    });
                    messageFunction(`${['CV', 'Tag', 'Series'][type]}: ${Track.getListOfCategoryHtml(listOfItems, type)}`);
                }
            }
        } 
        // Sort handling
        if (Home.sort == 'oldest') {
            Home.keyList = Home.keyList.reverse();
        } 
        // Check keys list
        if (Home.keyList.length === 0) {
            Home.setMessagePlus(`There weren't any results found&ensp;&ensp; <a href="javascript:void(0)" class="series" onclick="window.history.back()">Back</a>`);
        }
        // Start building grid
        Home.keyList = Database.getTracksKeyForPage(Home.page, Config.trackPerPage, Home.keyList);
        Home.keyList.forEach(codeKey => {
            const track = Database.trackMap.get(codeKey);
            const gridElement = track.getGridItemElement();
            Home.reuableElements.gridContainer.appendChild(gridElement);
            track.addActionDisplayHiddenItemFor(gridElement.querySelector('.image-container'));
        });
    }

    static buildPagination() {

    }

    static setMessage(message) {
        Home.reuableElements.messageBox.innerHTML = message;
    }
    static setMessagePlus(message) {
        Home.reuableElements.messageBox.innerHTML += '<br>' + message;
    }
}