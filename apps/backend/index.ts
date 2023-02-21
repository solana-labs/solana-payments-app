import express from 'express'
import ngrok from 'ngrok'

const app = express()

const port = process.env.PORT || '8001'

app.get('/', (req, res) => {
    res.send('Hello World My Sis')
})

app.get('/hi', (req, res) => {
    res.send('Bye My Man')
})

app.listen(port, async () => {
    // console.log(`Example app listening at http://localhost:${port}`)
    // console.log(`Server is accessible at ${url}`)
})
