const mysql = require('mysql2')
const pool = mysql.createPool({
    host            : 'localhost',
    user            : 'osm',
    password        : 'osm',
    database        : 'location'
})
module.exports = pool