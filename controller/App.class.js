'use strict';

class App {
    static buildApp() {
        console.time('Home - Build app time');
        App.buildHeaderAction();
        App.buildMenuAction();
        App.buildCategoriesModalView();
        App.buildCategoriesModalAction();
        App.startSendAppStatus();
        console.timeEnd('Home - Build app time');
    }

    static buildHeaderAction() {
        // Search action
    }

    static buildMenuAction() {
        const toggleMenuBtn = document.querySelector('toggle-menu-btn');
        const closeMenuBtn = document.querySelector('#close-menu-btn');

        toggleMenuBtn?.addEventListener('click', Config.toggleMenu);
        closeMenuBtn?.addEventListener('click', Config.closeMenu);
    }

    // For categories modal
    static buildCategoriesModalView() {
        const [rankListCvCtn, rankListTagCtn, rankListSeriesCtn] = ['.rank-list-grid-item.cv-b', '.rank-list-grid-item.tag-b', '.rank-list-grid-item.series-b'].map(selector => document.querySelector(selector));
        const [listCvCtn, listTagCtn, listSeriesCtn] = [rankListCvCtn, rankListTagCtn, rankListSeriesCtn].map(ctn => ctn.querySelector('.links'));
        const listLength = [Database.listCv, Database.listTag, Database.listSeries].map(list => list.length);

        [listCvCtn, listTagCtn, listSeriesCtn]
            .forEach(ctn => ctn.innerHTML = '');
        [rankListCvCtn, rankListTagCtn, rankListSeriesCtn]
            .forEach((ctn, index) => ctn.querySelector('.title').textContent += ` (${listLength[index]})`);
        Database.listCv.forEach(({ name, quantity }) => {
            listCvCtn.innerHTML += `<a href="../?cv=${encodeURIComponent(name)}" class="item" quantity="${quantity}">${name}</a>`;
        });
        Database.listTag.forEach(({ name, quantity }) => {
            listTagCtn.innerHTML += `<a href="../?tag=${encodeURIComponent(name)}" class="item" quantity="${quantity}">${name}</a>`;
        });
        Database.listSeries.forEach(({ name, quantity }) => {
            listSeriesCtn.innerHTML += `<a href="../?series=${encodeURIComponent(name)}" class="item" quantity="${quantity}">${name}</a>`;
        });
    }
    static buildCategoriesModalAction() {
        const categoriesModal = document.querySelector('#categories-modal');
        const accordions = categoriesModal.querySelectorAll('.accordion-header');
        const btnOpenCategoryModal = document.querySelector('#open-categories-modal-btn');
        const btnCloseCategoryModal = categoriesModal.querySelector('#close-categories-modal-btn');

        accordions.forEach(function (accordion) {
            accordion.addEventListener('click', function () {
                this.classList.toggle('active');
                let panel = this.nextElementSibling;
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                } else {
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                }
            });
        });

        btnOpenCategoryModal.addEventListener('click', () => {
            categoriesModal.classList.add('open');
        });

        btnCloseCategoryModal.addEventListener('click', () => {
            categoriesModal.classList.remove('open');
        });
    }

    static startSendAppStatus() {
        // Send status to the app that embeds this app
        parent.postMessage({ type: 'urlChange', version: 2.2, url: window.location.href }, '*');
        setInterval(() => parent.postMessage({ type: 'alive' }, '*'), 2500);
        window.addEventListener('beforeunload', () => parent.postMessage({ type: 'beforeUnload' }, '*'));
    }
}

App.buildApp();