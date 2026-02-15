document.getElementById('load-json').addEventListener('click', () => {
    document.getElementById('select-file').click();
});

document.getElementById('select-file').addEventListener('change', function() {
    if (!this.files.length) return;
    const reader = new FileReader();
    reader.fileName = this.files[0].name;
    reader.addEventListener('load',() => {
        window.localStorage.setItem('featurematch-tool-json', reader.result);
        document.getElementById('status').innerText = 'JSON load OK';
    });
    reader.readAsText(this.files[0]);
    this.value = '';
});

if (window.localStorage.getItem('featurematch-tool-json') !== null) {
    document.getElementById('status').innerText = 'JSON load from cache OK';
}

const findDeckData = ((name) => {
    const deckData = JSON.parse(window.localStorage.getItem('featurematch-tool-json'));
    if (!deckData) return null;
    const exactMatch = deckData.find((e) => (e.name.trim().toLowerCase() === name.toLowerCase()));
    if (exactMatch) return exactMatch;
    const parts = name.toLowerCase().split(' ');
    const roughMatch = deckData.find((e) => {
        const itParts = e.name.trim().toLowerCase().split(' ');
        return parts.every((s) => itParts.includes(s));
    });
    if (roughMatch) return roughMatch;
    if (name.startsWith('vs ')) return findDeckData(name.substr(3));
    return null;
});

const loadPlayerTo = ((element, name) => {
    element.querySelector('.player-name').innerText = name;
    const container = element.querySelector('.cards-container');
    container.replaceChildren(); // empty
    
    const deckData = findDeckData(name);
    if (!deckData) {
        container.innerText = 'No deck data found';
        return;
    }
    element.querySelector('.player-name').innerText = deckData.name;
    const cardsSet = new Set();
    for (const deck of [deckData.deck, deckData.extra, deckData.side]) {
        if (!deck) continue;
        for (const subdeck of [deck.one, deck.two, deck.three]) {
            if (!subdeck) continue;
            for (const card of subdeck) {
                if (cardsSet.has(card)) continue;
                cardsSet.add(card);
                const elm = document.createElement('a');
                elm.target = '_blank';
                elm.href = `https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=${card}&request_locale=en`;
                const imagePath = `${Math.floor(card/10000)}/${Math.floor((card%10000)/100)}/${card%100}_1.png`;
                elm.style.backgroundImage = `image-set(url(https://artworks-en-db.ygoresources.com/${imagePath}) 1x, url(https://artworks-en-n.ygoresources.com/${imagePath}) 2x)`;
                container.appendChild(elm);
            }
        }
    }
});

document.getElementById('load-players').addEventListener('click', async () => {
    let v = null;
    try {
        v = await navigator.clipboard.readText();
    } catch (e) {}
    if (v === null) v = window.prompt('Paste the thing from Discord');
    if (!v) return;
    const fields = v.split('    ');
    if (fields.length !== 5) {
        window.alert('Bad message (not 5 fields, each separated by 4 spaces)');
        return;
    }
    loadPlayerTo(document.querySelector('.player-container.blue'), fields[1].trim());
    loadPlayerTo(document.querySelector('.player-container.red'), fields[3].trim());
    document.getElementById('status2').innerText = `Table ${fields[0]} loaded`;
});

document.getElementById('left-right').addEventListener('click', () => {
    const blueContainer = document.querySelector('.player-container.blue');
    const redContainer = document.querySelector('.player-container.red');
    const blueChildren = Array.from(blueContainer.children);
    blueContainer.replaceChildren(...(redContainer.children));
    redContainer.replaceChildren(...blueChildren);
    
    for (const ctr of [blueContainer, redContainer]) {
        for (const cls of ['red','blue']) {
            ctr.classList.toggle(cls);
        }
    }
});
