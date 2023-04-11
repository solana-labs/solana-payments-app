import { Router } from 'express'
import { payController } from '../controllers/pay.controller'

const router = Router()

router.post('/', payController)

export default router
