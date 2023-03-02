import { Router } from 'express'
import { processPaymentController } from '../controllers/process-payment.controller'

const router = Router()

router.get('/', processPaymentController)

export default router
