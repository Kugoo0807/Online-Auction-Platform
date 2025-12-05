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

  async findByEmailAndProvider(email, provider) {
    return await User.findOne({
      email,
      providers: {
        $elemMatch: { provider }
      }
    });
  }

  async hasProvider(userId, provider) {
    return await User.exists({
      _id: userId,
      providers: { $elemMatch: { provider } }
    });
  }

  async findByProvider(provider, providerId) {
    return await User.findOne({
        "providers.provider": provider,
        "providers.provider_id": providerId
    });
  }

  async addProvider(userId, provider, providerId) {
    return await User.findByIdAndUpdate(
        userId,
        {
            $addToSet: {
                providers: { provider, provider_id: providerId }
            }
        },
        { new: true }
    );
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

  async clearOtp(userId) {
    return await User.findByIdAndUpdate(
      userId,
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
    return await User.findByIdAndUpdate(
      userId,
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

    return await User.findByIdAndUpdate(
      userId,
      { role: 'seller', seller_expiry_date: expiryDate },
      { new: true, runValidators: true }
    );
  }

  async downgradeExpiredSellers() {
    const now = new Date();

    return await User.updateMany(
      { role: 'seller', seller_expiry_date: { $lt: now }},
      {
        $set: { role: 'bidder' },
        $unset: { seller_expiry_date: 1 }
      }
    )
  }
}

export const userRepository = new UserRepository();
