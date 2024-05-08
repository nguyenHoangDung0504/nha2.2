'use strict';

class Config {
    static APP_NAME = 'NHD ASMR'
    static APP_ICON_URL = 'https://cdn.glitch.global/36049008-0c55-496e-873e-a2f971037d73/icon-edited.webp?v=1704340956129'
    static BASE_MESSAGE = 'NHD Hentai - ASMR Hentai Tracks'
    static MENU_TITLE = Config.APP_NAME + ' - Menu'

    static deviceIsMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    // Menu Configs
        static menuIsOpen() {
            return Array.from(document.body.classList).indexOf('openMenu') != -1;
        }
        static openMenu() {
            if (!Config.menuIsOpen())
                document.body.classList.add('openMenu');
        }
        static closeMenu() {
            if (Config.menuIsOpen())
                document.body.classList.remove('openMenu');
        }
        static toggleMenu() {
            if (Config.menuIsOpen()) {
                Config.closeMenu();
                return
            }

            Config.openMenu();
        }
    // Result box Configs
        static hideResultBox() {
            setTimeout(() => {
                document.querySelector('.result-box').style.display = 'none';
            }, 200);
        }
        static showResultBox() {
            let searchBox = document.querySelector('input#input.search-input');
            let resultBox = document.querySelector('.result-box');

            if (searchBox.value)
                resultBox.style.display = 'block';
        }
    // Fullscreen Configs
        static openFullscreen() {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        }
        static closeFullscreen() {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (document.webkitFullscreenElement) {
                document.webkitExitFullscreen();
            } else if (document.msFullscreenElement) {
                document.msExitFullscreen();
            }
        }
        static toggleFullscreen() {
            if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                Config.openFullscreen();
                return;
            }
            
            Config.closeFullscreen();
        }
}