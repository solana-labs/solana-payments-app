"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pay_controller_1 = require("../controllers/pay.controller");
const router = (0, express_1.Router)();
router.post('/', pay_controller_1.payController);
exports.default = router;
