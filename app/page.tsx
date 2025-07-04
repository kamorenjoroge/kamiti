"use client";

import {
  MdTrendingUp,
  MdShoppingCart,
  MdPeople,
  MdInventory,
  MdArrowUpward,
  MdArrowDownward,
} from "react-icons/md";
import ProductModal from "./components/Modal/ProductModal";
import axios from "axios";
import { useEffect, useState } from "react";

// Define the type for your stat card data
interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: string;
  color: string;
}

const iconMap = {
  MdTrendingUp: MdTrendingUp,
  MdShoppingCart: MdShoppingCart,
  MdPeople: MdPeople,
  MdInventory: MdInventory,
};

const Page = () => {
  const [statsCards, setStatsCards] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/dashboard');
        if (response.data.success) {
          setStatsCards(response.data.data);
        } else {
          setError("Failed to fetch data");
        }
      } catch (err) {
        setError("Error fetching dashboard data");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      <div className="bg-danger bg-opacity-10 text-danger p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dark">Dashboard Overview</h1>
         
        </div>
        <div className="flex space-x-3">
          <ProductModal type="create" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = iconMap[stat.icon as keyof typeof iconMap];
          return (
            <div
              key={index}
              className="bg-light p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-dark mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    {stat.trend === "up" ? (
                      <MdArrowUpward className="text-success mr-1" size={16} />
                    ) : (
                      <MdArrowDownward className="text-danger mr-1" size={16} />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === "up" ? "text-success" : "text-danger"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      vs last month
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-opacity-10 ${stat.color}`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-light p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-dark mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-secondary transition-colors group">
            <MdInventory
              size={24}
              className="text-gray-400 group-hover:text-primary mx-auto mb-2"
            />
            <p className="text-sm text-gray-600 group-hover:text-primary">
              Add Product
            </p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-secondary transition-colors group">
            <MdShoppingCart
              size={24}
              className="text-gray-400 group-hover:text-primary mx-auto mb-2"
            />
            <p className="text-sm text-gray-600 group-hover:text-primary">
              New Order
            </p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-secondary transition-colors group">
            <MdPeople
              size={24}
              className="text-gray-400 group-hover:text-primary mx-auto mb-2"
            />
            <p className="text-sm text-gray-600 group-hover:text-primary">
              Add User
            </p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-secondary transition-colors group">
            <MdTrendingUp
              size={24}
              className="text-gray-400 group-hover:text-primary mx-auto mb-2"
            />
            <p className="text-sm text-gray-600 group-hover:text-primary">
              View Reports
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;