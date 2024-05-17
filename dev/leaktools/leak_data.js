const scriptFiles = [
    'https://nhdasmr-v2-1.glitch.me/utils/utils.js',
    'https://nhdasmr-v2-1.glitch.me/model/classes.js',
    'https://nhdasmr-v2-1.glitch.me/model/database/build-database.js'
];

function fetchDatabase(scriptFiles, callback) {
    const fetchPromises = scriptFiles.map(scriptFile => fetch(scriptFile));

    return Promise.all(fetchPromises)
        .then(responses => Promise.all(responses.map(response => response.text())))
        .then(scripts => {
            scripts.forEach(script => {
                eval(script);
            });

            // Gọi callback sau khi tất cả các file script đã chạy xong
            return callback();
        })
        .catch(error => {
            console.error('Đã xảy ra lỗi khi fetch hoặc chạy script:', error);
        });
}

function generateCode() {
    let series = '';
    function leakData() {
        let codes = window.database.listCode;
        function getTagArr() {
            let arr_tags = [];
            let arr_series = [];
            window.database.listTag.forEach((tagObj) => { arr_tags.push(tagObj.name) });
            window.database.listSeries.forEach((seriesObj) => { arr_series.push(seriesObj.name) });
            let tags = document.querySelectorAll('.post-meta.post-tags a');
            let tags_after = [];
            for (let i = 0; i < tags.length; i++) {
                if (tags[i].innerText.indexOf('Student') != -1) {
                    tags_after.push('School Girl');
                    continue;
                }
                if (tags[i].innerText.indexOf('Imouto') != -1) {
                    tags_after.push('Sister');
                    continue;
                }
                if (tags[i].innerText.indexOf('Breast Sex') != -1) {
                    tags_after.push('Paizuri');
                    continue;
                }
                for (let j = 0; j < arr_tags.length; j++) {
                    if (tags[i].innerText.indexOf(arr_tags[j]) != -1 && tags_after.indexOf(arr_tags[j]) == -1) {
                        tags_after.push(arr_tags[j]);
                    }
                }
                // arr_series.forEach((s)=>{
                //   if(s.includes(tags[i].innerText)){
                //     series = s;
                //   }
                // });
            }
            console.log(tags_after.sort());
            return tags_after.filter(it => it != 'Licking');
        }

        function getData() {
            let ps = document.querySelectorAll('p');
            let data = {
                japName: ps[1].textContent,
                cvs: ps[2].textContent.split(': ')[1].replace('Aruha Kotone', 'Kotone Akatsuki'),
                rjCode: ps[3].textContent.split(': ')[1]
            }
            console.table(data);
            return data;
        }

        function generateUploadCode() {
            let data = getData();
            if (codes.indexOf(Number(location.href.match(/\d+/)[0])) != -1) {
                alert('Trùng code!');
                return null;
            }
            let str = `addTrack(${location.href.match(/\d+/)[0]}, "${data.rjCode}", "${data.cvs.replaceAll(', ', ',')}", "${getTagArr().join(',')}", "${series}", "engName", "${data.japName}", t0i0a);`;
            return str;
        }
        return generateUploadCode();
    };

    return leakData();
}

fetchDatabase(scriptFiles, generateCode)
    .then(result => {
        const textarea = document.createElement('textarea');
        textarea.value = result;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    })
    .catch(error => {
        console.error('Đã xảy ra lỗi:', error);
    });