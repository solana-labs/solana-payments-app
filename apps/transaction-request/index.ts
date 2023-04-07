import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import payRoute from './src/routes/pay.route'
import dotenv from 'dotenv'

dotenv.config()

const port = process.env.PORT
const app = express()

app.use(bodyParser.json())
app.use(cors())

app.use('/pay', payRoute)

app.listen(port, () => {
    console.log('Now listen on port ' + port)
})
