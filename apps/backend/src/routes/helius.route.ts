import { Router } from 'express'
import { heliusController } from '../controllers/helius.controller'

const router = Router()

router.post('/', heliusController)

export default router
