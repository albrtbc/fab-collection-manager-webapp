document.addEventListener("DOMContentLoaded", function () {
    const searchBox = document.getElementById("searchBox");
    const searchResults = document.getElementById("searchResults");

    if (!searchBox || !searchResults) {
        console.log("Could not find search elements");
        return;
    }

    let debounce;
    searchBox.addEventListener("input", async function () {
        clearTimeout(debounce);
        debounce = setTimeout(async () => {
            const query = this.value;
            if (query.length < 1) {
                searchResults.innerHTML = ""; // Clear results if input is empty
                return;
            }

            const url = `http://localhost:5000/cards?name=${encodeURIComponent(query)}`;
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    searchResults.innerHTML = "Search error";
                    return;
                }

                const data = await res.json();
                let resultsHtml = "";
                for (const card of data) {
                    let color = card.pitch.toLowerCase(); // Convert to lowercase
                    if (color === 'yellow') {
                        color = '#DAA520';
                    }
                    resultsHtml += `<div>${card.count}x ${card.name} (<span style='color:${color};'><strong>${card.pitch}</strong></span>) :: <strong>${card.collection}</strong> collection</div>`;
                }

                searchResults.innerHTML = resultsHtml;
            } catch (err) {
                console.log("Error making the request:", err);
                searchResults.innerHTML = "Something went wrong";
            }
        }, 300); // Debounce time in milliseconds
    });
});
