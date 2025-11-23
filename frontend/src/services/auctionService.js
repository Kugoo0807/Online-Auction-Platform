    import api from './api';

export const auctionService = {
  getAuctions: async () => {
    const response = await api.get('/auctions');
    return response.data;
  },

  getAuctionById: async (id) => {
    const response = await api.get(`/auctions/${id}`);
    return response.data;
  },

  createAuction: async (auctionData) => {
    const response = await api.post('/auctions', auctionData);
    return response.data;
  },

  placeBid: async (auctionId, bidAmount) => {
    const response = await api.post(`/auctions/${auctionId}/bids`, { bidAmount });
    return response.data;
  }
};