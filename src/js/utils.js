const imagesLoaded = require('imagesloaded');
import { constants } from './store';

// Preload images
const preloadImages = (selector = 'img') => {
    return new Promise((resolve) => {
        imagesLoaded(document.querySelectorAll(selector), {background: true}, resolve);
    });
};

// Preload font
const preloadFonts = (id) => {
    return new Promise((resolve) => {
        WebFont.load({
            typekit: {
                id: id
            },
            active: resolve
        });
    });
};

const createImageSections = async function() {
    const version = Date.now();
    const res = await fetch(`/data/timeline.json?v=${version}`);
    // console.log('res', res);
    let parsed = await res.json();
    let data = parsed.data || [];
    data = data.reverse();
    data = data.filter(d => d.snippet && d.snippet.title != 'Private video');

    const main = document.querySelector('#main');
    const template = document.querySelector('#sectionTemplate');
    const sectionTotal = Math.ceil(data.length / 4);

    let len = 0;
    const sectionIds = [];
    while (len < sectionTotal) {
        const tmp = template.content.cloneNode(true);
        const tile = tmp.querySelector('.tiles');
        const tileLine = tmp.querySelector('.tiles__line');
        const tiles = Array.from(tmp.querySelectorAll('.tiles__line-img'));
        const anchors = Array.from(tmp.querySelectorAll('.tiles__line-title'));
        const id = `grid${len}`;
        sectionIds.push(id);

        tile.id = id;
        tileLine.dataset.scrollTarget = `#${id}`;
        tileLine.dataset.scrollId = id;

        for (let index = 0; index < 4; index++) {
            const offsetIndex = len * 4;
            const dataIndex = offsetIndex + index;
            const d = data[dataIndex];
            const tile = tiles[index];
            const anchor = anchors[index];
            const expandClass = 'expand';

            if (d) {
                const title = d.snippet && d.snippet.title;
                const publishedAt = new Date(d.snippet && d.snippet.publishedAt) || Date.now();
                const publishedAtMonth = publishedAt.getMonth() + 1;
                const publishedAtYear = publishedAt.getFullYear();
                const url = `https://www.youtube.com/watch?v=${ d.snippet && d.snippet.resourceId.videoId }`;
                const getThumbnail = (isDevice) => {
                    try {
                        if (isDevice)
                            return d.snippet && d.snippet.thumbnails && (d.snippet.thumbnails.high || d.snippet.thumbnails.default).url;
                        return d.snippet && d.snippet.thumbnails && (d.snippet.thumbnails.maxres || d.snippet.thumbnails.standard || d.snippet.thumbnails.default).url;
                    } catch (error) {
                        console.log('url not found', d);
                        return `https://i.ytimg.com/vi/${d.snippet.resourceId.videoId}/maxresdefault.jpg`;
                    }
                }
                const thumbnail = getThumbnail(constants.isDevice);

                anchor.title = title;
                anchor.href = url;
                anchor.text = title;

                tile.title = title;
                // tile.style.backgroundImage = `url(${d.img})`;
                // dataset.bg for lazy-load
                tile.dataset.bg = `${thumbnail}`;
                tile.dataset.loadStyle = `background-image: url(${thumbnail});`;
                tile.dataset.url = url;
                tile.dataset.date = `${publishedAtMonth < 10 ? '0' : ''}${publishedAtMonth}/${publishedAtYear}`;
                tile.addEventListener('click', (event) => {
                    if (constants.isDevice) {
                        // console.log('currentTarget', event.currentTarget);
                        // console.log('target', event.target);
                        if (event.target.tagName === 'A') return;

                        const expandTile = tiles.filter(t => t.classList.contains(expandClass))[0];
                        if (expandTile) {
                            tileLine.classList.remove(expandClass);
                            expandTile.classList.remove(expandClass);

                            const expandTileIndex = tiles.indexOf(expandTile);
                            if (expandTileIndex === index) return;
                        }

                        tileLine.classList.add(expandClass);
                        tile.classList.add(expandClass);
                    }
                    else window.open(url, '_blank');
                })
            } else {
                tile.classList.add('hide');
            }
        }

        len += 1;
        main.appendChild(tmp);
    }

    return sectionIds;
}

const createFooterSection = () => {
    const main = document.querySelector('#main');
    const tmp = document.querySelector('#footerSectionTemplate').content.cloneNode(true);
    main.appendChild(tmp);
}

const createVerticalScrollBar = () => {
    const main = document.querySelector('body');
    const bar = document.createElement('div');
    bar.className = 'vertical-bar';

    const barLabel = document.createElement('div');
    barLabel.className = 'label';
    bar.appendChild(barLabel);

    for(let i = 1; i<=12; i++) {
        let textWrapper = document.createElement('p');
        const date = `${i < 10 ? '0' : ''}${i}/2021`;
        textWrapper.id = 'p' + date.replace('/', '_');
        textWrapper.innerText = date;
        barLabel.appendChild(textWrapper);
    }

    const mascot = document.createElement('span');
    mascot.className = 'mascot';
    bar.appendChild(mascot);

    const labelPointer = document.createElement('span');
    labelPointer.className = 'pointer';
    bar.appendChild(labelPointer);

    main.appendChild(bar);
}

const setStyleProperty = (propName, value) => {
    document.documentElement.style.setProperty(propName, `${value}`);
}

export { 
    preloadImages,
    preloadFonts,
    createImageSections,
    createFooterSection,
    createVerticalScrollBar,
    setStyleProperty,
};