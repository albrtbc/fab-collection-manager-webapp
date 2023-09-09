document.addEventListener("DOMContentLoaded", function() {
    const searchBox = document.getElementById("searchBox");
    const searchResults = document.getElementById("searchResults");

    searchBox.addEventListener("input", async function() {
        const query = this.value;
        if (query.length < 1) {
            searchResults.innerHTML = ""; // Clear results if input is empty
            return;
        }

        let url = `http://localhost:5000/cards?name=${encodeURIComponent(query)}`;
        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.log("Search error");
                return;
            }

            const data = await res.json();

            let resultsHtml = "";
            for (let card of data) {
                resultsHtml += `<div>${card.count}x ${card.name} (${card.pitch}) (${card.collection})</div>`;
            }

            searchResults.innerHTML = resultsHtml;
        } catch (err) {
            console.log("Error making the request:", err);
        }
    });
});
