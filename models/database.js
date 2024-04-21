import Utils from "../utils/utils.class";

export class Database {
    static listTrackNewest = [];
    static listTrack = [];
    static listCode = [];
    static listCv = [];
    static listTag = [];
    static listSeries = [];

    static addTrackToDatabase(code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLink = null) {
        [cvs, tags, series, images, audios] = [cvs, tags, series, images, audios].map(member => Utils.standardizedTrackData(member));
    }
}
