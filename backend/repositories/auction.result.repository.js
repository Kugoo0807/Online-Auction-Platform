import { AuctionResult } from '../../db/schema.js';

class AuctionResultRepository {
    async create(resultData) {
        const result = new AuctionResult(resultData);
        return await result.save();
    }
}

export const auctionResultRepository = new AuctionResultRepository();