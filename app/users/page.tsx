"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Tables from "../components/Tables"; 

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  _id: string;
}

interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  status: string;
  shippingAddress: string;
  Mpesatransactioncode: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Customer {
  email: string;
  name: string;
  phone: string;
  orderCount: number;
  latestOrderDate: string;
  totalSpent: number;
}

const Page = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/orders");
      setOrders(response.data.data || response.data); 
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Process customer data
  const getCustomers = (orders: Order[]): Customer[] => {
    // Count successful orders per customer
    const getSuccessfulOrderCount = (email: string) => {
      return orders.filter(order => 
        order.customerEmail === email && order.status.toLowerCase() !== "cancelled"
      ).length;
    };

    // Get unique customers
    return Array.from(new Set(orders.map(order => order.customerEmail)))
      .map(email => {
        const customerOrders = orders.filter(order => order.customerEmail === email);
        const latestOrder = customerOrders.reduce((latest, order) => 
          new Date(order.createdAt) > new Date(latest.createdAt) ? order : latest
        );
        return {
          email,
          name: latestOrder.customerName,
          phone: latestOrder.phone,
          orderCount: getSuccessfulOrderCount(email),
          latestOrderDate: latestOrder.createdAt,
          totalSpent: customerOrders
            .filter(order => order.status.toLowerCase() !== "cancelled")
            .reduce((sum, order) => sum + order.total, 0)
        };
      });
  };

  const customers = getCustomers(orders);

  const columns: { header: string; accessor: keyof Customer; className: string }[] = [
    {
      header: "Customer",
      accessor: "name",
      className: "min-w-[180px]",
    },
    {
      header: "Email",
      accessor: "email",
      className: "hidden md:table-cell min-w-[200px]",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden sm:table-cell min-w-[120px]",
    },
    {
      header: "Orders",
      accessor: "orderCount",
      className: "text-center min-w-[80px]",
    },
    {
      header: "Total Spent",
      accessor: "totalSpent",
      className: "text-right min-w-[120px]",
    },
    {
      header: "Last Order",
      accessor: "latestOrderDate",
      className: "hidden md:table-cell min-w-[120px]",
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `Kes ${amount.toLocaleString()}`;
  };

  const renderRow = (customer: Customer) => (
    <tr key={customer.email} className="hover:bg-gray-50">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">
            {customer.name}
          </span>
          <span className="text-[0.7rem] sm:text-sm text-gray-500">
            {customer.email}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
        {customer.email}
      </td>
      <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
        {customer.phone}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center">
        {customer.orderCount}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right">
        {formatCurrency(customer.totalSpent)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
        {formatDate(customer.latestOrderDate)}
      </td>
    </tr>
  );

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4 sm:mb-6">Customers</h1>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Error: {error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Tables<Customer>
            columns={columns}
            data={customers}
            renderRow={renderRow}
          />
        </div>
      )}
  
    </div>
  );
};

export default Page;