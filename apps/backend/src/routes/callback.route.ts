import { Router } from 'express'
import { callbackController } from '../controllers/callback.controller'

const router = Router()

router.get('/', callbackController)

export default router
