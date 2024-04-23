import Utils from "../utils/utils.class.js";
import { Track, Cv, Tag, Series, SearchResult, OtherLink } from "../models/classes.js";

console.time('Build Database Time');
export class Database {
    static listTrack = [];
    static listCode = [];
    static listCv = [];
    static listTag = [];
    static listSeries = [];
    static displayListTrack = [];
    static displayListCv = [];
    static displayListTag = [];
    static displayListSeries = [];

    static addTrackToDatabase(code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLink = "") {
        [cvs, tags, series, images, audios] = [cvs, tags, series, images, audios].map(member => Utils.standardizedTrackArrData(member));
        [cvs, tags, series] = [cvs, tags, series].map(member => member.sort());
        
        otherLink = otherLink.split(',').filter(subStr => subStr).map(noteNLink => {
            noteNLink = noteNLink.trim();
            const [note, link] = noteNLink.split('::').map(item => item.trim());
            return new OtherLink(note, link);
        })

        const track = new Track(code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLink);
        Database.listTrack.push(track);
        Database.listCode.push(code);

        const listOfListToAddItem = [Database.listCv, Database.listTag, Database.listSeries];
        const classToCreate = [Cv, Tag, Series];
        [cvs, tags, series].forEach((member, index) => {
            member.forEach(item => {
                const listToAddItem = listOfListToAddItem[index];
                if (!item) return;
                let indexOfItem = listToAddItem.findIndex(itemToFind => itemToFind.name == item);

                if (indexOfItem == -1) {
                    listToAddItem.push(new classToCreate[index](item, 1));
                } else {
                    listToAddItem[indexOfItem].quantity++;
                }
            });
        });
    }

    // Call when completed add data
    static buildData() {
        Database.sortListTrackByRjCode();
        Database.displayListCv = Database.listCv.sort(Utils.byName);
        Database.displayListTag = Database.listTag.sort(Utils.byName);
        Database.displayListSeries = Database.listSeries.sort(Utils.byName);

        console.timeEnd('Build Database Time');
        console.log(`Added: ${Database.listCode.length} Tracks`);
        const listNames = ['List Track', 'List Cv', 'List Tag', 'List Series'];
        [Database.displayListTrack, Database.displayListCv, Database.displayListTag, Database.displayListSeries].forEach((list, index) => {
            console.log(`Complete Build ${listNames[index]}:`, list);
        });
        Database.testingFunctions();
    }

    // Sort functions
    static sortListTrackByRjCode(desc = false) {
        Database.displayListTrack = [...Database.listTrack].sort((a, b) => {
            return Number(b.rjCode.replace('RJ', '').replaceAll('?', '')) - Number(a.rjCode.replace('RJ', '').replaceAll('?', ''))
        });
        if (desc)
            Database.displayListTrack.reverse();
    }
    static sortListTrackByCode(desc = false) {
        Database.displayListTrack = [...Database.listTrack].sort((a, b) => a.code - b.code);
        if (desc)
            Database.displayListTrack.reverse();
    }
    static sortListTrackByUploadOrder(desc = false) {
        Database.displayListTrack = [...Database.listTrack];
        if (desc)
            Database.displayListTrack.reverse();
    }
    static sortListCategoryByName(listName, desc = false) {
        switch (listName.toLowerCase()) {
            case 'cv':
                Database.displayListCv = [...Database.listCv].sort(Utils.byName);
                if (!desc) Database.displayListCv.reverse();
                break;
            case 'tag':
                Database.displayListTag = [...Database.listTag].sort(Utils.byName);
                if (!desc) Database.displayListTag.reverse();
                break;
            case 'series':
                Database.displayListSeries = [...Database.listSeries].sort(Utils.byName);
                if (!desc) Database.displayListSeries.reverse();
                break;

            default:
                break;
        }
    }
    static sortListCategoryByQuantity(listName, desc = false) {
        switch (listName.toLowerCase()) {
            case 'cv':
                Database.displayListCv = [...Database.listCv].sort(Utils.byQuantity);
                if (desc) Database.displayListCv.reverse();
                break;
            case 'tag':
                Database.displayListTag = [...Database.listTag].sort(Utils.byQuantity);
                if (desc) Database.displayListTag.reverse();
                break;
            case 'series':
                Database.displayListSeries = [...Database.listSeries].sort(Utils.byQuantity);
                if (desc) Database.displayListSeries.reverse();
                break;

            default:
                break;
        }
    }

