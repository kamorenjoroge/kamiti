"use client";
import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
import Tables from "../components/Tables";
import ProductModal from "../components/Modal/ProductModal";
import Image from "next/image";
import {  MdTrendingUp } from "react-icons/md";
import { FiList, FiPlus } from "react-icons/fi";
import Category from "../components/Modal/Category";

type Tool = {
  _id: string;
  name: string;
  brand: string;
  category: string;
  quantity: number;
  description: string;
  price: number;
  color: string[];
  image: string[]; // Changed from 'images' to 'image' to match API response
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type ApiResponse = {
  success: boolean;
  data: Tool[];
};

const Page = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTools = async () => {
    try {
      const response = await axios.get<ApiResponse>("/api/tools");
      if (response.data.success) {
        setTools(response.data.data);
      } else {
        setError("Failed to fetch tools");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCategory = async () => {};

  useEffect(() => {
    fetchTools();
  }, []);

  const columns = useMemo<
    { header: string; accessor: keyof Tool; className: string }[]
  >(
    () => [
      {
        header: "Product",
        accessor: "name",
        className: "min-w-[200px]",
      },
      {
        header: "QTY",
        accessor: "quantity",
        className: "hidden md:table-cell min-w-[20px]",
      },
      {
        header: "Brand",
        accessor: "brand",
        className: "hidden md:table-cell min-w-[100px]",
      },
      {
        header: "Category",
        accessor: "category",
        className: "hidden md:table-cell min-w-[150px]",
      },
      {
        header: "Price",
        accessor: "price",
        className: "text-left min-w-[70px]",
      },
      {
        header: "Actions",
        accessor: "_id",
        className: "text-left min-w-[100px]",
      },
    ],
    []
  );

  const renderRow = useCallback(
    (tool: Tool) => (
      <tr key={tool._id} className="hover:bg-gray-50">
        <td className={`px-6 py-4 whitespace-nowrap ${columns[0].className}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
              {tool.image?.[0] ? (
                <Image
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-md object-cover"
                  src={tool.image[0]}
                  alt={tool.name}
                />
              ) : (
                <span className="text-xs text-gray-500">No Image</span>
              )}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {tool.name}
              </div>
              <div className="flex gap-1 mt-1">
                {tool.color && tool.color.length > 0 ? (
                  tool.color.map((clr, idx) => (
                    <span
                      key={idx}
                      className="w-4 h-4 inline-block rounded-full border border-gray-300"
                      style={{ backgroundColor: clr }}
                      title={clr}
                    />
                  ))
                ) : (
                  <span className="text-sm text-gray-500">
                    No colors specified
                  </span>
                )}
              </div>
            </div>
          </div>
        </td>

        <td
          className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${columns[1].className}`}
        >
          {tool.quantity}
        </td>
        <td
          className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${columns[2].className}`}
        >
          {tool.brand}
        </td>
        <td
          className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${columns[3].className}`}
        >
          {tool.category}
        </td>
        <td
          className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${columns[4].className}`}
        >
          Kes {tool.price.toLocaleString()}
        </td>
        <td
          className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${columns[5].className}`}
        >
          <div className="flex justify-start space-x-2">
            <ProductModal type="view" id={tool._id} />
            <ProductModal
              type="update"
              id={tool._id}
              data={{
                ...tool,
                images: tool.image,
              }}
              onSuccess={fetchTools}
            />
            <ProductModal type="delete" id={tool._id} onSuccess={fetchTools} />
          </div>
        </td>
      </tr>
    ),
    [columns]
  );

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-1">
      <div className="bg-primary/20 p-6 rounded-xl shadow-sm border border-primary">
        <h3 className="text-lg font-semibold text-dark mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Add Category */}
        
          <Category
            type="create"
            onSuccess={handleCategory}
            buttonText="Add New Category"
            buttonIcon={FiPlus}
            buttonClassName="p-4 border-2 border-dashed border-primary rounded-lg hover:border-primary hover:bg-secondary transition-colors group w-full"
          />

          {/* View All Products */}
          <Category
            type="view"
            onSuccess={handleCategory}
            buttonText="View All Categories"
            buttonIcon={FiList}
            buttonClassName="p-4 border-2 border-dashed border-primary rounded-lg hover:border-primary hover:bg-secondary transition-colors group w-full"
            modalTitle="Product Category"
          />

        

          {/* View Reports */}
          <button className="p-4 border-2 border-dashed border-primary rounded-lg hover:border-primary hover:bg-secondary transition-colors group w-full">
            <MdTrendingUp
              size={24}
              className="text-dark group-hover:text-primary mx-auto mb-2"
            />
            <p className="text-sm text-gray-900 group-hover:text-primary text-center">
              View Reports
            </p>
          </button>
        </div>
      </div>
      <div className="mb-6 mt-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tools Inventory</h1>
        <ProductModal type="create" onSuccess={fetchTools} />
      </div>
      <Tables
        columns={columns}
        data={tools}
        renderRow={renderRow}
        itemsPerPage={5}
      />
    </div>
  );
};

export default Page;
