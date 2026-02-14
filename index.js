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

const loadPlayerTo = ((element, name) => {
    element.querySelector('.player-name').innerText = name;
    const container = element.querySelector('.cards-container');
    container.replaceChildren(); // empty
    
    const deckData = JSON.parse(window.localStorage.getItem('featurematch-tool-json'))?.find?.((e) => (e.name === name));
    if (!deckData) {
        container.innerText = 'No deck data found';
        return;
    }
    const cardsSet = new Set();
    for (const deck of [deckData.deck, deckData.extra, deckData.side]) {
        if (!deck) continue;
        for (const subdeck of [deck.one, deck.two, deck.three]) {
            if (!subdeck) continue;
            for (const card of subdeck) {
                console.log(card, cardsSet);
                if (cardsSet.has(card)) continue;
                cardsSet.add(card);
                const elm = document.createElement('a');
                elm.target = '_blank';
                elm.href = `https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=${card}&request_locale=en`;
                elm.style.backgroundImage = `url(https://artworks-en-n.ygoresources.com/${Math.floor(card/10000)}/${Math.floor((card%10000)/100)}/${card%100}_1.png)`;
                container.appendChild(elm);
            }
        }
    }
});

document.getElementById('load-players').addEventListener('click', () => {
    const v = window.prompt('Paste the thing from Discord');
    const fields = v.split('    ');
    if (fields.length !== 5) {
        window.alert('Bad message (not 5 fields, each separated by 4 spaces)');
        return;
    }
    loadPlayerTo(document.querySelector('.player-container.blue'), fields[1]);
    loadPlayerTo(document.querySelector('.player-container.red'), fields[3]);
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
