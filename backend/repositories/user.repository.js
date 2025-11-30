import { User } from '../../db/schema.js';

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findById(id) {
    return await User.findById(id);
  }

  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async updatePassword(userId, newHashedPassword) {
    return await User.findByIdAndUpdate(
      userId,
      { password: newHashedPassword },
      { new: true }
    );
  }

  async findByProviderId(provider, providerId) {
    return await User.findOne({ auth_provider: provider, provider_id: providerId });
  }

  async createSocialUser(profile) {
    const user = new User(profile);
    return await user.save();
  }

  async linkSocialAccount(userId, provider, providerId) {
    return await User.findByIdAndUpdate(
      userId,
      { auth_provider: provider, provider_id: providerId },
      { new: true }
    );
  }

  async updateData(userId, updateData) {
    if (!updateData || typeof updateData !== 'object') {
      return await User.findById(userId);
    }

    const allowed = ['full_name', 'date_of_birth', 'phone_number', 'address', 'email'];
    const cleaned = Object.fromEntries(
      Object.entries(updateData).filter(([key, val]) =>
        allowed.includes(key) &&
        val !== null &&
        val !== undefined &&
        val !== '' &&
        key !== '_id' &&
        key !== 'id'
      )
    );

    if (Object.keys(cleaned).length === 0) {
      return await User.findById(userId);
    }

    return await User.findByIdAndUpdate(
      userId,
      { $set: cleaned },
      { new: true, runValidators: true }
    );
  }

  async updateRole(userId, newRole) {
    return await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true, runValidators: true }
    );
  }
}

export const userRepository = new UserRepository();
