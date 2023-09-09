async function searchCards() {
    const deckText = document.getElementById("deckText").value;
    const cards = parseDeck(deckText);
    const resultsElement = document.getElementById("results");

    let haveList = "";
    let missingList = "";
    let totalMissingCards = 0;
    let totalHaveCards = 0;

    const promises = cards.map(card => {
        let url = `http://localhost:5000/cards?name=${card.name}`;
        if (card.pitch) {
            url += `&pitch=${encodeURIComponent(card.pitch)}`;
        }
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                let totalCards = 0;
                let collections = {};

                for (let card of data) {
                    let collection = card.collection;
                    let countInCollection = parseInt(card.count);
                    totalCards += countInCollection;

                    if (!collections[collection]) {
                        collections[collection] = 0;
                    }
                    collections[collection] += countInCollection;
                }

                if (totalCards > 0) {
                    if (Object.keys(collections).length === 1) {
                        haveList += `You have ${totalCards} of the card "${card.name} (${card.pitch})" in the ${Object.keys(collections)[0]} collection.<br>`;
                    } else {
                        haveList += `You have ${totalCards} of the card "${card.name} (${card.pitch})".<br>`;
                        for (let [collection, count] of Object.entries(collections)) {
                            haveList += `&emsp; - ${count} in the ${collection} collection<br>`;
                        }
                    }
                }

                if (totalCards > 0) {
                    totalHaveCards += totalCards;
                }

                if (totalCards < card.count) {
                    missingList += `You are missing ${card.count - totalCards} of the card "${card.name} (${card.pitch})".<br>`;
                    totalMissingCards += (card.count - totalCards);
                }
            })
            .catch(err => {
                console.log("A request failed", err);
            });
    });

    await Promise.allSettled(promises);

    resultsElement.innerHTML = `<h3>Cards you have (${totalHaveCards}):</h3>${haveList}<h3>Cards you're missing (${totalMissingCards}):</h3>${missingList}`;
}

function parseDeck(text) {
    let cards = [];
    // First, split the text into lines
    const lines = text.split("\n");

    // For cards with pitch/color
    const regexWithColor = /\((\d+)\)\s+([-\w\s]+)\s+\((red|yellow|blue)\)/;

    // For cards without pitch/color (Hero, Weapons, Equipment)
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

// Before or inside your uploadCsv() function, depending on your design
function showUploadBadge(file) {
    const uploadedFileInfo = document.getElementById("uploadedFileInfo");
    if (file) {
        uploadedFileInfo.innerHTML = `Uploaded file: ${file.name}`;
        // Hide the drag-and-drop text
        document.getElementById("dropZoneText").style.display = "none";
    }
    uploadedFileInfo.style.display = "inline";
}

// ...
async function uploadCsv() {
    const csvFile = document.getElementById('csvFile').files[0];
    const formData = new FormData();
    formData.append('file', csvFile);
    const uploadAlert = document.getElementById("uploadAlert");

    try {
        await fetch('http://localhost:5000/upload_csv', {
            method: 'POST',
            body: formData,
        });

        uploadAlert.innerText = 'CSV uploaded successfully';
        uploadAlert.classList.add('alert-success');
        uploadAlert.classList.remove('alert-danger');

        // Show the alert with a transition
        uploadAlert.style.opacity = 0;
        uploadAlert.style.display = 'block';
        uploadAlert.classList.add('fade-in-out');
        uploadAlert.style.opacity = 1;

        // Fade out the alert after 3 seconds
        setTimeout(() => {
            uploadAlert.style.opacity = 0;
            setTimeout(() => {
                uploadAlert.style.display = 'none';
            }, 1000);
        }, 3000);

    } catch (error) {
        console.error('Error uploading the CSV:', error);

        uploadAlert.innerText = 'Error uploading the file';
        uploadAlert.classList.add('alert-danger');
        uploadAlert.classList.remove('alert-success');

        // Show the alert with a transition
        uploadAlert.style.opacity = 0;
        uploadAlert.style.display = 'block';
        uploadAlert.classList.add('fade-in-out');
        uploadAlert.style.opacity = 1;

        // Fade out the alert after 3 seconds
        setTimeout(() => {
            uploadAlert.style.opacity = 0;
            setTimeout(() => {
                uploadAlert.style.display = 'none';
            }, 1000);
        }, 3000);
    }
}

// Function to open the file picker
function openFilePicker() {
    document.getElementById("csvFile").click();
}

// Set up the drag-and-drop area
const dropZone = document.getElementById("dropZone");
if (dropZone) {  // Check if we're on the correct page
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

    // Open the file picker when the drag-and-drop area is clicked
    dropZone.addEventListener("click", openFilePicker);

    document.getElementById("csvFile").addEventListener("change", (e) => {
        showUploadBadge(e.target.files[0]);
    });
}
