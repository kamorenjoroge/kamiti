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
      <button
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        className="relative p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors"
      >
        <MdNotifications size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-danger text-light text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isNotificationOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-light rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-dark">Pending Orders</h3>
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-xs rounded-full px-2 py-1">
                {unreadCount} pending
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading orders...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-sm text-red-500">{error}</p>
                <button 
                  onClick={fetchOrders}
                  className="text-xs bg-primary text-white px-2 py-1 rounded mt-2"
                >
                  Retry
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">No pending orders  </p>
              </div>
            ) : (
              orders.map((order) => {
                const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                
                return (
        
                 
                  
                  <div
                    key={order._id}
                    className="p-4 border-b border-gray-100 hover:bg-gray-100 bg-secondary border-l-4 border-l-dark"
                  > <Link href="/orders">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-dark">{order.customerName}</p>
                         
                        
                        <p className="text-xs text-gray-500">
                          {order.phone} • {order.shippingAddress}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-primary">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>
                    </Link>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {totalItems} item{totalItems > 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(order.createdAt)}
                      </span>
                    </div>
                    
                    {order.items.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 truncate">
                          {order.items.map(item => item.name).join(', ')}
                        </p>
                      </div>
                    )}
                    
                    {order.Mpesatransactioncode && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-500">
                          M-Pesa: {order.Mpesatransactioncode}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 text-center border-t border-gray-200">
            <button 
              onClick={fetchOrders}
              className="text-sm text-primary hover:underline font-medium mr-4"
            >
              Refresh
            </button>
            <button className="text-sm text-primary hover:underline font-medium">
              View all pending orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;