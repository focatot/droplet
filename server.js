// server.js

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`OWM_HUSH: ${process.env.OWM_HUSH}, PLACES_HUSH: ${process.env.PLACES_HUSH}`);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
