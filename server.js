const express = require('express');
const db = require('./config/connection');
const routes = require("./routes")
const PORT = process.env.PORT || 3003;
const app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());

//Routes
app.use(routes);

//Start App
db.once('open', () => {
    console.log('MongoDB connection established successfully');
    app.listen(PORT, () => {
        console.log(`API server running on port ${PORT}!`);
    });
});