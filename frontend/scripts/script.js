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

    let haveList = "";
    let missingList = "";
    let totalMissingCards = 0;
    let totalHaveCards = 0;

    const promises = cards.map(async (card) => {
        try {
            const { count, name, pitch } = card;
            const url = `${BASE_URL}/cards?name=${name}&pitch=${encodeURIComponent(pitch || '')}`;
            const response = await fetch(url);
            const data = await response.json();

            // Add additional validations for data here

            const { haveText, missingText, totalMissing, totalHave } = handleCardData(data, card);
            haveList += haveText;
            missingList += missingText;
            totalMissingCards += totalMissing;
            totalHaveCards += totalHave;

        } catch (err) {
            console.log("A request failed", err);
        }
    });

    await Promise.allSettled(promises);

    const resultsElement = document.getElementById("results");
    resultsElement.innerHTML = `<h3>Cards you have (${totalHaveCards}):</h3>${haveList}<h3>Cards you're missing (${totalMissingCards}):</h3>${missingList}`;
}

function handleCardData(data, card) {
    let haveText = "";
    let missingText = "";
    let totalMissing = 0;
    let totalHave = 0;

    let collections = {};
    for (let cardData of data) {
        let collection = cardData.collection;
        let countInCollection = parseInt(cardData.count, 10);
        totalHave += countInCollection;

        if (!collections[collection]) {
            collections[collection] = 0;
        }
        collections[collection] += countInCollection;
    }

    if (totalHave > 0) {
        if (Object.keys(collections).length === 1) {
            haveText = `You have <strong>${totalHave}</strong> of the card "<strong>${card.name} (${card.pitch})</strong>" in the <strong>${Object.keys(collections)[0]}</strong> collection.<br>`;
        } else {
            haveText = `You have <strong>${totalHave}</strong> of the card "<strong>${card.name} (${card.pitch})</strong>".<br>`;
            for (let [collection, count] of Object.entries(collections)) {
                haveText += `&emsp; - ${count} in the <strong>${collection}</strong> collection<br>`;
            }
        }
    }

    if (totalHave < card.count) {
        missingText = `You are missing <strong>${card.count - totalHave}</strong> of the card "<strong>${card.name} (${card.pitch})</strong>".<br>`;
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
            const nameArray = names.split(",");

            for (const name of nameArray) {
                cards.push({ count: 1, name: name.trim(), pitch: "N/A" });
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
