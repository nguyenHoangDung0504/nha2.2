'use strict';

class Database {
    static config = {
        log: true,
        test: true
    };

    static trackKeyMap = new Map();
    static trackMap = new Map();
    static cvMap = new Map();
    static tagMap = new Map();
    static seriesMap = new Map();

    static addTrackToDatabase(code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLink = "") {
        [cvs, tags, series, images, audios] = [cvs, tags, series, images, audios].map(member => Utils.standardizedTrackArrData(member));
        [cvs, tags, series] = [cvs, tags, series].map(member => member.sort());

        otherLink = otherLink.split(',').filter(subStr => subStr).map(noteNLink => {
            noteNLink = noteNLink.trim();
            const [note, link] = noteNLink.split('::').map(item => item.trim());
            return new OtherLink(note, link);
        })

        const track = new Track(code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLink);
        Database.trackKeyMap.set(code, code);
        Database.trackKeyMap.set(rjCode, code);
        Database.trackMap.set(code, track);


        const mapList = [Database.cvMap, Database.tagMap, Database.seriesMap];
        const classToCreate = [Cv, Tag, Series];
        
        [cvs, tags, series].forEach((member, i) => {
            member.forEach(item => {
                if(mapList[i].has(item)) {
                    mapList[i].get(item).quantity++;
                    return;
                }
                mapList[i].set(member, new classToCreate[i](item, 1));
            });
        });
    }
}