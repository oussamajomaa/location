const express = require('express')
const cors = require('cors')
const route = require('./routes')
// const axios = require('axios').default;
var bodyParser = require('body-parser');

const app = express()

app.use(bodyParser.urlencoded({ extended: false }));
 app.use(bodyParser.json());

// const mysql = require('mysql2')

app.use(cors())
app.use('',route)

const port = process.env.PORT || 5555;

app.listen(port, () => console.log(`Listening on port ${port}`))