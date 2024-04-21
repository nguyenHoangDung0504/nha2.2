class Track {
    constructor(code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLink) {
        Object.assign(this, { code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLink });
    }
}

class Category {
    constructor(name, quantity) {
        Object.assign(this, { name, quantity });
    }

    withView(view) {
        this.view = view;
        return this;
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

}

export { Track, Cv, Tag, Series, SearchResult };