const express = require('express');
const dotenv = require('dotenv')

const apiRoutes = require('./Routers/apiRoute');

dotenv.config({ path: './config.env' });

const app = express();

app.use('/api', apiRoutes);

const Port = process.env.PORT || 3000;

app.listen(Port, () => {
    console.log(`Server running on ${Port}... :)`)
})