'use strict';

// Data classes
class Track {
    constructor(code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLinks) {
        Object.assign(this, { code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLinks });
    }

    getHiddenItemElement() {
        const hiddenInfoBlock = document.createElement('div');
        const cvs = Track.getListOfCategoryHtml(this.cvs, Database.categoryType.CV);
        const tags = Track.getListOfCategoryHtml(this.tags, Database.categoryType.TAG);
        const series = Track.getListOfCategoryHtml(this.series, Database.categoryType.SERIES);

        hiddenInfoBlock.classList.add('hidden-info');
        hiddenInfoBlock.id = `hidden_info_of_${this.code}`;
        hiddenInfoBlock.innerHTML = `<div class="content-container">
            <h3><b>RJ Code</b>: ${this.rjCode}</h3>
            <h3 ${series ? '' : 'style="display: none;"'}><b>Series</b>: ${series}</h3>
            <h3><b>Eng Name</b>: ${this.engName}</h3>
            <h3><b>Original Name</b>: ${this.japName}</h3>
            <h3><b>CV</b>: ${cvs}</h3>
            <h3><b>Tags</b>: ${tags}</h3>
        </div>
        <div class="image-container">
            <img loading="lazy" src="${this.thumbnail}" alt="thumbnail of ${this.code}">
        </div>`;

        return hiddenInfoBlock;
    }

    getGridItemElement() {
        const gridItem = document.createElement('div');

        gridItem.dataset.code = this.code;
        gridItem.classList.add('grid-item');
        gridItem.id = `link_to_${this.code}`;
        gridItem.innerHTML = `<div class="image-container">
            <a href="/watch?code=${this.code}">
                <img loading="lazy" src="${this.thumbnail}" alt="thumbnail of ${this.code}">
            </a>
        </div>
        <div class="flex-container">
            <a href="/watch?code=${this.code}">
                <div class="text-container">
                    <p class="multiline-ellipsis">
                        <b><i>${this.rjCode}</i></b> - <span>${this.engName}</span>
                    </p>
                </div>
            </a>
            <div class="text-container">
                <p class="singleline-ellipsis"><br>
                    <b>CV</b>: ${Track.getListOfCategoryHtml(this.cvs, Database.categoryType.CV)}
                </p>
            </div>
        </div>`;

        return gridItem;
    }

    getPostBoxItem() {
        const item = document.createElement('a');

        item.dataset.code = this.code;
        item.href = `../watch?code=${this.code}`;
        item.innerHTML = `<div class="imgcontainer image-container">
            <img loading="lazy" src="${this.thumbnail}" alt="thumbnail of ${this.code}">
        </div>
        <div class="text-box">
            <p class="content-p"><b><i>${this.rjCode}</i></b> - ${this.engName}</p>
        </div>`;
        this.addActionDisplayHiddenItemFor(item.querySelector('.image-container'));

        return item;
    }

    addActionDisplayHiddenItemFor(actionBox, timeOut = 400) {
        let hiddenItem, timeoutId;

        actionBox.addEventListener('mouseenter', event => {
            hiddenItem = document.querySelector(`#hidden_info_of_${this.code}`);
            if(!hiddenItem) {
                hiddenItem = this.getHiddenItemElement();
                App.reuableElements.hiddenItemBox.appendChild(hiddenItem);
            }
          
            timeoutId = setTimeout(() => {
                hiddenItem.style.opacity = '1';
            }, timeOut);
            const x = event.clientX;
            const y = event.clientY;
            hiddenItem.style.left = ((x <= -30 + screen.width - hiddenItem.offsetWidth) ? x : (x - hiddenItem.offsetWidth)) + "px";
            hiddenItem.style.top = ((y <= screen.height - hiddenItem.offsetHeight) ? y : (y - hiddenItem.offsetHeight)) + "px";
        });
        actionBox.addEventListener('mouseleave', () => {
            clearTimeout(timeoutId);
            hiddenItem.style.opacity = '0';
        });
        actionBox.addEventListener('mousemove', event => {
            const x = event.clientX;
            const y = event.clientY;
            hiddenItem.style.left = ((x <= -30 + screen.width - hiddenItem.offsetWidth) ? x : (x - hiddenItem.offsetWidth)) + "px";
            hiddenItem.style.top = ((y <= screen.height - hiddenItem.offsetHeight) ? y : (y - hiddenItem.offsetHeight)) + "px";
        });
    }

