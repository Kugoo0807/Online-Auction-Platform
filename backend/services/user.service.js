import { userRepository }  from '../repositories/user.repository.js';

class UserService {
    async updateProfile(userId, profileData) {
        const { full_name, date_of_birth, phone_number, address, email } = profileData;

        const currentUser = await userRepository.findById(userId);
        if (!currentUser) {
            throw new Error('Không tìm thấy người dùng!');
        }

        // Kiểm tra cập nhật Email
        if (email && email !== currentUser.email) {
            // Kiểm tra sự tồn tại của Email mới
            const existingUser = await userRepository.findByEmail(email);
            if (!existingUser) {
                throw new Error('Email này đã được sử dụng bởi tài khoản khác!');
            }
        }

        const updateData = {};
        if (full_name) updateData.full_name = full_name;
        if (date_of_birth) updateData.date_of_birth = date_of_birth;
        if (phone_number) updateData.phone_number = phone_number;
        if (address) updateData.address = address;
        if (email) updateData.email = email;

        // Cập nhật
        const updateUser = await userRepository.updateData(userId, updateData);
        if (!updateUser) {
            throw new Error('Cập nhật thất bại!');
        }

        updateUser.password = undefined; // Ẩn mật khẩu
        return updateUser;
    }

    // Lấy thông tin cá nhân
    async getProfile(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('Không tìm thấy người dùng!');
        }
        user.password = undefined;
        return user;
    }
}

export const userService = new UserService();