const express = require('express')
const router = express.Router()
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const mysql = require('mysql2')


const connection = mysql.createConnection({
    host            : 'localhost',
    user            : 'osm',
    password        : 'osm',
    database        : 'location'
})



router.post('/register', verifyToken, (req,res)=>{
    jwt.verify(req.token,'SECRETKEY', (err,decode)=>{
        if (err) res.send({status:'403'})//res.sendStatus(403)
        else {
            let user = req.body
            bcrypt.hash(user.password, 10, function(err, hash) {
                user.password = hash
                connection.query('SELECT * FROM user WHERE email = ?', [user.email], 
                (err,result)=> {
                    if (result.length){
                        console.log(result)
                        res.send({
                            status:'409',
                            msg: 'This username is already in use!'
                        })
                    }
                    else{
                        connection.query('INSERT INTO user SET ?', user, (err, rows) => {
                            connection.release() // return the connection to connection
                            if (!err) {
                                res.send({response:`User with the email ${user.email} has been added.`})
                            } else {
                                console.log(err)
                            }
                        })
                    }
                })
            });
            decode
        }
    })
})

function verifyToken(req,res,next){
    const bearerHeader = req.headers.authorization
    if (typeof bearerHeader !== "undefined"){
        const bearerToken = bearerHeader.split(' ')[1]
        req.token = bearerToken
        next()
    }
    else {
        return res.sendStatus(403)
    }
}

router.post('/login', (req,res)=>{
    const email = req.body.email;
    const password = req.body.password
    let hash

    if (email && password) {
        connection.query('SELECT * FROM user WHERE email = ?', [email], 
        (error, result, fields)=> {
            if (result.length>0){
                console.log(result)
                hash = result[0]['password']
                bcrypt.compare(password, hash, function(err, isMatch) {
                    if (err) {
                        throw err
                    } 
                    else if (!isMatch) {
                        res.send({message:"password incorrect"})
                        console.log("Password doesn't match!")
                    } 
                    else {
                        const token = jwt.sign({
                            email:result[0]['email'],
                            role: result[0]['role']
                        },
                        'SECRETKEY', {expiresIn:'7d'}
                        )
                        res.send({token})
                        console.log(token)
                        connection.query(
                            `UPDATE user SET last_login = now() WHERE id = '${result[0].id}'`
                            );
                    }
                })
            }
            else{
                console.log("User is invalid")
                res.send('Please enter Username and Password!');
                res.end();
            }
        })
    }
})

router.get('/users', (req, res) => {
    connection.query('SELECT * from user', (err, rows) => {
        connection.release()
        if (!err) {
            res.send(rows)
        } else {
            console.log(err)
        }
    })
})

router.get('/cities',(req,res)=>{
    connection.query('SELECT * from cities', (err,rows)=>{
        if (!err) res.send(rows)
        else console.log(err)
    })
})

router.post('/new_location',(req,res)=>{
    // console.log(req.body)
    // connection.query('INSERT INTO countries SET ?', req.body, (err, rows) => {
    //     if (!err) {
    //         res.send({response:`${req.body.country} has been added.`})
    //     } else {
    //         console.log(err)
    //     }
    // })
})

router.get('/countries',(req,res) => {
    connection.query('SELECT * from countries', (err,rows) => {
        if (!err) res.send(rows)
        else console.log(err);
    })
})

// router.post('/modify', (req,res) => {
//     let item = {
//         country :req.body.country,
//         id      :req.body.id
//     }
//     connection.query(`UPDATE cities SET id_country = ${req.body.id} where country = '${req.body.country}'`)
//     res.send({'msg':'un item modifié'})
// })
module.exports = router