    // Get data functions
    static getSingleCategory(type, keyword) {
        const lowerCaseKeyword = keyword.toLowerCase();
        let arrayToSearch, returnValue = '';

        if (type === 'cv') {
            arrayToSearch = [...Database.listCv];
        } else if (type === 'tag') {
            arrayToSearch = [...Database.listTag];
        } else if (type === 'series') {
            arrayToSearch = [...Database.listSeries];
        } else {
            return '';
        }

        arrayToSearch.forEach(ele => {
            if (ele.name.toLowerCase() == lowerCaseKeyword)
                returnValue = ele;
        });

        return returnValue;
    }
    static getCategory(type, keyword) {
        const lowerCaseKeyword = keyword.toLowerCase();
        let arrayToSearch;

        if (type === 'cv') {
            arrayToSearch = [...Database.listCv];
        } else if (type === 'tag') {
            arrayToSearch = [...Database.listTag];
        } else if (type === 'series') {
            arrayToSearch = [...Database.listSeries];
        } else {
            return [];
        }

        const returnValue = arrayToSearch.filter(item => item.name.toLowerCase().includes(lowerCaseKeyword));

        returnValue.sort((a, b) => {
            const indexA = a.name.toLowerCase().indexOf(lowerCaseKeyword);
            const indexB = b.name.toLowerCase().indexOf(lowerCaseKeyword);
            return indexA - indexB;
        });

        return returnValue;
    }
    static getSearchSuggestions(keyword) {
        const lowerCaseKeyword = keyword.toString().toLowerCase();
        const results = [];
        const seen = new Set();

        Database.displayListTrack.forEach(track => {
            const lowerCaseCode = track.code.toString();
            const lowerCaseRjCode = track.rjCode.toLowerCase();
            const lowerCaseJapName = track.japName.toLowerCase();
            const lowerCaseEngName = track.engName.toLowerCase();

            // Check code
            if (lowerCaseCode.includes(lowerCaseKeyword) && !seen.has(`${track.code}_code`)) {
                results.push(new SearchResult("code", track.code, keyword, track.code));
                seen.add(`${track.code}_code`);
            }
            // Check rjCode
            if (lowerCaseRjCode.includes(lowerCaseKeyword) && !seen.has(`${track.rjCode}_rjCode`)) {
                results.push(new SearchResult("rjCode", track.rjCode, keyword, track.code));
                seen.add(`${track.rjCode}_rjCode`);
            }
            // Check cvs
            track.cvs.forEach(cv => {
                const lowerCaseCv = cv.toLowerCase();
                if (lowerCaseCv.includes(lowerCaseKeyword) && !seen.has(`${cv}_cv`)) {
                    results.push(new SearchResult("cv", cv, keyword, track.code));
                    seen.add(`${cv}_cv`);
                }
            });
            // Check tags
            track.tags.forEach(tag => {
                const lowerCaseTag = tag.toLowerCase();
                if (lowerCaseTag.includes(lowerCaseKeyword) && !seen.has(`${tag}_tag`)) {
                    results.push(new SearchResult("tag", tag, keyword, track.code));
                    seen.add(`${tag}_tag`);
                }
            });
            // Check series
            track.series.forEach(series => {
                const lowerCaseSeries = series.toLowerCase();
                if (lowerCaseSeries.includes(lowerCaseKeyword) && !seen.has(`${series}_series`)) {
                    results.push(new SearchResult("series", series, keyword, track.code));
                    seen.add(`${series}_series`);
                }
            });
            // Check english name
            if (lowerCaseEngName.includes(lowerCaseKeyword) && !seen.has(`${track.engName}_engName`)) {
                results.push(new SearchResult("engName", track.engName, keyword, track.code));
                seen.add(`${track.engName}_engName`);
            }
            // Check japanese name
            if (lowerCaseJapName.includes(lowerCaseKeyword) && !seen.has(`${track.japName}_japName`)) {
                results.push(new SearchResult("japName", track.japName, keyword, track.code));
                seen.add(`${track.japName}_japName`);
            }
        });

        const typeOrder = ["code", "rjCode", "cv", "tag", "series", "engName", "japName"];

        results.sort((a, b) => {
            const keywordIndexA = a.value.toString().toLowerCase().indexOf(lowerCaseKeyword);
            const keywordIndexB = b.value.toString().toLowerCase().indexOf(lowerCaseKeyword);
            if (keywordIndexA !== keywordIndexB) {
                return keywordIndexA - keywordIndexB;
            }
            const typeComparison = typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
            if (typeComparison !== 0) {
                return typeComparison;
            }
            return a.value.toString().localeCompare(b.value.toString());
        });
        
        return results; 
    };
    static getTracksByKeyword(keyword) {
        const listTrack = Database.displayListTrack;
        const lowerCaseKeyword = keyword.toString().toLowerCase();
        const results = [];

        // Find Tracks with code, name or rjCode containing keywords
        listTrack.forEach((track, index) => {
            const lowerCaseCode = track.code.toString();
            const lowerCaseRjCode = track.rjCode.toLowerCase();
            const lowerCaseJapName = track.japName.toLowerCase();
            const lowerCaseEngName = track.engName.toLowerCase();

            if (
                lowerCaseCode.includes(lowerCaseKeyword) ||
                lowerCaseRjCode.includes(lowerCaseKeyword) ||
                lowerCaseJapName.includes(lowerCaseKeyword) ||
                lowerCaseEngName.includes(lowerCaseKeyword)
            ) {
                results.push(index);
            }
        });

        // Find Tracks with CVs contain keywords
        listTrack.forEach((track, index) => {
            track.cvs.forEach((cv) => {
                const lowerCaseCv = cv.toLowerCase();
                if (lowerCaseCv.includes(lowerCaseKeyword) && !results.includes(index)) {
                    results.push(index);
                }
            });
        });

        // Find Tracks with tags containing keywords
        listTrack.forEach((track, index) => {
            track.tags.forEach((tag) => {
                const lowerCaseTag = tag.toLowerCase();
                if (lowerCaseTag.includes(lowerCaseKeyword) && !results.includes(index)) {
                    results.push(index);
                }
            });
        });

        // Find Tracks with series containing keywords
        listTrack.forEach((track, index) => {
            track.series.forEach((series) => {
                const lowerCaseSeries = series.toLowerCase();
                if (lowerCaseSeries.includes(lowerCaseKeyword) && !results.includes(index)) {
                    results.push(index);
                }
            });
        });

        return results.map((index) => listTrack[index]);
    };
    static getTracksByCategory(categoryType, keyword) {
        const listTrack = Database.displayListTrack;
        const lowerCaseKeyword = keyword.toLowerCase();
        const tracks = [];
        const categoryTypes = ['cv', 'tag', 'series'];
        const categories = ['cvs', 'tags', 'series'];

        listTrack.forEach(track => {
            if (track[categories[categoryTypes.indexOf(categoryType)]].some(t => t.toLowerCase() === lowerCaseKeyword))
                tracks.push(track);
        });

        return tracks;
    }
    static getTracksByIdentify(identify) {
        let rs = '';

        Database.listTrack.forEach(track => {
            if (track.code.toString() === identify || track.rjCode.toLowerCase() === identify.toLowerCase()) {
                rs = track;
            }
        });

        return rs;
    }
    static getTracksDataOfPage(page, trackPerPage) {
        const start = (page - 1) * trackPerPage;
        const end = Math.min(start + trackPerPage - 1, Database.listCode.length);

        return Database.displayListSeries.slice(start, end + 1);
    }
    static getRandomTracks(n) {
        const listTrack = Database.listTrack;
        let shuffledIndexes = JSON.parse(localStorage.getItem('shuffledIndexes'));

        if (!shuffledIndexes || shuffledIndexes.length < n) {
            const remainingIndexes = Array.from(
                Array(!shuffledIndexes ? listTrack.length : listTrack.length - shuffledIndexes.length).keys()
            );
            Utils.shuffleArray(remainingIndexes);
            if (!shuffledIndexes) {
                shuffledIndexes = remainingIndexes;
            } else {
                shuffledIndexes.push(...remainingIndexes);
            }
            localStorage.setItem('shuffledIndexes', JSON.stringify(shuffledIndexes));
        }

        const randomTracks = [];
        for (let i = 0; i < n; i++) {
            const trackIndex = shuffledIndexes[i];
            const track = listTrack[trackIndex];
            randomTracks.push(track);
        }

        shuffledIndexes = shuffledIndexes.slice(n);
        localStorage.setItem('shuffledIndexes', JSON.stringify(shuffledIndexes));

        return randomTracks;
    }
    static testingFunctions() {
        console.log('\n\n\n\n\n');
        console.time('Database functions testing time');
        console.log('Testing functions-----------------------------------------------------------------------');
        console.log( Database.getCategory('cv', '') );
        console.log( Database.getCategory('tag', '') );
        console.log( Database.getCategory('series', '') );
        console.log( Database.getSearchSuggestions('na') );
        console.log( Database.getTracksByKeyword('saka') );
        console.log( Database.getTracksByCategory('cv', 'narumi aisaka') );
        console.log( Database.getTracksByCategory('tag', 'elf') );
        console.log( Database.getTracksByCategory('series', 'ドスケベjKシリーズ') );
        console.log( Database.getTracksByIdentify('107613') );
        console.log( Database.getTracksByIdentify('Rj377038') );
        console.log( Database.getRandomTracks(10) );
        console.log( Database.getRandomTracks(20) );
        console.log('End testing functions------------------------------------------------------------------');
        console.timeEnd('Database functions testing time');
    }
}