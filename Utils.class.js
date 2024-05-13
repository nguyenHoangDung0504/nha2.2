'use strict';

class Utils {
    static getGroupOfPagination(currentPage, pagePerGroup, limitPage) {
        pagePerGroup = pagePerGroup > limitPage ? limitPage : pagePerGroup;

        // Special case 1
        if (pagePerGroup === 2) {
            if (currentPage === 1) {
                return [1, 2];
            } else if (currentPage === limitPage) {
                return [limitPage - 1, limitPage];
            }
        }

        // Special case 2
        if (currentPage === 1) {
            const endPage = Math.min(limitPage, currentPage + pagePerGroup - 1);
            return Array.from({ length: endPage }, (_, i) => i + 1);
        } else if (currentPage === limitPage) {
            const startPage = Math.max(1, currentPage - pagePerGroup + 1);
            return Array.from({ length: pagePerGroup }, (_, i) => startPage + i);
        }

        // General cases
        const halfGroupSize = Math.floor(pagePerGroup / 2);
        let startPage = currentPage - halfGroupSize;
        let endPage = currentPage + halfGroupSize;

        // Check and adjust start page and end page if they exceed the limit
        if (startPage < 1) {
            const adjustment = 1 - startPage;
            startPage += adjustment;
            endPage += adjustment;
        }
        if (endPage > limitPage) {
            const adjustment = endPage - limitPage;
            endPage -= adjustment;
            startPage -= adjustment;
            if (startPage < 1) {
                startPage = 1;
            }
        }

        return Array.from({ length: pagePerGroup }, (_, i) => startPage + i);
    }
    static addQueryToUrl(key, value) {
        let currentLink = window.location.href;
        let url = new URL(currentLink);
        let queryParams = url.searchParams;
        
        value = encodeURIComponent(value);

        if (queryParams.has(key)) {
            queryParams.set(key, value);
        } else {
            queryParams.append(key, value);
        }

        return url.toString();
    }
    static getFileNameFromUrl(url) {
        return url.slice(url.lastIndexOf('/')+1, url.lastIndexOf('?'));
    }
    static shuffleArray(array) {
        let currentIndex = array.length;
        let temporaryValue, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }
    static highlight(text, highlightValue) {
        let regexp = new RegExp(highlightValue, "i");
        return text.toString().replace(regexp, `<span class="highlight">$&</span>`);
    }
    static removeHighlight(text) {
        let regex = /<span class="highlight">([\s\S]*?)<\/span>/gi;
        return text.toString().replace(regex, "$1");
    }
    static convertToTitleCase(str) {
        let formattedStr = str.replace(/([A-Z])/g, " $1");

        formattedStr = formattedStr.replace(/([a-z])([A-Z])/g, "$1 $2");
        formattedStr = formattedStr.replace(/\b\w/g, (match) =>
            match.toUpperCase()
        );

        return formattedStr;
    }
    static standardizedTrackArrData(str) {
        return str.split(",")
            .filter((subStr) => subStr)
            .map((subStr) => 
                subStr.trim()
                .replaceAll("”", '"')
                .replaceAll("“", '"')
                .replaceAll('’', "'")
            );
    }
    static filterUniqueObjects(arr) {
        const uniqueObjects = [];
        const set = new Set();
        
        arr.forEach(obj => {
            const stringified = JSON.stringify(obj);
            if (!set.has(stringified)) {
                set.add(stringified);
                uniqueObjects.push(obj);
            }
        });
        
        return uniqueObjects;
    }
    static memoize(func) {
        const cache = {};
        return function(...args) {
            const key = JSON.stringify(args);
            if (!(key in cache)) {
                cache[key] = func.apply(this, args);
                if(Config.log)
                    console.log(`%cCached result of: ${func.name}(${args.join(', ')})`, 'background: #222; color: #00BFFF; padding: 5px;');
            }
            return cache[key];
        };
    }// Apply cache for functions
    static memoizeGetAndSearchMethods(...targets) {
        targets.forEach(target => {
            const methodNames = Object.getOwnPropertyNames(target).filter(name => 
                ['get', 'search'].some(keyword => name.includes(keyword))
                && (typeof target[name]) === 'function'
            );
            methodNames.forEach(methodName => {
                target[methodName] = Utils.memoize(target[methodName]);
            });
        });
    }// Apply cache for all function have 'get' or 'search'

    //Sort functions
        static byName = (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        static byQuantity = (a, b) => a.quantity - b.quantity;
        static sortSuggestionFn = (a, b) => {
            const typeOrder = ["code", "rjCode", "cv", "tag", "series", "engName", "japName"];
            const keywordIndexA = a.value.toString().toLowerCase().indexOf(a.keyword);
            const keywordIndexB = b.value.toString().toLowerCase().indexOf(b.keyword);
            if (keywordIndexA !== keywordIndexB) {
                return keywordIndexA - keywordIndexB;
            }
            const typeComparison = typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
            if (typeComparison !== 0) {
                return typeComparison;
            }
            return a.value.toString().localeCompare(b.value.toString());
        }
}