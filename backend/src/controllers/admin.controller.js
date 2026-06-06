// src/controllers/admin.controller.js
import adminService from "../services/admin.service.js";

class AdminController {
    // ======================== COURTS ========================
    async getCourts(req, res) {
        try {
            const result = await adminService.getAllCourts(req.query);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async getCourtById(req, res) {
        try {
            const result = await adminService.getCourtDetail(req.params.id);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async createCourt(req, res) {
        try {
            const result = await adminService.createCourt(req.body, req.files);
            return res.status(201).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateCourt(req, res) {
        try {
            const result = await adminService.updateCourt(req.params.id, req.body, req.files);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async deleteCourt(req, res) {
        try {
            const result = await adminService.deleteCourt(req.params.id);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async blockCourt(req, res) {
        try {
            const result = await adminService.blockCourt(req.params.id);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    // ======================== BOOKINGS ========================
    async getAllBookings(req, res) {
        try {
            const result = await adminService.getAllBookings(req.query);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async confirmBooking(req, res) {
        try {
            const result = await adminService.confirmBooking(req.params.id);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async cancelBooking(req, res) {
        try {
            const { cancelReason } = req.body;
            const result = await adminService.cancelBooking(req.params.id, cancelReason);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    // ======================== EQUIPMENT ========================
    async getAllEquipments(req, res) {
        try {
            const result = await adminService.getAllEquipments(req.query);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async createEquipment(req, res) {
        try {
            const result = await adminService.createEquipment(req.body);
            return res.status(201).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateEquipment(req, res) {
        try {
            const result = await adminService.updateEquipment(req.params.id, req.body);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async deleteEquipment(req, res) {
        try {
            const result = await adminService.deleteEquipment(req.params.id);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async stockIn(req, res) {
        try {
            const { quantity } = req.body;
            const result = await adminService.stockIn(req.params.id, quantity);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    // ======================== MAINTENANCE ========================
    async getAllMaintenance(req, res) {
        try {
            const result = await adminService.getAllMaintenance(req.query);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async createMaintenance(req, res) {
        try {
            const adminId = req.user.id;
            const result = await adminService.createMaintenance(adminId, req.body);
            return res.status(201).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateMaintenanceStatus(req, res) {
        try {
            const { status } = req.body;
            const result = await adminService.updateMaintenanceStatus(req.params.id, status);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    // ======================== ANALYTICS ========================
    async getDashboardStats(req, res) {
        try {
            const result = await adminService.getDashboardStats();
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async getRevenueStats(req, res) {
        try {
            const result = await adminService.getRevenueStats(req.query);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async getEquipmentStats(req, res) {
        try {
            const result = await adminService.getEquipmentStats();
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async getPeakHours(req, res) {
        try {
            const result = await adminService.getPeakHours();
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    // ======================== USERS ========================
    async getAllUsers(req, res) {
        try {
            const result = await adminService.getAllUsers(req.query);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async getUserDetail(req, res) {
        try {
            const result = await adminService.getUserDetail(req.params.id);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async toggleUserStatus(req, res) {
        try {
            const result = await adminService.toggleUserStatus(req.params.id);
            return res.status(200).json({ success: true, ...result });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}

export default new AdminController();
