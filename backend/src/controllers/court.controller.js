// src/controllers/court.controller.js
import courtService from "../services/court.service.js";

class CourtController {
    /**
     * API: GET /api/courts
     */
    async getCourts(req, res) {
        try {
            const result = await courtService.getCourtsListing(req.query);
            return res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * API: GET /api/courts/:id
     */
    async getCourtById(req, res) {
        try {
            const { id } = req.params;
            const court = await courtService.getCourtDetail(id);
            return res.status(200).json({
                success: true,
                court
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default new CourtController();