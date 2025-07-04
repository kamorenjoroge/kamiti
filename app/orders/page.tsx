"use client";
import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
import Tables from "../components/Tables";
import { MdShoppingCart, MdError, MdRefresh, MdCancel, MdCheckCircle, MdLocalShipping } from "react-icons/md";
import OrderModal from "../components/Modal/OrderModal";

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
  status: "pending" | "confirmed" | "shipped" | "cancelled";
  shippingAddress: string;
  Mpesatransactioncode: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type ApiResponse = {
  success: boolean;
  data: Order[];
  message?: string;
};

const Page = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse>("/api/orders");

      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      let errorMessage = "An error occurred while fetching orders";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Calculate order statistics
  const orderStats = useMemo(() => {
    const pending = orders.filter(order => order.status === "pending").length;
    const confirmed = orders.filter(order => order.status === "confirmed").length;
    const shipped = orders.filter(order => order.status === "shipped").length;
    const cancelled = orders.filter(order => order.status === "cancelled").length;

    return {
      pending,
      confirmed,
      shipped,
      cancelled,
      total: orders.length
    };
  }, [orders]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "shipped":
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            Shipped
          </span>
        );
      case "confirmed":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Confirmed
          </span>
        );
      case "cancelled":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            Cancelled
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            Pending
          </span>
        );
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Order #",
        accessor: "_id" as keyof Order,
        className: "min-w-[100px] hidden md:table-cell",
      },
      {
        header: "Customer",
        accessor: "customerName" as keyof Order,
        className: "min-w-[150px]",
      },
      {
        header: "Items",
        accessor: "items" as keyof Order,
        className: "hidden sm:table-cell text-center min-w-[80px]",
      },
      {
        header: "Total",
        accessor: "total" as keyof Order,
        className: "text-right min-w-[100px]",
      },
      {
        header: "Status",
        accessor: "status" as keyof Order,
        className: "min-w-[100px]",
      },
      {
        header: "Date",
        accessor: "createdAt" as keyof Order,
        className: "hidden lg:table-cell min-w-[120px]",
      },
      {
        header: "Actions",
        accessor: "_id" as keyof Order,
        className: "",
      },
    ],
    []
  );

  const renderRow = useCallback((order: Order) => {
    return (
      <tr key={order._id} className="hover:bg-gray-50">
        {/* Order ID - hidden on mobile */}
        <td className="px-4 py-3 hidden md:table-cell">
          <span className="font-medium text-gray-900">
            #{order._id.slice(-6).toUpperCase()}
          </span>
        </td>

        {/* Customer Info - always visible */}
        <td className="px-4 py-3">
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">
              {order.customerName}
            </span>
            <span className="text-sm md:text-base text-[0.5rem] md:text-inherit text-gray-500">
              {order.customerEmail}
            </span>
          </div>
        </td>

        {/* Items count - hidden on mobile */}
        <td className="px-4 py-3 text-center hidden sm:table-cell">
          <span className="font-medium">{order.items.length}</span>
        </td>

        {/* Total - always visible */}
        <td className="px-4 py-3 text-right">
          <span className="font-medium">
            Kes {order.total.toLocaleString()}
          </span>
        </td>

        {/* Status - always visible */}
        <td className="px-4 py-3">{getStatusBadge(order.status)}</td>

        {/* Date - hidden on mobile */}
        <td className="px-4 py-3 hidden lg:table-cell">
          <div className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </td>

        {/* Actions - always visible */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <OrderModal type="view" order={order} />

            {order.status === "pending" && (
              <>
                <OrderModal
                  type="confirm"
                  order={order}
                  onSuccess={fetchOrders}
                />
                <OrderModal
                  type="cancel"
                  order={order}
                  onSuccess={fetchOrders}
                />
              </>
            )}

            {order.status === "confirmed" && (
              <OrderModal type="ship" order={order} onSuccess={fetchOrders} />
            )}
          </div>
        </td>
      </tr>
    );
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <MdError className="text-red-500 mr-2" size={20} />
            <h3 className="text-red-800 font-medium">Error loading orders</h3>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-3 flex items-center px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
          >
            <MdRefresh className="mr-1" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-6">
      {/* Quick Actions - Enhanced */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
          Order Overview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* Pending Orders */}
          <div className="group relative bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 sm:p-4 lg:p-5 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-2 sm:p-2.5 bg-yellow-100 rounded-lg">
                <MdShoppingCart
                  size={20}
                  className="text-yellow-600 sm:w-6 sm:h-6"
                />
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold text-yellow-700">
                  {orderStats.pending}
                </div>
                <div className="text-xs sm:text-sm text-yellow-600 font-medium">
                  Pending
                </div>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-yellow-600">
              Orders awaiting confirmation
            </div>
          </div>

          {/* Confirmed Orders */}
          <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 sm:p-4 lg:p-5 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-2 sm:p-2.5 bg-green-100 rounded-lg">
                <MdCheckCircle
                  size={20}
                  className="text-green-600 sm:w-6 sm:h-6"
                />
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold text-green-700">
                  {orderStats.confirmed}
                </div>
                <div className="text-xs sm:text-sm text-green-600 font-medium">
                  Confirmed
                </div>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-green-600">
              Orders ready for shipping
            </div>
          </div>

          {/* Shipped Orders */}
          <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-4 lg:p-5 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-2 sm:p-2.5 bg-blue-100 rounded-lg">
                 <MdLocalShipping
                  size={20}
                  className="text-blue-600 sm:w-6 sm:h-6"
                />
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold text-blue-700">
                  {orderStats.shipped}
                </div>
                <div className="text-xs sm:text-sm text-blue-600 font-medium">
                  Shipped
                </div>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-blue-600">
              Orders successfully delivered
            </div>
          </div>

          {/* Cancelled Orders */}
          <div className="group relative bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-lg p-3 sm:p-4 lg:p-5 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-2 sm:p-2.5 bg-red-100 rounded-lg">
                <MdCancel
                  size={20}
                  className="text-red-600 sm:w-6 sm:h-6"
                />
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold text-red-700">
                  {orderStats.cancelled}
                </div>
                <div className="text-xs sm:text-sm text-red-600 font-medium">
                  Cancelled
                </div>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-red-600">
              Orders that were cancelled
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Order Management
        </h1>
        <div className="mt-2 sm:mt-0 text-sm text-gray-500">
          Showing {orders.length} order{orders.length !== 1 ? "s" : ""} total
        </div>
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 text-center">
          <MdShoppingCart className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No orders found
          </h3>
          <p className="mt-2 text-gray-500">No orders have been placed yet.</p>
          <button
            onClick={fetchOrders}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none transition-colors"
          >
            <MdRefresh className="mr-2" /> Refresh
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <Tables
            columns={columns}
            data={orders}
            renderRow={renderRow}
            itemsPerPage={10}
          />
        </div>
      )}
    </div>
  );
};

export default Page;