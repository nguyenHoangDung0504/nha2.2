import Utils from "../utils/utils.class";
import { Track, Cv, Tag, Series, SearchResult, OtherLink } from "./classes";

export class Database {
    static listTrackNewest = [];
    static listTrack = [];
    static listCode = [];
    static listCv = [];
    static listTag = [];
    static listSeries = [];

    static addTrackToDatabase(code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLink = "") {
        [cvs, tags, series, images, audios, otherLink] = [cvs, tags, series, images, audios, otherLink].map(member => Utils.standardizedTrackArrData(member));
        [cvs, tags, series] = [cvs, tags, series].map(member => member.sort());
        otherLink = otherLink.split(',').map(noteNLink => {
            const [note, link] = noteNLink.split(':').map(item => item.trim());
            return new OtherLink(note, link);
        })

        const track = new Track(code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLink);
        Database.listTrackNewest.push(track);
        Database.listTrack.push(track);
        Database.listCode.push(code);
        
        const listOfListToAddItem = [Database.listCv, Database.listTag, Database.listSeries];
        const classToCreate = [Cv, Tag, Series];
        [cvs, tags, series].forEach(member => {
            member.forEach(callBack);
        });

        function callBack(item, index) {
            const listToAddItem = listOfListToAddItem[index];
            if(item) {
                let indexOfItem = listToAddItem.findIndex(itemToFind => itemToFind.name == item);

                if(indexOfItem == -1) {
                    listToAddItem.push(new classToCreate[index](item, 1))
                } else {
                    listToAddItem[indexOfItem].count++
                }                
            }
        }
    }

    // Call when completed add data
    static buildData() {
        Database.listTrack = [...Database.listTrackNewest].sort((a, b)=>{
            return Number(b.rjCode.replace('RJ', '').replaceAll('?','')) - Number(a.rjCode.replace('RJ', '').replaceAll('?','')) 
        });
        listToAddItem.sort(byName);
        Database.listTag.sort(byName);
        Database.listSeries.sort(byName);

        function byName(a, b) {
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        }

        console.log(`Added: ${Database.listCode.length} Tracks`);
        console.log(Database);
        [Database.listTrack, Database.listCv, Database.listTag, Database.listSeries].forEach(list => {
            console.log(`Complete Build`, list);
        });
    }
}
