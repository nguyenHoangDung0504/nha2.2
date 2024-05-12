'use strict';

const urlParams = new URLSearchParams(window.location.search);

class App {
    static types = {
        HOME: 0,
        WATCH: 1,
        ALT_PLAYER: 2
    }

    static build(type = App.types.HOME) {
        console.time(`Build app time`);
        // Common Build
        App.buildHeaderAction();
        App.buildMenuAction();
        App.buildCategoriesModalView();
        App.buildCategoriesModalAction();

        switch (type) {
            case App.types.HOME:
                break;
            case App.types.WATCH:
                break;
            case App.types.ALT_PLAYER:
                break;
            default: throw new Error('Invalid app type');
        }

        App.startSendAppStatus();
        document.body.style.display = 'block';
        console.timeEnd(`Build app time`);
    }

    // For search box
    static buildHeaderAction() {
        const mainSearchInput = document.querySelector('#main-search-input');
        const mainSearchIcon = document.querySelector('#main-search-icon');
        const resultBox = document.querySelector('.result-box');

        mainSearchInput.addEventListener('blur', Config.hideResultBox);
        mainSearchInput.addEventListener('keyup', () => search(mainSearchInput.value));
        mainSearchInput.addEventListener('click', Config.showResultBox);
        mainSearchInput.addEventListener('focus', () => document.body.addEventListener('keyup', getEnter));
        mainSearchInput.addEventListener('blur', () => document.body.removeEventListener('keyup', getEnter));
        mainSearchIcon.addEventListener('click', () => {
            const searchValue = mainSearchInput.value;
            if (searchValue) {
                mainSearchInput.value = '';
                if (!developerSearch(searchValue)) {
                    window.location = `..?search=${searchValue}`;
                }
            }
        });

        function getEnter(event) {
            if (event.key == 'Enter') {
                const searchValue = mainSearchInput.value;
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
        const toggleMenuBtn = document.querySelector('#toggle-menu-btn');
        const closeMenuBtn = document.querySelector('#close-menu-btn');

        toggleMenuBtn.addEventListener('click', Config.toggleMenu);
        closeMenuBtn.addEventListener('click', Config.closeMenu);
        new SwipeHandler(document.body, Config.openMenu, Config.closeMenu).registerEvents();
    }

    // For categories modal
    static buildCategoriesModalView() {
        const [rankListCvCtn, rankListTagCtn, rankListSeriesCtn] = ['.rank-list-grid-item.cv-b', '.rank-list-grid-item.tag-b', '.rank-list-grid-item.series-b'].map(selector => document.querySelector(selector));
        const [listCvCtn, listTagCtn, listSeriesCtn] = [rankListCvCtn, rankListTagCtn, rankListSeriesCtn].map(ctn => ctn.querySelector('.links'));
        const listLength = [Database.cvMap, Database.tagMap, Database.seriesMap].map(map => map.size);
        const types = ['cv', 'tag', 'series'];
        let htmls = Array(3).fill('');

        [rankListCvCtn, rankListTagCtn, rankListSeriesCtn].forEach((ctn, index) => ctn.querySelector('.title').textContent += ` (${listLength[index]})`);
        [Database.cvMap, Database.tagMap, Database.seriesMap].forEach((map, index) => {
            map.forEach(value => {
                const { name, quantity } = value;
                htmls[index] += /*html*/`<a href="../?${types[index]}=${encodeURIComponent(name)}" class="item" quantity="${quantity}">${name}</a>`;
            });
        });

        const [cvHtml, tagHtml, seriesHtml] = htmls;
        listCvCtn.innerHTML = cvHtml;
        listTagCtn.innerHTML = tagHtml;
        listSeriesCtn.innerHTML = seriesHtml;
    }
    static buildCategoriesModalAction() {
        const categoriesModal = document.querySelector('#categories-modal');
        const accordions = categoriesModal.querySelectorAll('.accordion-header');
        const btnOpenCategoryModal = document.querySelector('#open-categories-modal-btn');
        const btnCloseCategoryModal = categoriesModal.querySelector('#close-categories-modal-btn');
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
        });
        subRankList.forEach(subRankBox => {
            const searchBox = subRankBox.querySelector('input.search');
            const sortTypeSelect = subRankBox.querySelector('select');
            const linkContainer = subRankBox.querySelector('.links');
            const listOfLinks = linkContainer.querySelectorAll('a.item');

            searchBox.addEventListener('input', () => {
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
                    const sortedListOfLinks = Array.from(listOfLinks).sort((a, b) => a.textContent.toLowerCase().indexOf(keyword) - b.textContent.toLowerCase().indexOf(keyword));
                    sortedListOfLinks.forEach(link => linkContainer.appendChild(link));
                    return;
                }

                listOfLinks.forEach(link => {
                    link.style.display = "block";
                    link.innerHTML = Utils.removeHighlight(link.innerHTML);
                });
                sortTypeSelect.dispatchEvent(new Event('input'));
            });

            sortTypeSelect.addEventListener('input', () => {
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
        btnOpenCategoryModal.addEventListener('click', openCatgoriesModal);
        btnCloseCategoryModal.addEventListener('click', closeCatgoriesModal);
        categoriesModal.addEventListener('click', event => {
            if(event.target.classList.contains('modal-container')) {
                closeCatgoriesModal();
            }
        });

        function openCatgoriesModal() {
            categoriesModal.classList.add('open');
            document.body.classList.add('openModal');
        }
        function closeCatgoriesModal() {
            categoriesModal.classList.remove('open');
            document.body.classList.remove('openModal');
        }
    }

    // Call when complete build app
    static startSendAppStatus() {
        // Send status to the app that embeds this app
        parent.postMessage({ type: 'urlChange', version: 2.2, url: window.location.href }, '*');
        setInterval(() => parent.postMessage({ type: 'alive' }, '*'), 3000);
        window.addEventListener('beforeunload', () => parent.postMessage({ type: 'beforeUnload' }, '*'));
    }
}