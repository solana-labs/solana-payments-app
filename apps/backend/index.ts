import express from 'express'

const app = express()

const port = 8000

app.get('/', (req, res) => {
    res.send('Hello World My Dude')
})

app.get('/hi', (req, res) => {
    res.send('Bye My Dude')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
