const express = require('express')
const cors = require('cors')
const route = require('./routes')
// var bodyParser = require('body-parser');

const app = express()
app.use(express.urlencoded({extended: true})); 
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

app.use(cors())
app.use('',route)

const port = process.env.PORT || 5555;

app.listen(port, () => console.log(`Listening on port ${port}`))