    static getListOfCategoryHtml(keys, type) {
        return keys.map(key => Database.getCategory(type, key).getHtml()).join(', ');
    }
}
class Category {
    constructor(name, quantity) {
        Object.assign(this, { name, quantity });
    }
}
class Cv extends Category {
    constructor(name, quantity) {
        super(...arguments);
    }

    getHtml() {
        return `<span class="cv">${this.name} (${this.quantity})</span>`;
    }
    getHtmlLink() {
        return `<a href="../?cv=${encodeURIComponent(this.name)}">${this.getHtml()}</a>`;
    }
}
class Tag extends Category {
    constructor(name, quantity) {
        super(...arguments);
    }

    getHtml() {
        return `<span class="tag">${this.name} (${this.quantity})</span>`;
    }
    getHtmlLink() {
        return `<a href="../?tag=${encodeURIComponent(this.name)}">${this.getHtml()}</a>`;
    }
}
class Series extends Category {
    constructor(name, quantity) {
        super(...arguments);
    }

    getHtml() {
        return `<span class="series">${this.name} (${this.quantity})</span>`;
    }
    getHtmlLink() {
        return `<a href="../?series=${encodeURIComponent(this.name)}">${this.getHtml()}</a>`;
    }
}
class SearchResult {
    constructor(type, value, keyword, code) {
        Object.assign(this, { type, value, keyword, code });
    }

    getHtml() {
        const value = Utils.highlight(this.value, this.keyword);
        const href = ['cv', 'tag', 'series'].includes(this.type)
                      ? `..?${this.type}=${encodeURIComponent(this.value)}` 
                      : `../watch?code=${this.code}`;
        return `<a href="${href}">
            <i class="fas fa-search"></i>&nbsp;
            <strong>${Utils.convertToTitleCase(this.type)}</strong>:
            <span class="cnt">${value}</span>
        </a>`;
    }
}
class OtherLink {
    constructor(note, url) {
        Object.assign(this, { note, url });
    }
}

