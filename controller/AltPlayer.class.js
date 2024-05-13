'use strict';

class AltPlayer {
    static isPortrait = false;
    static reuableElements = {
        elem: document.documentElement,
        fullscreenBtn: document.querySelector('#fullscreen-btn'),
        fullscreenIcon: document.querySelector('#fullscreen-btn i')
    }

    static build() {
        const { elem, fullscreenBtn } = AltPlayer.reuableElements;
        const alignBtn = document.querySelector('#align-btn');

        document.querySelector('#opn-cls-menu-btn').addEventListener('click', () => {
            document.body.classList.toggle('open-menu-ctn');
        });
        document.querySelector('#opn-cls-menu-mp3-btn').addEventListener('click', () => {
            document.body.classList.toggle('open-menu-mp3');
        });
        document.querySelector('#rolate-btn').addEventListener('click', AltPlayer.rolateScreen);
        document.querySelector('#reload-btn').addEventListener('click', () => {
            document.querySelectorAll('audio, video, img.img[src]').forEach(ele => { ele.load(); });
        });
        
        alignBtn.addEventListener('click', () => {
            document.body.classList.toggle('menu-ctn-right');
            const icon = alignBtn.querySelector('i');
            if (Array.from(icon.classList).includes('fa-align-left')) {
                icon.classList.remove('fa-align-left');
                icon.classList.add('fa-align-right');
            } else if (Array.from(icon.classList).includes('fa-align-right')) {
                icon.classList.remove('fa-align-right');
                icon.classList.add('fa-align-left');
            }
        });
        
        AltPlayer.reuableElements.fullscreenBtn.addEventListener('click', () => {
            if(document.fullscreen) {
                closeFullscreen();
                return;
            }
            openFullscreen();
        });
    }

    static openFullscreen() {
        const icon = AltPlayer.reuableElements.fullscreenIcon;

        if (icon.classList.contains('fa-expand')) {
            icon.classList.remove('fa-expand');
            icon.classList.add('fa-compress');
        }
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        if (Config.deviceIsMobile())
            screen.orientation.lock('landscape');
        AltPlayer.isPortrait = false;
    }
    static closeFullscreen() {
        const icon = AltPlayer.reuableElements.fullscreenIcon;

        if (icon.classList.contains('fa-compress')) {
            icon.classList.remove('fa-compress');
            icon.classList.add('fa-expand');
        }
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (document.webkitFullscreenElement) {
            document.webkitExitFullscreen();
        } else if (document.msFullscreenElement) {
            document.msExitFullscreen();
        }
        screen.orientation.unlock();
    }
    static rolateScreen() {
        if (document.fullscreen) {
            if (AltPlayer.isPortrait) {
                screen.orientation.unlock();
                screen.orientation.lock('landscape');
                AltPlayer.isPortrait = false;
                return;
            }
            screen.orientation.unlock();
            screen.orientation.lock('portrait');
            AltPlayer.isPortrait = true;
        }
    }
}

const contentContainer = document.querySelector('.content-container');
const mp3Container = document.querySelector('.menu-mp3');

document.querySelector('#next-btn').addEventListener('click', () => {
    contentContainer.appendChild(contentContainer.firstChild);
});

document.querySelector('#prev-btn').addEventListener('click', () => {
    contentContainer.insertBefore(contentContainer.lastChild, contentContainer.firstChild);
});

const urlParams = new URLSearchParams(window.location.search);
let trackId = urlParams.get("code");
let track = window.databasefs.getTrackByCode(trackId) || window.databasefs.getTrackByRjCode(trackId);
if (!trackId || !track) {
    window.history.back();
}
document.title = "NHD ASMR - Alt Player: " + track.code;

if (!track.images.includes(track.thumbnail))
    track.images.unshift(track.thumbnail);

track.images.forEach(iov => {
    contentContainer.appendChild(iov.includes('.mp4') ? new window.classes.VideoPlayer(iov) : new window.classes.ImageDisplayer(iov, closeFullscreen, openFullscreen));
});
track.audios.forEach(src => {
    mp3Container.appendChild(new window.classes.AudioPlayer(src));
});