// src/routes/admin.routes.js
import express from "express";
import adminController from "../controllers/admin.controller.js";
import { verifyToken, requireAdmin } from "../middlewares/auth.middleware.js";
import { globalLimiter } from "../middlewares/rateLimiter.middleware.js";
import { uploadCourtCloud } from "../config/cloudinary.js";

const router = express.Router();

// 🛡️ Tất cả route admin đều yêu cầu: đăng nhập + quyền ADMIN
router.use(globalLimiter, verifyToken, requireAdmin);

// ======================== COURTS ========================
router.get("/courts", adminController.getCourts);
router.get("/courts/:id", adminController.getCourtById);
router.post("/courts", uploadCourtCloud.array("images", 10), adminController.createCourt);
router.put("/courts/:id", uploadCourtCloud.array("images", 10), adminController.updateCourt);
router.delete("/courts/:id", adminController.deleteCourt);
router.put("/courts/:id/block", adminController.blockCourt);

// ======================== BOOKINGS ========================
router.get("/bookings", adminController.getAllBookings);
router.put("/bookings/:id/confirm", adminController.confirmBooking);
router.put("/bookings/:id/cancel", adminController.cancelBooking);

// ======================== EQUIPMENT ========================
router.get("/equipments", adminController.getAllEquipments);
router.post("/equipments", adminController.createEquipment);
router.put("/equipments/:id", adminController.updateEquipment);
router.delete("/equipments/:id", adminController.deleteEquipment);
router.put("/equipments/:id/stock-in", adminController.stockIn);

// ======================== MAINTENANCE ========================
router.get("/maintenance", adminController.getAllMaintenance);
router.post("/maintenance", adminController.createMaintenance);
router.put("/maintenance/:id/status", adminController.updateMaintenanceStatus);

// ======================== ANALYTICS ========================
router.get("/analytics/dashboard", adminController.getDashboardStats);
router.get("/analytics/revenue", adminController.getRevenueStats);
router.get("/analytics/equipment-stats", adminController.getEquipmentStats);
router.get("/analytics/peak-hours", adminController.getPeakHours);

// ======================== USERS ========================
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserDetail);
router.put("/users/:id/toggle-status", adminController.toggleUserStatus);

export default router;
