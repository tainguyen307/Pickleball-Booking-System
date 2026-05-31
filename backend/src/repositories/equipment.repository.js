// src/repositories/equipment.repository.js (MÔI TRƯỜNG BACKEND)
import Equipment from "../models/equipment.model.js";

class EquipmentRepository {
    /**
     * Lấy toàn bộ danh mục thiết bị đang sẵn sàng cho thuê
     */
    async findAvailableEquipments() {
        return await Equipment.find({ status: "AVAILABLE" });
    }

    /**
     * Tìm kiếm một thiết bị cụ thể theo ID để check kho và tính giá
     */
    async findById(id) {
        return await Equipment.findById(id);
    }
}

export default new EquipmentRepository();