import { Router } from 'express'
import { transactionPayGetController } from '../controllers/transaction-pay-get.controller'
import { transactionPayPostController } from '../controllers/transaction-pay-post.controller'

const router = Router()

router.get('/pay', transactionPayGetController)
router.post('/pay', transactionPayPostController)

export default router
