import Utils from "../utils/utils.class.js";

class Track {
    constructor(code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLink) {
        Object.assign(this, { code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLink });
    }
}
class Category {
    constructor(name, quantity) {
        Object.assign(this, { name, quantity });
    }
}
class Cv extends Category{
    constructor(name, quantity) {
        super(name, quantity);
    }
}
class Tag extends Category{
    constructor(name, quantity) {
        super(name, quantity);
    }
}
class Series extends Category{
    constructor(name, quantity) {
        super(name, quantity);
    }
}
class SearchResult {
    constructor(type, value, keyword, code) {
        Object.assign(this, { type, value, keyword, code });
        this.displayType = Utils.convertToTitleCase(this.type);
    }
}
class OtherLink {
    constructor(note, url) {
        Object.assign(this, { note, url });
    }
}

export { Track, Cv, Tag, Series, SearchResult, OtherLink };