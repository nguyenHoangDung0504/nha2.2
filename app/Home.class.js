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
        gridContainer: document.querySelector('.grid-container'),
        paginationBody: document.querySelector('.pagination-body'),
    }
    static keyList = Database.keyList;

    static build() {
        Home.setMessage('NHD Hentai - ASMR Hentai Tracks');
        Home.filterKeyList();

        let limitPage = Math.ceil(Home.keyList.length / Config.trackPerPage);
        limitPage == 0 ? limitPage = 1 : limitPage;
        Home.page = !Home.page ? 1 : Home.page;
        Home.page < 1 || Home.page > limitPage ? window.history.back() : '';

        // Reset html
        Home.reuableElements.hiddenDataContainer.innerHTML = '';
        Home.reuableElements.gridContainer.innerHTML = '';
        Home.reuableElements.paginationBody.innerHTML = '';

        // Start build
        Home.buildGrid();
        Home.buildPagination(Home.page, limitPage);
    }

    static filterKeyList() {
        // Search handling
        if (Home.search) {
            if (Home.search == '@newest' || Home.search == '@n') {
                Database.sortByUploadOrder(true);
                Home.keyList = Database.keyList;
            } else {
                const searchValues = Home.search.split(',').map(v => v.trim()).filter(v => v);
                searchValues.forEach(searchValue => {
                    Home.keyList = Database.searchTracksKey(searchValue, Home.keyList);
                });
                const resultCount = Home.keyList.length;
                Home.setMessage(`Search result for keyword${resultCount > 0 ? 's' : ''}: <b><i>"${searchValues.join(', ')}"</i></b> (${resultCount})`);
            }
        }
        // CV, tag, series handling
        else {
            processGetCategory('cv', Database.categoryType.CV, Home.setMessagePlus);
            processGetCategory('tag', Database.categoryType.TAG, Home.setMessagePlus);
            processGetCategory('series', Database.categoryType.SERIES, Home.setMessagePlus);

            function processGetCategory(category, type, messageFunction) {
                if (Home[category]) {
                    const listOfItems = Home[category].split(',').map(v => v.trim()).filter(v => v);
                    listOfItems.forEach(item => {
                        Home.keyList = Database.getTracksKeyByCategory(type, item, Home.keyList);
                    });
                    if(Home.keyList.length == 0) return;
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
            Home.setMessagePlus(`There weren't any results found&ensp;&ensp; <a style="padding-inline: 20px;" href="javascript:void(0)" class="series" onclick="window.history.back()">Back</a>`);
        }
    }

    static buildGrid() {
        Home.keyList = Database.getTracksKeyForPage(Home.page, Config.trackPerPage, Home.keyList);
        Home.keyList.forEach(codeKey => {
            const track = Database.trackMap.get(codeKey);
            const gridElement = track.getGridItemElement();
            Home.reuableElements.gridContainer.appendChild(gridElement);
            track.addActionDisplayHiddenItemFor(gridElement.querySelector('.image-container'));
        });
    }

    static buildPagination(page, limitPage) {
        const group = Utils.getGroupOfPagination(page, Config.linksPerGroupPagination, limitPage);
        let links0 = [
            `<a class="[class]" href="${Utils.addQueryToUrl('page', '1')}" id="first-link">&lt;&lt;</a>`,
            `[links]`,
            `<a class="[class]" href="${Utils.addQueryToUrl('page', limitPage)}" id="last-link">&gt;&gt;</a>`
        ], links = ``;

        links0[0] = (page == 1) ? links0[0].replace('[class]', 'block') : links0[0];
        links0[2] = (page == limitPage) ? links0[2].replace('[class]', 'block') : links0[2];

        group.forEach((p) => {
            links += `<a class="${p == page ? 'active' : ''}" href="${Utils.addQueryToUrl('page', p)}">${p}</a>`;
        });

        Home.reuableElements.paginationBody.innerHTML = links0.join('').replace('[links]', links);
    }

    static setMessage(message) {
        Home.reuableElements.messageBox.innerHTML = message;
    }
    
    static setMessagePlus(message) {
        Home.reuableElements.messageBox.innerHTML += '<br>' + message;
    }
}