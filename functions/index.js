const functions = require('firebase-functions');
const express = require('express')
const app = express()
const morgan = require('morgan')
const mysql = require('mysql')
const bodyParser = require('body-parser')
var userId 

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('./public'))
app.use(morgan('short'))

function getConnection(){
    return mysql.createConnection({
        host: 'cp29-jhb.za-dns.com',
        user: 'develuti_root',
        password: 'Mok1hi9na88!@#$%',
        database: 'develuti_license',
        timezone:'uct+2'
    })
}

app.post("/users/create", (req, res) => {
    console.log("Creating new user data:")
    const username = req.body.username
    const password = req.body.password
    const mobile = req.body.mobile
    const email = req.body.email

    const createUserQuery = "insert into users (username, password, mobile, email) values (?,?,?,?)"
     getConnection().query(createUserQuery, [username, password, mobile, email],  (err, results, fields) => {
        if(err){
            console.log("Error creating user: " + err)
            res.sendStatus(500)
            return
        }
        console.log("creating new user")
        userId = results.insertId
        console.log("insert status uid: " + userId)
        // res.getHeaders.
        
    })

    res.redirect("/create_key.html")

    
} )

app.post("/keys/create",(req, res) => {
    console.log("creating new key data:")
    const accId = req.body.accId
    const accName = req.body.accName  
    const license = req.body.license
    const expiry = req.body.expiry+" 23:59:59"
    

    console.log(accId)
    console.log(userId)
    console.log(accName)
    console.log(license)
    console.log(expiry)

    console.log("user uid: " + userId)
    const createLicenseQuery = "insert into license_keys (user_uid, account_id, account_name, license, expiry_date) values (?,?,?,?,?)"
    getConnection().query(createLicenseQuery, [userId, accId, accName, license, expiry], (err, results, fields) => {
        if(err){
            console.log("Error creating key: " + err)
            return
        }
        console.log("creating new key")
        console.log("insert status uid: " + results.insertId)
        
    })

   

    res.redirect("/users")
} )

app.get("/users/:id", (req, res) => {
    console.log("getting user id: " + req.params.id)
    const connection = getConnection()
    const userId = req.params.id
    const userQuery = "select * from users where uid = ?"
    connection.query(userQuery, [userId], (err, rows, fields) => {
        if(err){
            console.log("Error for get user: " + err)
            res.sendStatus(500)
            return
        }
        console.log("users have been pulled")
        const user = rows.map((row) => {
            return {username: row.username, status: row.status, email: row.email, cellPhone: row.mobile}
        })
        res.json(user)
    })
    // res.end
})

app.get("/", (req, res) => {
    console.log("this is a get on root..")
    res.send("Helloooo there this is a test")
})

app.get("/users", (req, res) => {
    const connection = getConnection()
    const allUserQuery = "select * from users as u, license_keys as lk where u.uid = lk.user_uid"
    connection.query(allUserQuery, (err, rows, fields) => {
        if(err){
            console.log("Error for get user: " + err)
            res.sendStatus(500)
            return
        }
        console.log("users have been pulled")
        const user = rows.map((row) => {
            return {username: row.username, userStatus: row.status, email: row.email, cellPhone: row.mobile, 
                accId: row.account_id, accName: row.account_name, keyStatus: row.status, license: row.license, expiryDate: row.expiry_date}
        })
        res.json(user)
    })
})

app.get("/keys/validate/:accId/:key", (req, res) => {
    const accId = req.params.accId
    const key = req.params.key
    const connection = getConnection()
    const allUserQuery = "select * from license_keys where license = ? and account_id = ?"
    connection.query(allUserQuery, [key, accId], (err, rows, fields) => {
        if(err){
            console.log("Error for get user: " + err)
            res.sendStatus(500)
            return
        }
        console.log("validating key")
        const user = rows.map((row) => {
            return {keyStatus: row.status, license: row.license, expiryDate: row.expiry_date}
        })
        res.json(user[0])
    })
})

app.post("/keys/check", (req, res) => {
    const accId = req.body.accId
    const key = req.body.license
    console.log("getting acc id: " + accId)
    console.log("getting license: " + key)
    const connection = getConnection()
    const allUserQuery = "select count(*) as result from license_keys where license = ? and account_id = ?"
    connection.query(allUserQuery, [key, accId], (err, rows, fields) => {
        if(err){
            console.log("Error for get user: " + err)
            res.sendStatus(500)
            return
        }
        console.log("checking key")
        const user = rows.map((row) => {
            if(row.result > 0){
                return "true"
            }else{
                return "false"
            }
            // return {keyStatus: row.status, license: row.license, expiryDate: row.expiry_date}
        })
        console.log(user[0])
        res.json(user[0])
    })
})

exports.app = functions.https.onRequest(app)