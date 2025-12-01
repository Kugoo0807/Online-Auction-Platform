import { upgradeRequestRepository }  from '../repositories/upgrade.request.repository.js';
import { userRepository }  from '../repositories/user.repository.js';
class UpgradeRequestService {
    async createRequest(userId) {
        const existingRequest = await upgradeRequestRepository.findPendingByUserId(userId);
        if (existingRequest) {
            throw new Error('Bạn đã có yêu cầu đang chờ phê duyệt. Vui lòng đợi!');
        }
        return await upgradeRequestRepository.create({
            user_upgrade: userId
        });
    }
    
    async getPendingList() {
        return await upgradeRequestRepository.findPendingRequests();
    }

    async updateRequestStatus(requestId, adminId, status) {
        const validStatuses = ['approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            throw new Error('Trạng thái không hợp lệ');
        }

        const request = await upgradeRequestRepository.findById(requestId);
        if (!request) throw new Error('Yêu cầu không tồn tại');
        if (request.status !== 'pending') throw new Error('Yêu cầu này đã được xử lý trước đó');

        const updatedRequest = await upgradeRequestRepository.updateStatus(requestId, status, adminId);

        if (status === 'approved') {
            const userIdToUpgrade = request.user_upgrade._id || request.user_upgrade;
            await userRepository.updateRole(userIdToUpgrade, 'seller');
        }

        return updatedRequest;
    }
}
export const upgradeRequestService = new UpgradeRequestService();
