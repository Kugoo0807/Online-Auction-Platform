import { User } from '../../db/schema.js';

class UserRepository {
  async findAll() {
    return await User.find({ is_deleted: false });
  }

  async findByEmail(email) {
    return await User.findOne({ email, is_deleted: false });
  }

  async findById(id) {
    return await User.findOne({ _id: id, is_deleted: false });
  }

  async findByEmailAndProvider(email, provider) {
    return await User.findOne({
      email,
      is_deleted: false,
      providers: { $elemMatch: { provider } }
    });
  }

  async hasProvider(userId, provider) {
    return await User.exists({
      _id: userId,
      is_deleted: false,
      providers: { $elemMatch: { provider } }
    });
  }

  async findByProvider(provider, providerId) {
    return await User.findOne({
        "providers.provider": provider,
        "providers.provider_id": providerId,
        is_deleted: false,
    });
  }

  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async createSocialUser({ full_name, email, provider, provider_id }) {
    const user = new User({
      full_name,
      email,
      password: null,
      providers: [{ provider, provider_id }],
    });
    return await user.save();
  }


  async updatePassword(userId, newHashedPassword) {
    return await User.findOneAndUpdate(
      { _id: userId, is_deleted: false },
      { password: newHashedPassword },
      { new: true }
    );
  }

  async addProvider(userId, provider, providerId) {
    return await User.findOneAndUpdate(
        { _id: userId, is_deleted: false }, 
        {
            $addToSet: {
                providers: { provider, provider_id: providerId }
            }
        },
        { new: true }
    );
  }

  async updateData(userId, updateData) {
    // FIX: dùng this.findById để tận dụng logic check is_deleted: false
    if (!updateData || typeof updateData !== 'object') {
      return await this.findById(userId); 
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
      return await this.findById(userId);
    }

    return await User.findOneAndUpdate(
      { _id: userId, is_deleted: false },
      { $set: cleaned },
      { new: true, runValidators: true }
    );
  }

  async clearOtp(userId) {
    return await User.findOneAndUpdate(
      { _id: userId, is_deleted: false },
      {
        $unset: {
          otp: 1,
          otp_expires: 1
        }
      },
      { new: true }
    );
  }

  async updateRatingStats(userId, score, count, session = null) {
    return await User.findOneAndUpdate(
      { _id: userId, is_deleted: false },
      {
        rating_score: score,
        rating_count: count
      },
      { new: true, session }
    );
  }

  async upgradeSeller(userId) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    return await User.findOneAndUpdate(
      { _id: userId, is_deleted: false },
      { role: 'seller', seller_expiry_date: expiryDate },
      { new: true, runValidators: true }
    );
  }

  async downgradeExpiredSellers() {
    const now = new Date();

    return await User.updateMany(
      { 
          role: 'seller', 
          seller_expiry_date: { $lt: now },
          is_deleted: false
      },
      {
        $set: { role: 'bidder' },
        $unset: { seller_expiry_date: 1 }
      }
    )
  }

  // --- ADMIN & DELETE ---
  async findByIdIncludingDeleted(id) {
    return await User.findById(id); 
  }

  async findByEmailIncludingDeleted(email) {
    return await User.findOne({ email });
  }

  async findDeleted() {
    return await User.find({ is_deleted: true });
  }

  async softDelete(userId, session = null) {
    return await User.findByIdAndUpdate(
      userId, 
      { 
        is_deleted: true, 
        deleted_at: new Date(),
      }, 
      { new: true, session: session }
    );
  }

 async restore(userId, session = null) {
    return await User.findByIdAndUpdate(
      userId, 
      { 
        is_deleted: false, 
        deleted_at: null,
      }, 
      { new: true, session: session }
    );
  }
}

export const userRepository = new UserRepository();