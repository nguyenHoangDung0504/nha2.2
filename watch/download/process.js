const urlParams = new URLSearchParams(window.location.search);
const trackKey = urlParams.get("code");
const track = Database.getTrackByIdentify(trackKey);
if(!track) {
    alert('Code not found!');
}

document.title = 'NHD ASMR - Downloading: ' + trackKey;

const data = track;
let images = [data.thumbnail], imgs = [];
const uniqueElements = data.images.filter(item => !images.includes(item));
images.push(...uniqueElements);
for (let i = 0; i < images.length; i++) {
    if (images[i].indexOf('kiko-play') == -1) {
        imgs.push(images[i]);
    }
}
images = imgs;
let audios = data.audios;

function extractNumberFromLink(link) {
    // Tách phần số từ đường link
    let startIndex = link.lastIndexOf('/') + 1;
    let endIndex = link.lastIndexOf('.');
    endIndex = (endIndex > startIndex) ? endIndex : (link.lastIndexOf('?v'));
    let number = link.substring(startIndex, endIndex);
    return number;
}

function downloadZip() {
    var zip = new JSZip();
    const filename = `${data.code} - ${data.rjCode}`;
    var folder = zip.folder(filename);

    let imageLinks = images;
    let audioLinks = audios;

    const numberOfImages = imageLinks.length;
    const numberOfAudios = audioLinks.length;
    const totalFiles = numberOfImages + numberOfAudios;

    const statusElement = document.getElementById('status');
    statusElement.innerHTML = `Processing: ${filename}.zip<br><br>
                                The file is being compressed and is ready to download immediately, this will take time, but you will no longer have to wait for downloads once the compression process is complete.<br>
                                (File đang được nén và sẵn sàng tải xuống lập tức, việc này sẽ tốn nhiều thời gian, nhưng bạn sẽ không phải chờ tải nữa khi tiến trình nén hoàn thành.)`;
    const percent = document.getElementById('percent');
    const process = document.getElementById('process');

    function updateProgress(filesDownloaded, mess) {
        let percentage = (filesDownloaded / totalFiles) * 100;
        percent.innerText = mess ? `${filesDownloaded}/${totalFiles} File has been processed - Done!` : `${filesDownloaded}/${totalFiles} File has been processed`;
        process.style.width = `${percentage}%`;
        if (mess)
            document.querySelector('body').innerHTML += `<br><a href="../watch?code=${trackId}">Go Back</a>`;
    }

    /***/

    function downloadFiles() {
        let filesDownloaded = 0;

        function downloadImage(index) {
            if (index >= imageLinks.length) {
                return Promise.resolve();
            }

            const link = imageLinks[index];
            return fetch(link)
                .then(function (res) {
                    return res.blob();
                })
                .then(function (blob) {
                    const imageNumber = extractNumberFromLink(link);
                    if (link.indexOf('.mp4') !== -1) {
                        folder.file(`${imageNumber}.mp4`, blob, { binary: true });
                    } else {
                        folder.file(`${imageNumber}.jpg`, blob, { binary: true });
                    }
                    filesDownloaded++;
                    updateProgress(filesDownloaded);
                    return downloadImage(index + 1);
                });
        }

        function downloadAudio(index) {
            if (index >= audioLinks.length) {
                return Promise.resolve();
            }

            const link = audioLinks[index];
            return fetch(link)
                .then(function (res) {
                    return res.blob();
                })
                .then(function (blob) {
                    const audioNumber = extractNumberFromLink(link);
                    if (link.indexOf('.mp4') !== -1) {
                        folder.file(`${audioNumber}.mp4`, blob, { binary: true });
                    } else {
                        folder.file(`${audioNumber}.mp3`, blob, { binary: true });
                    }
                    filesDownloaded++;
                    updateProgress(filesDownloaded);
                    return downloadAudio(index + 1);
                });
        }

        downloadImage(0)
            .then(function () {
                return downloadAudio(0);
            })
            .then(function () {
                zip.generateAsync({ type: 'blob' }).then(function (content) {
                    saveAs(content, filename);
                    updateProgress(filesDownloaded, 'done');
                });
            });
    }
    downloadFiles();
}