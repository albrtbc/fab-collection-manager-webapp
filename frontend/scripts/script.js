// Base URL Configuration
const BASE_URL = 'http://localhost:5000';

// Function to handle alerts
function showAlert(elementId, message, success = true) {
    const alertElement = document.getElementById(elementId);
    alertElement.innerText = message;
    alertElement.classList.add(success ? 'alert-success' : 'alert-danger');
    alertElement.classList.remove(success ? 'alert-danger' : 'alert-success');

    // Transitions
    alertElement.style.opacity = 0;
    alertElement.style.display = 'block';
    alertElement.classList.add('fade-in-out');
    alertElement.style.opacity = 1;

    // Fade out after 3 seconds
    setTimeout(() => {
        alertElement.style.opacity = 0;
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 1000);
    }, 3000);
}

async function searchCards() {
    const showProxies = document.getElementById("showProxies").value;
    const deckText = document.getElementById("deckText").value;
    const cards = parseDeck(deckText);

    let haveList = [];
    let missingList = [];
    let totalMissingCards = 0;
    let totalHaveCards = 0;

    const promises = cards.map(async (card) => {
        try {
            card.showProxies = showProxies;
            const data = await fetchCardData(card);
            const { haveText, missingText, totalMissing, totalHave } = handleCardData(data, card);

            if (haveText) {
                haveList.push({
                    count: totalHave,
                    name: card.name,
                    pitch: card.pitch,
                    html: haveText
                });
            }
            if (missingText) {
                missingList.push({
                    count: totalMissing,
                    name: card.name,
                    pitch: card.pitch,
                    html: missingText
                });
            }

            totalMissingCards += totalMissing;
            totalHaveCards += totalHave;

        } catch (err) {
            handleError(err);
        }
    });

    await Promise.allSettled(promises);

    const sortFunction = (a, b) => {
        const pitchOrder = ['red', 'yellow', 'blue'];

        if (a.pitch === 'N/A' && b.pitch !== 'N/A') {
            return -1;
        }
        if (a.pitch !== 'N/A' && b.pitch === 'N/A') {
            return 1;
        }
        if (a.pitch === b.pitch) {
            return a.name.localeCompare(b.name);
        }

        return pitchOrder.indexOf(a.pitch) - pitchOrder.indexOf(b.pitch);
    };

    haveList.sort(sortFunction);
    missingList.sort(sortFunction);

    const haveListHTML = generateHTML(haveList);
    const missingListHTML = generateHTML(missingList);

    const resultsElement = document.getElementById("results");
    resultsElement.innerHTML = `<h3>Cards you have (${totalHaveCards}):</h3>${haveListHTML}<h3>Cards you're missing (${totalMissingCards}):</h3>${missingListHTML}`;
}

