'use strict';

class AltPlayer {
    static urlParams = new URLSearchParams(window.location.search);
    static trackKey = AltPlayer.urlParams.get("code");
    static track = Database.getTrackByIdentify(AltPlayer.trackKey);
    static isPortrait = false;
    static reuableElements = {
        elem: document.documentElement,
        fullscreenBtn: document.querySelector('#fullscreen-btn'),
        fullscreenIcon: document.querySelector('#fullscreen-btn i'),
        contentContainer: document.querySelector('.content-container'),
        mp3Container: document.querySelector('.menu-mp3')
    }

    static build() {
        if(!AltPlayer.track) {
            alert('Code not found!');
            return;
        }
        document.title = "~Alt Player - " + AltPlayer.track.code;
        AltPlayer.buildActions();
        AltPlayer.buildContent();
    }

    static buildActions() {
        const { fullscreenBtn, contentContainer, mp3Container } = AltPlayer.reuableElements;
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
            const icon = alignBtn.querySelector('i');

            document.body.classList.toggle('menu-ctn-right');
            if (icon.classList.contains('fa-align-left')) {
                icon.classList.remove('fa-align-left');
                icon.classList.add('fa-align-right');
            } else if (icon.classList.contains('fa-align-right')) {
                icon.classList.remove('fa-align-right');
                icon.classList.add('fa-align-left');
            }
        });
        
        fullscreenBtn.addEventListener('click', () => document.fullscreen ? AltPlayer.closeFullscreen() : AltPlayer.openFullscreen());

        document.querySelector('#next-btn').addEventListener('click', () => {
            contentContainer.appendChild(contentContainer.firstChild);
        });
        document.querySelector('#prev-btn').addEventListener('click', () => {
            contentContainer.insertBefore(contentContainer.lastChild, contentContainer.firstChild);
        });
    }
    static buildContent() {
        const { contentContainer, mp3Container } = AltPlayer.reuableElements;
        const { images, audios } = AltPlayer.track;
        
        images.forEach(iov => {
            contentContainer.appendChild(iov.includes('.mp4') 
                ? new VideoPlayer(iov) 
                : new ImageDisplayer(iov, AltPlayer.closeFullscreen, AltPlayer.openFullscreen)
            );
        });
        audios.forEach(src => {
            mp3Container.appendChild(new AudioController(src));
        });
        
        new AudioPlayer(
            Array.from(document.querySelectorAll('audio')), 
            AltPlayer.track
        ).setupMediaSession();
    }
    static openFullscreen() {
        const icon = AltPlayer.reuableElements.fullscreenIcon;
        const elem = AltPlayer.reuableElements.elem

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
AltPlayer.build();