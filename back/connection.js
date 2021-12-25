// const mysql = require('mysql2')
// const pool = mysql.createPool({
//     host            : 'localhost',
//     user            : 'osm',
//     password        : 'osm',
//     database        : 'location'
// })
// module.exports = pool

const mysql = require('mysql2')
const pool = mysql.createPool({
    host            : 'eu-cdbr-west-02.cleardb.net',
    user            : 'b902e319564c68',
    password        : '59ece1ff',
    database        : 'heroku_0ac3a151f58ad26',
})

pool.getConnection(function(err) {
    if (err) throw err;
    console.log("Database Connected!");
  });

// Access Credentials
// sorbonne-mapping-db
// Host:        eu-cdbr-west-02.cleardb.net
// Username:	b902e319564c68
// Password:	59ece1ff (Reset)