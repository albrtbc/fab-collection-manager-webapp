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
    const deckText = document.getElementById("deckText").value;
    const cards = parseDeck(deckText);

    let haveList = [];
    let missingList = [];
    let totalMissingCards = 0;
    let totalHaveCards = 0;

    const promises = cards.map(async (card) => {
        try {
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
        const pitchOrder = ['Red', 'Yellow', 'Blue'];

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
    const urlParams = new URLSearchParams({name: card.name, pitch: card.pitch || ''});
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

    let collections = {};
    console.log(data);
    for (let cardData of data) {
        let collection = cardData.collection;
        let countInCollection = parseInt(cardData.count, 10);
        totalHave += countInCollection;

        if (!collections[collection]) {
            collections[collection] = 0;
        }
        collections[collection] += countInCollection;
    }

    const actualColor = card.pitch === 'yellow' ? '#dac720' : card.pitch; // Nuevo: elige un amarillo más oscuro si el pitch es "yellow"

    const coloredPitch = `<span style='color:${actualColor};'>${card.pitch}</span>`; // Utiliza 'actualColor' en lugar de 'card.pitch'
    // const coloredPitch = `<span style='color:${card.pitch};'>${card.pitch}</span>`;  // Línea nueva

    let displayPitch = card.pitch === 'N/A' ? '' : ` (${coloredPitch})`;
    if (card.pitch === 'yellow') {
        displayPitch = ` (<span style='color:#DAA520;'>${card.pitch}</span>)`;
    }

    if (totalHave > 0) {
        if (Object.keys(collections).length === 1) {
            haveText = `You have <strong>${totalHave}</strong> of the card "<strong>${card.name}${displayPitch}</strong>" in the <strong>${Object.keys(collections)[0]}</strong> collection.<br>`;
            // haveText = `You have <strong>${totalHave}</strong> of the card "<strong>${card.name} (${coloredPitch})</strong>" in the <strong>${Object.keys(collections)[0]}</strong> collection.<br>`;
        } else {
            haveText = `You have <strong>${totalHave}</strong> of the card "<strong>${card.name}${displayPitch}</strong>".<br>`;
            for (let [collection, count] of Object.entries(collections)) {
                haveText += `&emsp; - ${count} in the <strong>${collection}</strong> collection<br>`;
            }
        }
    }

    if (totalHave < card.count) {
        missingText = `You are missing <strong>${card.count - totalHave}</strong> of the card "<strong>${card.name}${displayPitch}</strong>".<br>`;
        totalMissing = card.count - totalHave;
    }

    return {haveText, missingText, totalMissing, totalHave};
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
            cards.push({count, name, pitch});
            continue;
        }

        match = regexNoColor.exec(line);
        if (match) {
            const [, type, names] = match;
            const nameArray = names.split(",");

            for (const name of nameArray) {
                cards.push({count: 1, name: name.trim(), pitch: "N/A"});
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
