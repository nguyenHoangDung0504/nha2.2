'use strict';

class Watch {
    static urlParams = new URLSearchParams(window.location.search);
    static trackKey = Watch.urlParams.get('code') || Watch.urlParams.get('rjcode');
    static track = Database.getTrackByIdentify(Watch.trackKey);
    static reuableElements = {
        contentDiv: document.querySelector('.content-div'),
        postBox: document.querySelector('.post-box'),
    }

    static build() {
        if(!track) {
            alert('Code not found!');
            window.history.back();
        }

        Watch.buildVidDiv();
        Watch.buildCloseMenuAction();
    }

    static buildVidDiv() {
        const { code, rjCode, cvs, tags, series, engName, japName, otherLinks } = Watch.track;
        const trackInfoContainer = document.querySelector('#track-info');
        const trackInfoRowsHtml = [];

        document.querySelector('#vid_frame').src = `watch/altplayer?code=${code}`;
        document.querySelector('#download-box a').href = `watch/download?code=${code}`;
        trackInfoRowsHtml.push(`<span id="track_name"><b><i>${rjCode}</i></b> - ${engName} (Original name: ${japName})</span>`);
        otherLinks.forEach(({ note, url }, index) => {
            trackInfoRowsHtml.push(`<span id="other_link_${index + 1}"><b>${note}: </b><a class="series" target="_blank" href="${url}">Here</a></span>`);
        });
        if(series.length)
            trackInfoRowsHtml.push(`<span id="track_series"><b>Series: </b>${series.map(key => Database.getCategory(Database.categoryType.SERIES, key).getHtmlLink()).join(', ')}</span>`);
        trackInfoRowsHtml.push(`<span id="track_list_cv"><b>CVs</b>: ${cvs.map(key => Database.getCategory(Database.categoryType.CV, key).getHtmlLink()).join(', ')}</span>`);
        trackInfoRowsHtml.push(`<span id="track_list_tag"><b>Tags</b>: ${tags.map(key => Database.getCategory(Database.categoryType.TAG, key).getHtmlLink()).join(', ')}</span>`);
        trackInfoContainer.innerHTML = trackInfoRowsHtml.join('<br><br>');
    }

    static buildCloseMenuAction() {
        document.querySelector('.close-menu').addEventListener('click', () => {
            Config.closeMenu();
        });
    }
}