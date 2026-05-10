const User = require('../models/user');

class UserRepository {
    async findByEmail(email) {
        return await User.findOne({ email });
    }
    // Nơi xử lý các câu lệnh aggregate phức tạp
    async getAdminDashboardStats() {
        return await User.aggregate([]); 
    }
    
    async createUser(userData) {
        return await User.create(userData);
    }

    async updateUser(email, data) {
        return await User.findOneAndUpdate(
            { email },
            data,
            { new: true }
        );
    }
}

module.exports = new UserRepository();