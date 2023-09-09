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
                        haveList += `Tienes ${totalCards} de la carta "${card.name} (${card.pitch})" en la colección ${Object.keys(collections)[0]}.<br>`;
                    } else {
                        haveList += `Tienes ${totalCards} de la carta "${card.name} (${card.pitch})".<br>`;
                        for (let [collection, count] of Object.entries(collections)) {
                            haveList += `&emsp; - ${count} en la colección ${collection}<br>`;
                        }
                    }
                }

                if (totalCards > 0) {
                    totalHaveCards += totalCards;
                }

                if (totalCards < card.count) {
                    missingList += `Te falta(n) ${card.count - totalCards} de la carta "${card.name} (${card.pitch})".<br>`;
                    totalMissingCards += (card.count - totalCards);
                }
            })
            .catch(err => {
                console.log("Una solicitud falló", err);
            });
    });

    await Promise.allSettled(promises);

    resultsElement.innerHTML = `<h3>Cartas que tienes (${totalHaveCards}):</h3>${haveList}<h3>Cartas que te faltan (${totalMissingCards}):</h3>${missingList}`;

}

function parseDeck(text) {
    let cards = [];

    // Primero, separamos el texto en líneas
    const lines = text.split("\n");

    // Para cartas con color/pitch
    // const regexWithColor = /\((\d+)\)\s+([\w\s]+)\s+\((red|yellow|blue)\)/;
    const regexWithColor = /\((\d+)\)\s+([-\w\s]+)\s+\((red|yellow|blue)\)/;

    // Para cartas sin color/pitch (Hero, Weapons, Equipment)
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

// Antes de tu función uploadCsv() o dentro de ella, según tu diseño
function showUploadBadge(file) {
    const uploadedFileInfo = document.getElementById("uploadedFileInfo");
    if (file) {
        uploadedFileInfo.innerHTML = `Archivo subido: ${file.name}`;
        // Ocultar el texto de arrastrar y soltar
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

        uploadAlert.innerText = 'CSV subido correctamente';
        uploadAlert.classList.add('alert-success');
        uploadAlert.classList.remove('alert-danger');

        // Mostrar la alerta con transición
        uploadAlert.style.opacity = 0;
        uploadAlert.style.display = 'block';
        uploadAlert.classList.add('fade-in-out');
        uploadAlert.style.opacity = 1;

        // Desaparecer la alerta después de 3 segundos
        setTimeout(() => {
            uploadAlert.style.opacity = 0;
            setTimeout(() => {
                uploadAlert.style.display = 'none';
            }, 1000);
        }, 3000);

    } catch (error) {
        console.error('Error subiendo el CSV:', error);

        uploadAlert.innerText = 'Error subiendo el archivo';
        uploadAlert.classList.add('alert-danger');
        uploadAlert.classList.remove('alert-success');

        // Mostrar la alerta con transición
        uploadAlert.style.opacity = 0;
        uploadAlert.style.display = 'block';
        uploadAlert.classList.add('fade-in-out');
        uploadAlert.style.opacity = 1;

        // Desaparecer la alerta después de 3 segundos
        setTimeout(() => {
            uploadAlert.style.opacity = 0;
            setTimeout(() => {
                uploadAlert.style.display = 'none';
            }, 1000);
        }, 3000);
    }
}


// Función para abrir el selector de archivos
function openFilePicker() {
    document.getElementById("csvFile").click();
}

// Configurar la zona de arrastre y suelta
const dropZone = document.getElementById("dropZone");
if (dropZone) {  // Verifica si estamos en la página correcta
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

    // Abrir el selector de archivos cuando se hace clic en la zona de arrastre
    dropZone.addEventListener("click", openFilePicker);
    
    document.getElementById("csvFile").addEventListener("change", (e) => {
        showUploadBadge(e.target.files[0]);
    });
}





