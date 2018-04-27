const express = require('express')
const app = express()
const port = 8888
const bodyParser = require('body-parser')
const path = require('path')

// database connection pool
const { Pool } = require('pg')
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'admin',
    port: 5432,
})

// handling error on idle client
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

// send the login page html
const getLoginPage = (req, res) => {
    console.log('login page request recived')
    res.sendFile(path.join(__dirname + '/static/index.html'))
}

// send the dashboard html
const getDashboardPage = (req, res) => {
    console.log('dash board request recived')
    res.sendFile(path.join(__dirname + '/static/dashboard.html'))
}

// when access an unknown route
const pageNotFound = (req, res) => {
    console.log('404: page not found')
    res.status(404).send('page not found')
}

// verify login info with database
const verify = async (req, res, next) => {
    console.log('verification info recived')
    console.log(`Your user name is: ${req.body.usr_id}`)
    console.log(`Your password is:  ${req.body.psw}`)

    pool.connect((err, client, done) => {
    if (err) throw err
    client.query('SELECT psw FROM usr_info WHERE usr_id = $1', [req.body.usr_id], (err, result) => {
            done()
            if (err) {
                console.log(err.stack)
                res.redirect('../')
            } else {
                if (result.rows.length == 0) {
                    res.redirect('../')
                } else {
                    if (result.rows[0].psw == req.body.psw) {
                        res.redirect('../dashboard')
                    } else {
                        res.redirect('../')
                    }
                }
            }
        })
    })
}

// call back function for server connection
const serverConnectionCB = (res, req) => {
    console.log(`server connection extablished, listening on port: ${port}`)
}

app.get('/', getLoginPage)
app.get('/dashboard', getDashboardPage)
app.get('/*', pageNotFound)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.post('/verify', verify)

app.listen(port, serverConnectionCB)

