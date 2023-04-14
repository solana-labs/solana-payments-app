import express from 'express'
import transactionRoute from './src/routes/transaction.route'
import paymentRoute from './src/routes/process-payment.route'
import refundRoute from './src/routes/process-refund.route'
import installRoute from './src/routes/install.route'
import redirectRoute from './src/routes/redirect.route'
import helloRoute from './src/routes/hello.route'
import callbackRoute from './src/routes/callback.route'
import verifyRoute from './src/routes/verify.route'
import loginRoute from './src/routes/login.route'
import heliusRoute from './src/routes/helius.route'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'
import { PrismaClient } from '@prisma/client'

dotenv.config()
const port = process.env.PORT

const app = express()

export const BASE_URL = process.env.BASE_URL! // BAD BAD BAD

export const prisma = new PrismaClient()

app.use(bodyParser.json())
app.use(cors())

app.use('/hello', helloRoute)
app.use('/helius', heliusRoute)
app.use('/transaction', transactionRoute)
app.use('/payment', paymentRoute)
app.use('/refund', refundRoute)
app.use('/install', installRoute)
app.use('/redirect', redirectRoute)
app.use('/callback', callbackRoute)
app.use('/verify', verifyRoute)
app.use('/login', loginRoute)

app.listen(port, () => {
    console.log('Now listen on port ' + port)
})
