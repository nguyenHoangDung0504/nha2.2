class JaCrawler {
    static crawl() {
        const code = location.href.match(/\d+/)[0];
        if(Database.getTrackByIdentify(code)) {
            console.log('DUPLICATE CODE!!!');
            return;
        }
        
        const tagKeys = new Map([
            ['Student', 'School Girl'],
            ['Imouto', 'Younger Sister'],
            ['Breast Sex', 'Paizuri']
        ]);
        const blockTags = ['licking'];
        const cvKeys = new Map([
            ['Aruha Kotone', 'Kotone Akatsuki']
        ]);
        const ps = document.querySelectorAll('p');
        
        const rjCode = ps[3].textContent.split(': ')[1];
        
        const cvs = ps[2].textContent.split(': ')[1].split(',').map(cv => {
            const rs = cv.trim();
            if(!rs)
                return null;
            const testRs = cvKeys.get(rs) || Database.getCategory(Database.categoryType.CV, rs.split(' ').reverse().join(' '));
            return testRs || rs;
        }).filter((cv, index, array) => {
            if(!cv) return false;
            return array.indexOf(cv) === index;
        }).sort().join(',');

        const tags = [...document.querySelectorAll('.post-meta.post-tags a')].map(ele => ele.textContent)
        .map(tag => {
            tag = tag.trim();
            tagKeys.forEach((value, key) => {
                if(tag.toLowerCase().includes(key.toLowerCase())) {
                    tag = value;
                }
            });
            return tag;
        }).map(tag => {
            let rs = null;
            if([...tagKeys.values()].includes(tag))
                return tag;
            const searchArr = [...Database.tagMap.keys()];
            for (let i=0; i<searchArr.length; i++) {
                if(tag.toLowerCase().includes(searchArr[i])) {
                    rs = Database.tagMap.get(searchArr[i]).name;
                    break;
                }
            }
            return rs;
        }).filter((tag, index, array) => {
            if(!tag) return false;
            if(blockTags.includes(tag.toLowerCase())) return false;
            return array.indexOf(tag) === index;
        }).sort().join(',');

        console.log({ code, rjCode, cvs, tags });
        return({ code, rjCode, cvs, tags });
    }
  
    static async copy(value, timeout = 100) {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        document.body.appendChild(textarea);

        await new Promise(resolve => {
            setTimeout(()=> {
              textarea.select();
              document.execCommand('copy');
              document.body.removeChild(textarea);
              console.log('copied');
              resolve('copied');
            }, timeout)
        });        
    }
}

JaCrawler.crawl();