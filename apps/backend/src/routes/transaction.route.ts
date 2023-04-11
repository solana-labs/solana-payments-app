import { Router } from 'express'
import { transactionPayGetController } from '../controllers/pay.controller'

const router = Router()

router.get('/pay', transactionPayGetController)

export default router
