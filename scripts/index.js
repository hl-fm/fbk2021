const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const myEnv = require('dotenv').config();

for (const k in myEnv) {
    process.env[k] = myEnv[k];
}
const {
    PLAYLIST_ID,
    GOOGLE_API_KEY,
    FBK_PLAYLIST_ID
} = process.env;

const maxResults = 50;

async function fetchPlayListItems(pageToken) {
    let url = `https://www.googleapis.com/youtube/v3/playlistItems`;
    url += '?key=' + GOOGLE_API_KEY;
    url += '&part=snippet';
    url += '&playlistId=' + FBK_PLAYLIST_ID;
    url += '&maxResults=' + maxResults;
    if (pageToken) {
        url += '&pageToken=' + pageToken;
    }
    console.log('calling', url);
    const res = await fetch(url);
    return res.json();
}

async function init() {
    const currentDataStr = fs.readFileSync(
        path.join(__dirname, '../data/timeline.json'),
        'utf8'
    );
    const currentData = JSON.parse(currentDataStr).data;
    const latestPublishedAt = currentData.length > 0 ? new Date(currentData[0].snippet.publishedAt) : Date.now();
    console.log('currentData length', currentData.length);
    // console.log('latestPublishedAt', latestPublishedAt);

    let storeData = [];
    let nextPageToken;
    do {
        console.log(`---`);
        const data = await fetchPlayListItems(nextPageToken);
        console.log('pageInfo:', data.pageInfo);
        console.log('nextPageToken:', data.nextPageToken);

        const items = data.items || [];
        const filterData = currentData.length > 0 ? items.filter(item => {
            const publishedDate = new Date(item.snippet.publishedAt);
            // console.log(item.snippet.title, publishedDate);
            return publishedDate > latestPublishedAt;
        }) : items;
        // console.log(items);
        // console.log(filterData);

        storeData = [...storeData, ...filterData];
        // remove private channel info
        storeData = storeData.map(d => {
            delete d.snippet.channelTitle;
            delete d.snippet.playlistId;
            delete d.snippet.videoOwnerChannelTitle;
            delete d.snippet.videoOwnerChannelId;
            return d;
        });
        // continue to get data while there have more video published after latestPublishedAt
        if (items.length === filterData.length) nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    if (storeData.length === 0) return;

    // storeData.forEach(d => {
    //     console.log(d.snippet.title, d.snippet.publishedAt);
    // });

    storeData = [...storeData, ...currentData];
    console.log('new length', storeData.length);

    fs.writeFile(
        path.join(__dirname, '../data/timeline.json'),
        JSON.stringify({data: storeData}, null, '\t'),
        function (err) {
            if (err) return console.log(err);
            console.log('> timeline.json');
        }
    );
}

init();

