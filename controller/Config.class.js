'use strict';

class Config {
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
        if (Config.menuIsOpen) {
            Config.closeMenu();
            return
        }

        Config.openMenu();
    }
    // Modal Configs
    static openModal(modalId) {
        document.body.querySelector(`.modal#${modalId}`).classList.add('open');
    }
    static closeModal(modalId) {
        document.body.querySelector(`.modal#${modalId}`).classList.remove('open');
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