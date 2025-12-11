import { avatar, maskName, formatDateTime, formatPrice } from './productDetail.utils.jsx'

export default function BidRow({ bid, index, isRealSeller, currentUserId, onBanUser }) {
    let bidderName = bid.user?.full_name;
    if (!bid.is_valid && !isRealSeller) bidderName = undefined;
    
    const isUserMe = currentUserId === bid.user?._id?.toString();
    const isInvalid = !bid.is_valid;

    const rowBgClass = isInvalid 
        ? 'bg-red-200 hover:bg-red-100' 
        : index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 hover:bg-gray-100';

    return (
        <tr className={`group transition-colors ${rowBgClass}`}>
        {/* STT */}
        <td className="py-3 px-4 border-b w-8">
            <span className="text-gray-900 font-mono">{index + 1}</span>
        </td>

        {/* Thời gian */}
        <td className="py-3 px-4 border-b">
            <div className="font-medium text-gray-900">{formatDateTime(bid.date)}</div>
        </td>

        {/* Người đấu giá */}
        <td className="py-3 px-4 border-b">
            <div className="flex items-center gap-2">
                {avatar(bidderName, 8)}
                <span className={`font-medium text-sm leading-tight ${isInvalid ? 'text-gray-500 line-through italic' : 'text-gray-800'}`}>
                    {bidderName ? maskName(bidderName) : '********'}
                    {isUserMe && ' (Bạn)'}
                </span>
            </div>
        </td>

        {/* Giá (Kèm Tooltip & Auto-bid badge) */}
        <td className="py-3 px-4 border-b relative">
            <span className="font-bold text-red-600 text-lg">
                {isInvalid ? '********' : `₫${formatPrice(bid.price)}`}
            </span>

            {/* Badge Auto Bid */}
            {!isInvalid && bid.is_auto && (
            <span className="w-fit bg-blue-100 text-blue-700 text-[12px] font-semibold px-2 py-0.5 rounded-full border border-gray-200 flex items-center justify-center gap-1 select-none">
                <span>Automated Bidding</span>
                <span>🤖</span>
            </span>
            )}

            {/* Tooltip khi bị hủy */}
            {isInvalid && (
            <div className="absolute top-1/2 -translate-y-1/2 right-full mr-3 hidden group-hover:block z-50 w-80 pointer-events-none">
                <div className="bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-xl text-center leading-relaxed opacity-95">
                    <p>Người dùng này đã bị loại khỏi phiên đấu giá.</p>
                    <p>Các mức giá được đặt từ người này đã bị hủy bỏ.</p>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 -right-[12px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-800 mx-auto opacity-95"></div>
            </div>
            )}
        </td>

        {/* Kiểm duyệt (Seller only) */}
        {isRealSeller && (
            <td className="py-3 px-4 border-b text-center">
            {!bid.is_banned && isInvalid ? (
                <span className="bg-gray-100 text-gray-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 cursor-not-allowed select-none whitespace-nowrap">
                    Đã vô hiệu
                </span>
            ) : (
                <button
                    onClick={() => onBanUser(bid.user?._id, bidderName, bid.is_banned)}
                    className={`${bid.is_banned ? 'bg-green-100 hover:bg-green-200 text-green-700' : 'bg-red-100 hover:bg-red-200 text-red-700'} p-2 rounded-lg transition-colors text-sm font-bold flex items-center gap-1 mx-auto cursor-pointer z-10 relative`}
                    title="Kiểm duyệt người dùng"
                >
                    {bid.is_banned ? 'Mở lại' : 'Từ chối'}
                </button>
            )}
            </td>
        )}
        </tr>
    );
}
