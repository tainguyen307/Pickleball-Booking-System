import User from "../models/user.model.js";

class UserRepository {
    /**
     * Tìm kiếm người dùng dựa vào Email
     */
    async findByEmail(email) {
        return await User.findOne({ email });
    }

    /**
     * Tìm kiếm người dùng dựa vào ID
     */
    async findById(id) {
        return await User.findById(id);
    }

    /**
     * Tạo mới một tài khoản người dùng (Dùng cho Register / Google Login)
     */
    async create(userData) {
        return await User.create(userData);
    }

    /**
     * Cập nhật thông tin và lưu lại User
     */
    async updateLastLogin(userInstance) {
        userInstance.lastLogin = new Date();
        return await userInstance.save();
    }
}

export default new UserRepository();