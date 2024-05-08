'use strict';

class App {
    static buildApp() {
        console.time('Home - Build app time');

        const [
            openCategoryModalBtn, categoriesModal, openMenuBtn, 
            rankListCvCtn, rankListTagCtn, rankListSeriesCtn
        ] = [
            '.open-category-modal-btn', '#categories-modal', '#open-menu-btn',
            '.rank-list-grid-item.cv', '.rank-list-grid-item.tag', '.rank-list-grid-item.series'
        ].map(selector => {
            return document.querySelector(selector);
        });

        openCategoryModalBtn.addEventListener('click', () => {
            categoriesModal.classList.add('open');
        });

        openMenuBtn.addEventListener('click', () => {
            Config.toggleMenu();
        });
        
        categoriesModal.querySelector('.close-btn').addEventListener('click', () => {
            categoriesModal.classList.remove('open');
        });

        const accordions = document.querySelectorAll('.accordion-header');
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

        const [listCvCtn, listTagCtn, listSeriesCtn] = [rankListCvCtn, rankListTagCtn, rankListSeriesCtn].map(ctn => ctn.querySelector('.links'));
        [listCvCtn, listTagCtn, listSeriesCtn].forEach(ctn => ctn.innerHTML = '');
        Database.listCv.forEach(({ name, quantity }) => {
            listCvCtn.innerHTML += `<a href="../?cv=${encodeURIComponent(name)}" class="item" quantity="${quantity}">${Utils.convertToTitleCase(name)}</a>`;
        });
        Database.listTag.forEach(({ name, quantity }) => {
            listTagCtn.innerHTML += `<a href="../?tag=${encodeURIComponent(name)}" class="item" quantity="${quantity}">${Utils.convertToTitleCase(name)}</a>`;
        });
        Database.listSeries.forEach(({ name, quantity }) => {
            listSeriesCtn.innerHTML += `<a href="../?series=${encodeURIComponent(name)}" class="item" quantity="${quantity}">${Utils.convertToTitleCase(name)}</a>`;
        });

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