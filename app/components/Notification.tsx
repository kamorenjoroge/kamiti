import { useState, useEffect } from "react";
import { MdNotifications } from "react-icons/md";
import axios from "axios";
import Link from "next/link";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type Order = {
  _id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shippingAddress: string;
  Mpesatransactioncode: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

const Notification = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/orders");
      
      // Handle different response structures
      let ordersData: Order[] = [];
      
      if (response.data.success && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        ordersData = response.data;
      } else {
        throw new Error("Invalid response format");
      }
      
      // Filter for pending orders only and sort by creation date (newest first)
      const pendingOrders = ordersData
        .filter(order => order.status === "pending")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10); // Show only last 10 pending orders
        
      setOrders(pendingOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Optional: Set up polling to refresh notifications every 30 seconds
    const interval = setInterval(fetchOrders, 1800000);
    return () => clearInterval(interval);
  }, []);

  // Calculate time ago
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const createdAt = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // All pending orders are considered "unread" notifications
  const unreadCount = orders.length;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-primary transition-all duration-200 group"
      >
        <MdNotifications size={24} className="group-hover:scale-110 transition-transform duration-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isNotificationOpen && (
        <div className="fixed top-16 right-4 z-50 w-80 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-secondary border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Pending Orders</h3>
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-xs font-medium rounded-full px-3 py-1 shadow-sm">
                {unreadCount} pending
              </span>
            )}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-primary mx-auto"></div>
                <p className="text-sm text-gray-500 mt-3">Loading orders...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-sm text-red-500 mb-3">{error}</p>
                <button 
                  onClick={fetchOrders}
                  className="text-sm bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                  <MdNotifications size={24} className="text-primary" />
                </div>
                <p className="text-sm text-gray-500">No pending orders</p>
              </div>
            ) : (
              orders.map((order) => {
                const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                
                return (
                  <div
                    key={order._id}
                    className="group hover:bg-secondary transition-colors duration-200 border-l-4 border-l-primary"
                  >
                    <Link href="/orders">
                      <div className="p-4">
                        {/* Order Header */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors duration-200">
                              {order.customerName}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {order.phone} • {order.shippingAddress}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-primary">
                              {formatCurrency(order.total)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Order Details */}
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                            {totalItems} item{totalItems > 1 ? 's' : ''}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(order.createdAt)}
                          </span>
                        </div>
                        
                        {/* Items List */}
                        {order.items.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-600 truncate">
                              {order.items.map(item => item.name).join(', ')}
                            </p>
                          </div>
                        )}
                        
                        {/* M-Pesa Transaction */}
                        {order.Mpesatransactioncode && (
                          <div className="bg-secondary rounded-lg px-3 py-2 group-hover:bg-white transition-colors duration-200">
                            <p className="text-xs text-gray-700">
                              <span className="font-medium">M-Pesa:</span> {order.Mpesatransactioncode}
                            </p>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-center gap-4">
            <button 
              onClick={fetchOrders}
              className="text-sm text-primary hover:text-primary-libg-primary-light font-medium transition-colors duration-200"
            >
              Refresh
            </button>
            <span className="text-gray-300">|</span>
            <Link href="/orders">
              <button className="text-sm text-primary hover:text-primary-libg-primary-light font-medium transition-colors duration-200">
                View all orders
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;