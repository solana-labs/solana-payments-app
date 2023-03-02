import { Router } from 'express'
import { verifyController } from '../controllers/verify.controller'

const router = Router()

router.post('/', verifyController)

export default router
