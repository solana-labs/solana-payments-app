import { Router } from 'express'
import { processRefundController } from '../controllers/process-refund.controller'

const router = Router()

router.get('/', processRefundController)

export default router
