'use strict';

class App {
    static types = {
        HOME_PAGE: 'Home page',
        WATCH_PAGE: 'Watch page',
        ALT_PLAYER_PAGE: 'Alt player type'
    }

    static buildApp(type = App.types.HOME_PAGE) {
        console.time(`${type} - Build app time`);
        // Common Build
        App.buildHeaderAction();
        App.buildMenuAction();
        App.buildCategoriesModalView();
        App.buildCategoriesModalAction();

        switch (type) {
            case App.types.HOME_PAGE:
                App.buildGridOfTracks();
                break;
            case App.types.WATCH_PAGE:
                break;
            case App.types.ALT_PLAYER_PAGE:
                break;
            default: throw new Error('Invalid app type');
        }

        App.startSendAppStatus();
        console.timeEnd(`${type} - Build app time`);
    }

    // For search box
    static buildHeaderAction() {
        const mainSearchInput = document.querySelector('#main-search-input') ?? (App.warnSelectorNotFound)();
        const mainSearchIcon = document.querySelector('#main-search-icon') ?? (App.warnSelectorNotFound)();
        const resultBox = document.querySelector('.result-box') ?? (App.warnSelectorNotFound)();

        mainSearchInput?.addEventListener('blur', Config.hideResultBox);
        mainSearchInput?.addEventListener('keyup', () => search(mainSearchInput?.value));
        mainSearchInput?.addEventListener('click', Config.showResultBox);
        mainSearchInput?.addEventListener('focus', () => document.body.addEventListener('keyup', getEnter));
        mainSearchInput?.addEventListener('blur', () => document.body.removeEventListener('keyup', getEnter));
        mainSearchIcon?.addEventListener('click', () => {
            const searchValue = mainSearchInput?.value;
            if (searchValue) {
                mainSearchInput.value = '';
                if (!developerSearch(searchValue)) {
                    window.location = `..?search=${searchValue}`;
                }
            }
        });

        function getEnter(event) {
            if (event.key == 'Enter') {
                const searchValue = mainSearchInput?.value;
                if (searchValue) {
                    mainSearchInput.value = '';
                    if (!developerSearch(searchValue)) {
                        window.location = `..?search=${searchValue}`;
                    }
                }
            }
        }
        function search(value) {
            if (value == '') {
                resultBox.innerHTML = '';
                Config.hideResultBox();
                return;
            }

            if (value.includes('@')) {
                resultBox.innerHTML = `
                    <a href="../?search=@n"><span style="color: #00BFFF;">►</span><strong>@n</strong>: <span class="cnt">View newest tracks</span></a>
                    <a href="../develop/list-code"><span style="color: #00BFFF;">►</span><strong>@lc or @listcode</strong>: <span class="cnt">View list code</span></a>
                    <a href="../develop/data-capacity"><span style="color: #00BFFF;">►</span><strong>@dc or @datacapacity</strong>: <span class="cnt">View data capacity</span></a>
                    <a href="https://japaneseasmr.com/"><span style="color: #00BFFF;">►</span><strong>@ja</strong>: <span class="cnt">Japanese ASMR</span></a>
                    <a href="https://www.asmr.one/works"><span style="color: #00BFFF;">►</span><strong>@ao</strong>: <span class="cnt">ASMR ONE</span></a>
                `;
                Config.showResultBox();
                return;
            }

            let suggestions = Database.getSearchSuggestions(value);
            if (suggestions.length == 0) {
                resultBox.innerHTML = `<a style="text-align:center;">-No Result-</a>`;
            } else {
                resultBox.innerHTML = suggestions.reduce((html, searchResult) => html.concat(searchResult.getView()), '');
            }
            Config.showResultBox();
        }
        function developerSearch(value) {
            let active = false;
            if (value.indexOf('@') == -1)
                return active;

            const options = ['lc', 'listcode', 'dc', 'datacapacity', 'ja', 'ao']
            const links = [
                '../develop/list-code', '../develop/list-code', '../develop/data-capacity', '../develop/data-capacity',
                'https://japaneseasmr.com/', 'https://www.asmr.one/works'
            ]
            const optionBeforeSplit = value
            const optionAfterSplit = optionBeforeSplit.split('-')
            const option = options.indexOf(optionAfterSplit[0].replaceAll('@', ''))
            if (option != -1) {
                active = true;
                optionAfterSplit[1] == 'b'
                    ? window.open(links[option], '_blank')
                    : window.location = links[option]
            }
            return active;
        }
    }

    // For menu
    static buildMenuAction() {
        const toggleMenuBtn = document.querySelector('#toggle-menu-btn') ?? (App.warnSelectorNotFound)();
        const closeMenuBtn = document.querySelector('#close-menu-btn') ?? (App.warnSelectorNotFound)();

        toggleMenuBtn?.addEventListener('click', Config.toggleMenu);
        closeMenuBtn?.addEventListener('click', Config.closeMenu);
    }

