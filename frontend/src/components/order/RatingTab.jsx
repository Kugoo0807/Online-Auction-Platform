const RatingTab = ({ orderData, isBuyer, isSeller }) => {
    const canRate = ['completed', 'cancelled'].includes(orderData.status);

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Đánh giá
            </h3>
            
            {canRate ? (
                <div className="bg-yellow-100 rounded-xl p-8 border border-yellow-200 shadow-sm">
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto shadow-md">
                            <span className="text-4xl">⭐</span>
                        </div>
                        <div>
                            <p className="text-gray-700 font-semibold text-lg mb-2">
                                {isBuyer 
                                    ? 'Đánh giá người bán' 
                                    : isSeller 
                                    ? 'Đánh giá người mua' 
                                    : 'Chức năng đánh giá'}
                            </p>
                            <div className="inline-block bg-white/70 backdrop-blur rounded-lg px-6 py-3 shadow-sm border border-yellow-200">
                                <p className="text-sm text-gray-600">
                                    Tính năng đánh giá sẽ được triển khai sau
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-red-100 rounded-xl border border-red-200">
                    <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📛</span>
                    </div>
                    <p className="text-red-600 font-medium text-lg">
                        Chỉ có thể đánh giá khi đơn hàng đã hoàn thành hoặc bị hủy
                    </p>
                </div>
            )}
        </div>
    );
};

export default RatingTab;