// App classes
class SwipeHandler {
    constructor(element, leftToRight = () => null, rightToLeft = () => null, up = () => null, down = () => null, thresholdRatio = 2) {
        /**
         * leftToRight: function to call when the swipe/drag action is from left to right
         * rightToLeft:                                                     right to left
         * up         :                                                     bottom to top
         * down       :                                                     top to bottom
         */
        Object.assign(this, { element, leftToRight, rightToLeft, up, down, thresholdRatio });
        this.startX = 0; this.startY = 0;
        this.endX = 0; this.endY = 0;
        this.isSelectingText = false;
        document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));
    }
    registerEvents() {
        this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    handleMouseDown(event) {
        if (event.target.tagName === "IMG")
            event.preventDefault();
        this.startX = event.clientX;
        this.startY = event.clientY;
        this.isSelectingText = false;
    }
    handleMouseUp(event) {
        const targetTagName = event.target.tagName;
        
        // Ignore if event start from select or option
        if (targetTagName === "OPTION" || targetTagName === "SELECT") return;
        
        this.endX = event.clientX;
        this.endY = event.clientY;
        if (!this.isSelectingText) {
            this.handleSwipe();
        }
    }
    handleTouchStart(event) {
        this.startX = event.touches[0].clientX;
        this.startY = event.touches[0].clientY;
        this.isSelectingText = false;
    }
    handleTouchEnd(event) {
        this.endX = event.changedTouches[0].clientX;
        this.endY = event.changedTouches[0].clientY;
        if (!this.isSelectingText) {
            this.handleSwipe();
        }
    }
    handleSwipe() {
        const deltaX = this.endX - this.startX;
        const deltaY = this.endY - this.startY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        if (absDeltaX > absDeltaY && absDeltaX / absDeltaY > this.thresholdRatio) {
            if (deltaX > 0) {
                this.leftToRight();
                return;
            }
            this.rightToLeft();
        } else if (absDeltaY > absDeltaX && absDeltaY / absDeltaX > this.thresholdRatio) {
            if (deltaY > 0) {
                this.down();
                return;
            }
            this.up();
        }
    }
    handleSelectionChange() {
        this.isSelectingText = !!document.getSelection().toString(); // Cập nhật biến khi bôi đen văn bản
    }
}
class VideoPlayer {
    constructor(src) {
        this.isDragging = false;
        this.currentTime = 0;
        this.touchStartX = 0;

        this.vidContainer = document.createElement('div');
        this.vidContainer.classList.add('video-ctn');
        this.vidContainer.innerHTML = '<div class="time-indicator" style="display: none;"></div>';
        this.video = document.createElement('video');
        this.video.innerHTML = `<source src="${src}"></source>`;
        this.video.dataset.isPause = true;
        this.video.dataset.timeChange = 0;
        this.video.controls = true;
        this.video.preload = "auto";
        this.timeIndicator = this.vidContainer.querySelector('.time-indicator');
        this.vidContainer.appendChild(this.video);

        this.vidContainer.addEventListener('mousedown', () => {
            this.isDragging = true;
            this.pause();
            this.currentTime = this.video.currentTime;
            setTimeout(() => {
                if (this.isDragging == true) {
                    this.timeIndicator.style.display = 'block';
                    this.updateTimeIndicator();
                }
            }, 300);
        });

        this.vidContainer.addEventListener('mouseup', () => {
            this.isDragging = false;
            if (this.video.dataset.timeChange == 0) {
                this.video.dataset.timeChange = 0;
                this.timeIndicator.style.display = 'none';
                return;
            } else {
                this.video.dataset.isPause == "true" ? this.play() : '';
                this.timeIndicator.style.display = 'none';
            }
            this.video.dataset.timeChange = 0;
        });

        this.vidContainer.addEventListener('mousemove', (event) => {
            if (this.isDragging) {
                const { movementX } = event;
                const pixelsPerSecond = 50;
                const timeToSeek = movementX / pixelsPerSecond;
                let currentTimeBefore = this.video.currentTime;
                let currentTimeAfter = this.video.currentTime;
                currentTimeAfter += timeToSeek;
                currentTimeAfter = Math.max(0, Math.min(currentTimeAfter, this.video.duration));
                this.video.dataset.timeChange = Math.abs(currentTimeAfter - currentTimeBefore);
                this.video.currentTime = currentTimeAfter;
                this.currentTime += timeToSeek;
                this.updateTimeIndicator();
            }
        });

        this.vidContainer.addEventListener('touchstart', (event) => {
            this.isDragging = true;
            this.pause();
            this.touchStartX = event.touches[0].clientX;
        });

        this.vidContainer.addEventListener('touchend', () => {
            this.isDragging = false;
            this.touchStartX = 0;
            if (this.video.dataset.timeChange == 0) {
                this.video.dataset.timeChange = 0;
                return;
            } else {
                this.video.dataset.isPause == "true" ? this.play() : '';
            }
            this.video.dataset.timeChange = 0;
        });

        this.vidContainer.addEventListener('touchmove', (event) => {
            if (this.isDragging) {
                const touchCurrentX = event.touches[0].clientX;
                const touchDistanceX = touchCurrentX - this.touchStartX;
                const pixelsPerSecond = 500;
                const timeToSeek = touchDistanceX / pixelsPerSecond;
                let currentTimeBefore = this.video.currentTime;
                let currentTimeAfter = this.video.currentTime;
                currentTimeAfter += timeToSeek;
                currentTimeAfter = Math.max(0, Math.min(currentTimeAfter, this.video.duration));
                this.video.dataset.timeChange = Math.abs(currentTimeAfter - currentTimeBefore);
                this.video.currentTime = currentTimeAfter;
            }
        });

        return this.vidContainer;
    }
    play() {
        setTimeout(() => {
            if (this.video.dataset.isPause == 'false')
                return;
            this.video.dataset.isPause = false;
            this.video.play();
        }, 10);
    }
    pause() {
        setTimeout(() => {
            if (this.video.dataset.isPause == 'true')
                return;
            this.video.dataset.isPause = true;
            this.video.pause();
        }, 10);
    }
    updateTimeIndicator() {
        const formatTime = (time) => {
            let minutes = Math.floor(time / 60);
            let seconds = Math.floor(time - minutes * 60);

            let hours = Math.floor(minutes / 60);
            minutes = minutes % 60;

            if (hours > 0) {
                return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
            } else {
                return `${padZero(minutes)}:${padZero(seconds)}`;
            }
        }
        const padZero = (time) => {
            return time < 10 ? '0' + time : time;
        }
        const formattedTime = formatTime(this.video.currentTime);
        this.timeIndicator.textContent = `${formattedTime}`;
    }
}
class ImageDisplayer {
    constructor(src, closeFullscreen, openFullscreen) {
        this.startX = 0; this.currentX = 0;
        this.startY = 0; this.currentY = 0;
        this.diffX = 0; this.diffY = 0;

        this.mouseDown = false;
        this.startMouseX = 0; this.currentMouseX = 0; this.diffMouseX = 0;
        this.startMouseY = 0; this.currentMouseY = 0; this.diffMouseY = 0;

        const ctn = document.createElement('div');
        ctn.classList.add('img-ctn');
        this.div = document.createElement('div');
        this.div.classList.add('get-evt');
        const img = document.createElement('img');
        img.classList.add('img');
        img.src = src;
        ctn.appendChild(img);
        this.div.addEventListener('dblclick', () => {
            if (document.fullscreen) {
                closeFullscreen();
                return;
            }
            openFullscreen();
        });

        new SwipeHandler(this.div, 
            () => document.querySelector('#prev-btn').click(),
            () => document.querySelector('#next-btn').click(),
            () => document.body.classList.add('open-menu-mp3'),
            () => document.body.classList.remove('open-menu-mp3')
        ).registerEvents();

        ctn.appendChild(this.div);
        return ctn;
    }
}
class AudioController {
    constructor(src) {
        this.isDragging = false;
        this.currentTime = 0;
        this.touchStartX = 0;
        this.time = 3;
        this.filename = Utils.getFileNameFromUrl(src);

        this.audContainer = document.createElement('div');
        this.audio = document.createElement('audio');
        this.seekBar = document.createElement('div');

        this.audContainer.classList.add('aud-ctn');
        this.audio.controls = true;
        this.audio.innerHTML = `<source src="${src}"></source>`;
        this.audio.dataset.isPause = true;
        this.audio.dataset.timeChange = 0;

        this.audio.addEventListener('play', () => {
            this.audContainer.classList.add('playing');
            this.audContainer.setAttribute('before', `Playing: ${this.filename}`);
            this.audio.dataset.isPause = false;
        });

        this.audio.addEventListener('pause', () => {
            this.audio.dataset.isPause = true;
            this.time = 3;
            const countdown = (time) => {
                if (time > 0) {
                    if (this.audio.dataset.isPause != 'true') {
                        this.audContainer.setAttribute('before', `Playing: ${this.filename}`);
                        this.time = 3;
                    } else {
                        let timeOut = setTimeout(() => {
                            if (this.audio.dataset.isPause != 'true') {
                                clearTimeout(timeOut);
                            }
                            this.time -= 1;
                            countdown(this.time);
                        }, 1000);
                        this.audContainer.setAttribute('before', `Auto hide after ${time}s`);
                    }
                } else {
                    if (this.audio.dataset.isPause == 'true') {
                        this.audContainer.classList.remove('playing');
                    }
                }
            }
            countdown(this.time);
        });

        this.seekBar.classList.add('seek-bar');

        this.seekBar.addEventListener('mousedown', () => {
            this.isDragging = true;
            this.pause();
            this.currentTime = this.audio.currentTime;
        });

        this.seekBar.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.audio.dataset.isPause == "true" ? this.play() : '';
            this.audio.dataset.timeChange = 0;
        });

        this.seekBar.addEventListener('mousemove', (event) => {
            if (this.isDragging) {
                const { movementX } = event;
                const pixelsPerSecond = 30;
                const timeToSeek = movementX / pixelsPerSecond;
                let currentTimeBefore = this.audio.currentTime;
                let currentTimeAfter = this.audio.currentTime;
                currentTimeAfter += timeToSeek;
                currentTimeAfter = Math.max(0, Math.min(currentTimeAfter, this.audio.duration));
                this.audio.dataset.timeChange = Math.abs(currentTimeAfter - currentTimeBefore);
                this.audio.currentTime = currentTimeAfter;
                this.currentTime += timeToSeek;
            }
        });

        this.seekBar.addEventListener('touchstart', (event) => {
            this.isDragging = true;
            this.pause();
            this.touchStartX = event.touches[0].clientX;
        });

        this.seekBar.addEventListener('touchend', () => {
            this.isDragging = false;
            this.touchStartX = 0;
            if (this.audio.dataset.timeChange == 0) {
                this.audio.dataset.timeChange = 0;
                return;
            } else {
                this.audio.dataset.isPause == "true" ? this.play() : '';
            }
            this.audio.dataset.timeChange = 0;
        });

        this.seekBar.addEventListener('touchmove', (event) => {
            if (this.isDragging) {
                const touchCurrentX = event.touches[0].clientX;
                const touchDistanceX = touchCurrentX - this.touchStartX;
                const pixelsPerSecond = 30;
                const timeToSeek = touchDistanceX / pixelsPerSecond;
                let currentTimeBefore = this.audio.currentTime;
                let currentTimeAfter = this.audio.currentTime;
                currentTimeAfter += timeToSeek;
                currentTimeAfter = Math.max(0, Math.min(currentTimeAfter, this.audio.duration));
                this.audio.dataset.timeChange = Math.abs(currentTimeAfter - currentTimeBefore);
                this.audio.currentTime = currentTimeAfter;
            }
        });

        this.audContainer.appendChild(this.audio);
        this.audContainer.appendChild(this.seekBar);
        return this.audContainer;
    }
    play() {
        this.audContainer.setAttribute('before', `Playing: ${this.filename}`);
        setTimeout(() => {
            if (this.audio.dataset.isPause == 'false')
                return;
            this.audio.dataset.isPause = false;
            this.audio.play();
        }, 10);
    }
    pause() {
        setTimeout(() => {
            if (this.audio.dataset.isPause == 'true')
                return;
            this.audio.dataset.isPause = true;
            this.audio.pause();
        }, 10);
    }
}
class AudioPlayer {
    constructor(audioElements, track = null) {
        this.audioElements = audioElements;
        this.track = track;
        this.currentAudioIndex = 0;
    }
    playCurrentTrack() {
        this.audioElements[this.currentAudioIndex].play();
    }
    pauseCurrentTrack() {
        this.audioElements[this.currentAudioIndex].pause();
    }
    playNextTrack() {
        this.pauseCurrentTrack();
        this.currentAudioIndex++;
        if (this.currentAudioIndex >= this.audioElements.length) {
            this.currentAudioIndex = 0;
        }
        this.playCurrentTrack();
    }
    playPreviousTrack() {
        this.pauseCurrentTrack();
        this.currentAudioIndex--;
        if (this.currentAudioIndex < 0) {
            this.currentAudioIndex = this.audioElements.length - 1;
        }
        this.playCurrentTrack();
    }
    setupMediaSession() {
        if ('mediaSession' in navigator) {
            const track = this.track;
            
            if(track) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: `~${track.code}`,
                    artist: `${track.cvs.join(', ')}`,
                    album: `${track.series.join(', ')}`,
                    artwork: [
                        ...track.images.map(src => {
                            return { src, sizes: '512x512', type: 'image/jpeg' };
                        })
                    ]
                });
            }

            navigator.mediaSession.setActionHandler('play', () => {
                this.playCurrentTrack();
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                this.pauseCurrentTrack();
            });
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                this.playNextTrack();
            });
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                this.playPreviousTrack();
            });
        }
    }
}

Utils.memoizeGetAndSearchMethods(Track, Cv, Tag, Series, SearchResult, OtherLink);