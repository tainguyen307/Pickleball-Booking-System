// src/routes/court.routes.js
import express from "express";
import courtController from "../controllers/court.controller.js";
import { globalLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

// Lấy danh sách sân (Có bộ lọc nâng cao query parameters)
router.get("/", globalLimiter, (req, res) => courtController.getCourts(req, res));

// Lấy chi tiết thông tin một cụm sân cụ thể dựa vào ID
router.get("/:id", globalLimiter, (req, res) => courtController.getCourtById(req, res));

export default router;