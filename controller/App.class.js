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

        switch (type) {
            case App.types.HOME_PAGE:
                App.buildCategoriesModalView();
                App.buildCategoriesModalAction();
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
        // Search action
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
        });

        subRankList.forEach(subRankBox => {
            const searchBox = subRankBox.querySelector('input.search') ?? (App.warnSelectorNotFound)();
            const sortTypeSelect = subRankBox.querySelector('select') ?? (App.warnSelectorNotFound)();
            const linkContainer = subRankBox.querySelector('.links') ?? (App.warnSelectorNotFound)();
            const listOfLinks = linkContainer.querySelectorAll('a.item');

            searchBox?.addEventListener('input', () => {
                const keyword = searchBox.value.trim().toLowerCase();

                if(keyword) {
                    listOfLinks.forEach(link => {
                        if(link.textContent.toLowerCase().includes(keyword)) {
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
        });

        btnCloseCategoryModal?.addEventListener('click', () => {
            categoriesModal?.classList.remove('open');
        });
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
        return false;
    }
}