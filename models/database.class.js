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
            const [note, link] = noteNLink.split(':').map(item => item.trim());
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
                if(item) {
                    let indexOfItem = listToAddItem.findIndex(itemToFind => itemToFind.name == item);
    
                    if(indexOfItem == -1) {
                        listToAddItem.push(new classToCreate[index](item, 1))
                    } else {
                        listToAddItem[indexOfItem].count++
                    }                
                }
            });
        });
    }

    // Call when completed add data
    static buildData() {
        Database.displayListCv = Database.listCv.sort(byName);
        Database.displayListTag = Database.listTag.sort(byName);
        Database.displayListSeries = Database.listSeries.sort(byName);

        function byName(a, b) {
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        }

        console.timeEnd('Build Database Time');
        console.log(`Added: ${Database.listCode.length} Tracks`);
        const listNames = ['List Track', 'List Cv', 'List Tag', 'List Series'];
        [Database.listTrack, Database.listCv, Database.listTag, Database.listSeries].forEach((list, index) => {
            console.log(`Complete Build ${listNames[index]}:`, list);
        });
    }

    static sortListTrackByRjCode() {
        Database.displayListTrack = [...Database.listTrack].sort((a, b)=>{
            return Number(b.rjCode.replace('RJ', '').replaceAll('?','')) - Number(a.rjCode.replace('RJ', '').replaceAll('?','')) 
        });
    }

    static sortListTrackByUploadOrder(newest = true) {
        Database.displayListTrack = newest ? [...Database.listTrack].reverse() : [...Database.listTrack];
    }

    

    static getTrackDataOfPage(page, trackPerPage) {
        const start = (page - 1) * trackPerPage;
        const end = Math.min(start + trackPerPage - 1, Database.listCode.length);

        return Database.displayListSeries.slice(start, end + 1);
    }
}