    // For categories modal
    static buildCategoriesModalView() {
        const [rankListCvCtn, rankListTagCtn, rankListSeriesCtn] = ['.rank-list-grid-item.cv-b', '.rank-list-grid-item.tag-b', '.rank-list-grid-item.series-b'].map(selector => document.querySelector(selector) ?? (App.warnSelectorNotFound)());
        const [listCvCtn, listTagCtn, listSeriesCtn] = [rankListCvCtn, rankListTagCtn, rankListSeriesCtn].map(ctn => ctn.querySelector('.links') ?? (App.warnSelectorNotFound)());
        const listLength = [Database.listCv, Database.listTag, Database.listSeries].map(list => list.length);
        let [cvHtml, tagHtml, seriesHtml] = Array(3).fill('');

        [rankListCvCtn, rankListTagCtn, rankListSeriesCtn]
            .forEach((ctn, index) => ctn.querySelector('.title').textContent += ` (${listLength[index]})`);
        Database.listCv.forEach(({ name, quantity }) => {
            cvHtml += `<a href="../?cv=${encodeURIComponent(name)}" class="item" quantity="${quantity}">${name}</a>`;
        });
        Database.listTag.forEach(({ name, quantity }) => {
            tagHtml += `<a href="../?tag=${encodeURIComponent(name)}" class="item" quantity="${quantity}">${name}</a>`;
        });
        Database.listSeries.forEach(({ name, quantity }) => {
            seriesHtml += `<a href="../?series=${encodeURIComponent(name)}" class="item" quantity="${quantity}">${name}</a>`;
        });
        listCvCtn.innerHTML = cvHtml;
        listTagCtn.innerHTML = tagHtml;
        listSeriesCtn.innerHTML = seriesHtml;
    }
    static buildCategoriesModalAction() {
        const categoriesModal = document.querySelector('#categories-modal') ?? (App.warnSelectorNotFound)();
        const accordions = categoriesModal.querySelectorAll('.accordion-header');
        const btnOpenCategoryModal = document.querySelector('#open-categories-modal-btn') ?? (App.warnSelectorNotFound)();
        const btnCloseCategoryModal = categoriesModal.querySelector('#close-categories-modal-btn') ?? (App.warnSelectorNotFound)();
        const subRankList = categoriesModal.querySelectorAll('.sub-rank-list');

        accordions.forEach(accordion => {
            accordion.addEventListener('click', () => {
                accordion.classList.toggle('active');
                let panel = accordion.nextElementSibling;
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                } else {
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                }
            });

            Config.deviceIsMobile || accordion.click();
        });

        subRankList.forEach(subRankBox => {
            const searchBox = subRankBox.querySelector('input.search') ?? (App.warnSelectorNotFound)();
            const sortTypeSelect = subRankBox.querySelector('select') ?? (App.warnSelectorNotFound)();
            const linkContainer = subRankBox.querySelector('.links') ?? (App.warnSelectorNotFound)();
            const listOfLinks = linkContainer.querySelectorAll('a.item');

            searchBox?.addEventListener('input', () => {
                const keyword = searchBox.value.trim().toLowerCase();

                if (keyword) {
                    listOfLinks.forEach(link => {
                        if (link.textContent.toLowerCase().includes(keyword)) {
                            link.style.display = "block";
                            link.innerHTML = Utils.removeHighlight(link.innerHTML);
                            link.innerHTML = Utils.highlight(link.innerHTML, keyword);
                            return;
                        }
                        link.style.display = "none";
                    });
                    return;
                }

                listOfLinks.forEach(link => {
                    link.style.display = "block";
                    link.innerHTML = Utils.removeHighlight(link.innerHTML);
                });
            });

            sortTypeSelect?.addEventListener('input', () => {
                let sortedListOfLinks = null;

                switch (sortTypeSelect.value.toLowerCase()) {
                    case 'name':
                        sortedListOfLinks = Array.from(listOfLinks).sort((a, b) => a.textContent.localeCompare(b.textContent));
                        break;
                    case 'quantity':
                        sortedListOfLinks = Array.from(listOfLinks).sort((a, b) => Number(b.getAttribute('quantity')) - Number(a.getAttribute('quantity')));
                        break;
                    default:
                        throw new Error('Invalid sort type');
                }

                sortedListOfLinks.forEach(link => linkContainer.appendChild(link));
            });
        });

        btnOpenCategoryModal?.addEventListener('click', () => {
            categoriesModal?.classList.add('open');
            document.body.classList.add('openModal');
        });

        btnCloseCategoryModal?.addEventListener('click', () => {
            categoriesModal?.classList.remove('open');
            document.body.classList.remove('openModal');
        });
    }

    static buildGridOfTracks() {

    }

    // Call when complete build app
    static startSendAppStatus() {
        // Send status to the app that embeds this app
        parent.postMessage({ type: 'urlChange', version: 2.2, url: window.location.href }, '*');
        setInterval(() => parent.postMessage({ type: 'alive' }, '*'), 2500);
        window.addEventListener('beforeunload', () => parent.postMessage({ type: 'beforeUnload' }, '*'));
    }

    static warnSelectorNotFound() {
        const stackTrace = new Error().stack;
        const callingLine = stackTrace.split('\n')[2];
        console.warn(`Warning, selector not found ${callingLine.trim()}`);
    }
}