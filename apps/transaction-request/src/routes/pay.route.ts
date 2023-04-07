import { Router } from 'express'
import { payController } from '../controllers/pay.controller'

const router = Router()

router.get('/', payController)

export default router
