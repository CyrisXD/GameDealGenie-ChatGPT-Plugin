const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

const HOST_URL = "https://cheapshark.com";

// Enable CORS from chat.openai.com
app.use(cors({
    origin: 'https://chat.openai.com'
}));

// Add a public directory
app.use(express.static('public'));

//==============================================
// Function: Deal Query String Builder 
//==============================================
function buildDealQueryString(req) {
    const {
        storeID,
        pageNumber = 0,
        pageSize = 5,
        sortBy = 'Deal Rating',
        desc = 0,
        lowerPrice = 0,
        upperPrice,
        metacritic,
        steamRating,
        steamAppID,
        title,
        exact = 0,
        AAA = 0,
        steamworks = 0,
        onSale = 0,
        output
    } = req.query;

    const queryParams = {
        storeID,
        pageNumber,
        pageSize,
        sortBy,
        desc,
        lowerPrice,
        upperPrice,
        metacritic,
        steamRating,
        steamAppID,
        title,
        exact,
        AAA,
        steamworks,
        onSale,
        output
    };

    Object.keys(queryParams).forEach(key => queryParams[key] === undefined && delete queryParams[key]);

    const queryString = Object.keys(queryParams)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
        .join('&');

    return queryString;
}


//==============================================
// Route: Get all deals
//==============================================
app.get('/deals', async (req, res) => {

    let stores = await axios.get(
        `${HOST_URL}/api/1.0/stores`
    );

    console.log(HOST_URL + "/api/1.0/deals?" + buildDealQueryString(req))

    let response = await axios.get(
        HOST_URL + "/api/1.0/deals?" + buildDealQueryString(req)
    );

    // replace store id with store name
    response.data.forEach((deal) => {
        let store = stores.data.find((store) => store.storeID === deal.storeID);
        deal.storeName = store.storeName;
    });

    res.json(response.data);
});

//==============================================
// Route: Get store IDs
//==============================================
app.get('/getstoreids', async (req, res) => {
    let response = await axios.get(
        `${HOST_URL}/api/1.0/stores`
    );
    res.json(response.data);
});

//================================================
// Route: Get currency exchange rates
//================================================
app.get('/getcurrencyrates', async (req, res) => {
    let response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/usd`
    );
    res.json(response.data);
});

//================================================
// Route: Serve Legal Page
//================================================
app.get('/legal', (req, res) => {
    res.sendFile(__dirname + '/public/legal.html');
});

//================================================
// Start the server and listen on port 3000
//================================================
app.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on port 3000');
});