async function fetchCardData(card) {
    const urlParams = new URLSearchParams({ name: card.name, pitch: card.pitch || '', showProxies: card.showProxies || '' });
    const url = `${BASE_URL}/cards?${urlParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json();
}

function handleError(err) {
    console.log("A request failed", err);
    // Show an alert or some feedback to the user
}

function generateHTML(list, type) {
    return list.map(card => card.html).join('');
}

function handleCardData(data, card) {
    let haveText = "";
    let missingText = "";
    let totalMissing = 0;
    let totalHave = 0;

    let collections = new Map();

    for (let cardData of data) {
        let collectionName = cardData.collection;
        let isProxy = cardData.isproxy === 'TRUE' ? 'Proxy' : 'Original';
        let countInCollection = parseInt(cardData.count, 10);
        totalHave += countInCollection;

        let collectionKey = `${collectionName}::${isProxy}`;

        if (!collections.has(collectionKey)) {
            collections.set(collectionKey, 0);
        }
        
        collections.set(collectionKey, collections.get(collectionKey) + countInCollection);
    }

    const actualColor = card.pitch === 'yellow' ? '#dac720' : card.pitch;
    const coloredPitch = `<span style='color:${actualColor};'>${card.pitch}</span>`;
    let displayPitch = card.pitch === 'N/A' ? '' : ` ${coloredPitch}`;

    if (card.pitch === 'yellow') {
        displayPitch = ` <span style='color:#DAA520;'>${card.pitch}</span>`;
    }

    if (totalHave > 0) {
        if (collections.size === 1) {
            const [collectionKey, count] = collections.entries().next().value;
            const [collectionName, isProxyText] = collectionKey.split('::');
            const listGroupItemClass = isProxyText === 'Proxy' ? 'list-group-item-warning' : 'list-group-item-success';
            haveText = `<li class="list-group-item ${listGroupItemClass}">You have <strong>${totalHave}</strong> of the card "<strong>${card.name}${displayPitch}</strong>" in the <strong>${collectionName}</strong> collection</li>`;
        } else {
            haveText += `<li class="list-group-item list-group-item-success">You have <strong>${totalHave}</strong> of the card "<strong>${card.name}${displayPitch}</strong>"<br>`;

            haveText += `<ul class="list-group w-100">`; // Lista interior para ocupar todo el espacio
            for (let [collectionKey, count] of collections) {
                const [collectionName, isProxyText] = collectionKey.split('::');
                const listGroupItemClass = isProxyText === 'Proxy' ? 'list-group-item-warning' : 'list-group-item-success';
                haveText += `<li class="list-group-item ${listGroupItemClass} w-100">${count} in the <strong>${collectionName}</strong> collection</li>`;
            }
            
            haveText += `</ul></li>`;
        }
    }

    if (totalHave < card.count) {
        missingText = `<li class="list-group-item list-group-item-danger">${card.count - totalHave} <strong>${card.name}${displayPitch}</strong></li>`;
        totalMissing = card.count - totalHave;
    }

    return { haveText, missingText, totalMissing, totalHave };
}


function parseDeck(text) {
    let cards = [];
    const lines = text.split("\n");
    const regexWithColor = /\((\d+)\)\s+([-\w\s]+)\s+\((red|yellow|blue)\)/;
    const regexNoColor = /(Hero|Weapons|Equipment):\s+(.+)/;

    for (let line of lines) {
        let match = regexWithColor.exec(line);
        if (match) {
            const [, count, name, pitch] = match;
            cards.push({ count, name, pitch });
            continue;
        }

        match = regexNoColor.exec(line);
        if (match) {
            const [, type, names] = match;

            // Si el tipo es Hero, lo consideramos una única carta aunque tenga comas
            if (type === 'Hero') {
                cards.push({ count: 1, name: names.trim(), pitch: "N/A" });
            } else {
                const nameArray = names.split(",");
                for (const name of nameArray) {
                    cards.push({ count: 1, name: name.trim(), pitch: "N/A" });
                }
            }
        }
    }

    return cards;
}

function showUploadBadge(file) {
    const uploadedFileInfo = document.getElementById("uploadedFileInfo");
    if (file) {
        uploadedFileInfo.innerHTML = `Uploaded file: ${file.name}`;
        document.getElementById("dropZoneText").style.display = "none";
    }
    uploadedFileInfo.style.display = "inline";
}

async function uploadCsv() {
    try {
        const csvFile = document.getElementById('csvFile').files[0];
        const formData = new FormData();
        formData.append('file', csvFile);

        await fetch(`${BASE_URL}/upload_csv`, {
            method: 'POST',
            body: formData,
        });

        showAlert("uploadAlert", 'CSV uploaded successfully');

    } catch (error) {
        console.error('Error uploading the CSV:', error);
        showAlert("uploadAlert", 'Error uploading the file', false);
    }
}

// Function to open the file picker
function openFilePicker() {
    document.getElementById("csvFile").click();
}

// Set up the drag-and-drop area
const dropZone = document.getElementById("dropZone");
if (dropZone) {
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("drop-zone--over");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("drop-zone--over");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("drop-zone--over");

        const file = e.dataTransfer.files[0];
        document.getElementById("csvFile").files = e.dataTransfer.files;
        showUploadBadge(file);
    });

    dropZone.addEventListener("click", openFilePicker);

    document.getElementById("csvFile").addEventListener("change", (e) => {
        showUploadBadge(e.target.files[0]);
    });
}
