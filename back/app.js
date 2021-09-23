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

// const connection = mysql.createPool({
//     host            : 'localhost',
//     user            : 'osm',
//     password        : 'osm',
//     database        : 'location'
// })

// app.get('/cities',(req,res)=>{
//     connection.query('SELECT * from cities', (err,rows)=>{
//         if (!err) {
//             res.send(rows)
//         }
//         else{
//             console.log(err)
//         }
//     })
// })





const port = process.env.PORT || 5000;

// app.use(express.urlencoded({extended: true})); 

// app.use(express.json());

// app.use('',auth)

app.listen(port, () => console.log(`Listening on port ${port}`))