// components/Modal/ProductModal.tsx
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiEye, FiEdit, FiTrash2, FiPlus, FiX } from "react-icons/fi";

// Dynamically import form and view components
const ProductForm = dynamic(() => import("../Forms/ProductForm"), {
  loading: () => <p className="text-dark">Loading form...</p>,
});
const ProductView = dynamic(() => import("./ViewProduct"), {
  loading: () => <p className="text-dark">Loading details...</p>,
});

type ProductActionType = "view" | "create" | "update" | "delete";

type ProductData = {
  name: string;
  price: number;
  description: string;
  quantity: number;
  color: string[];
  images: string[];
  id?: string;
  brand: string;
  category: string;
};

type ProductModalProps = {
  type: ProductActionType;
  data?: ProductData;
  id?: string;
  onSuccess?: () => void;
  children?: React.ReactNode; // For custom trigger button
};

const iconMap = {
  view: <FiEye className="h-5 w-5" />,
  create: <FiPlus className="h-5 w-5" />,
  update: <FiEdit className="h-5 w-5" />,
  delete: <FiTrash2 className="h-5 w-5" />,
};

const buttonClassMap = {
  view: "text-primary hover:text-primary/80",
  create: "inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium",
  update: "text-primary hover:text-primary/80",
  delete: "text-red-600 hover:text-red-900",
};

const modalTitleMap = {
  view: "Product Details",
  create: "Add New Product",
  update: "Edit Product",
  delete: "Delete Product",
};

const ProductModal: React.FC<ProductModalProps> = ({ 
  type, 
  data, 
  id, 
  onSuccess,
  children 
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/tools/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Product deleted successfully");
        onSuccess?.();
        setOpen(false);
      } else {
        const result = await res.json();
        toast.error("Delete failed: " + (result.error || "Unknown error"));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error("Error: " + err.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (type) {
      case "view":
        return id ? <ProductView id={id} /> : <p className="text-dark">No product ID provided</p>;
      case "create":
        return (
          <ProductForm
            type="create"
            onSuccess={() => {
              setOpen(false);
              onSuccess?.();
            }}
          />
        );
      case "update":
        return id ? (
          <ProductForm
            type="update"
            productId={id}
            productData={data ? {
              name: data.name,
              brand: data.brand,
              category: data.category,
              price: data.price.toString(),
              quantity: data.quantity,
              description: data.description,
              color: data.color,
              images: data.images
            } : undefined}
            onSuccess={() => {
              setOpen(false);
              onSuccess?.();
            }}
          />
        ) : (
          <p className="text-dark">No product ID provided for update</p>
        );
      case "delete":
        return (
          <div className="text-center flex flex-col items-center gap-6 p-4">
            <p className="text-lg font-medium text-dark">
              Are you sure you want to delete this product?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setOpen(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-dark"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-70"
              >
                {isLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        );
      default:
        return <p className="text-dark">Invalid action</p>;
    }
  };

  return (
    <>
      {/* Custom trigger or default button */}
      {children ? (
        <div onClick={() => setOpen(true)}>
          {children}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={buttonClassMap[type]}
          aria-label={type}
        >
          {type === 'create' ? (
            <>
              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
              Add Product
            </>
          ) : (
            iconMap[type]
          )}
        </button>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-dark/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-secondary rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-bold text-dark">
                {modalTitleMap[type]}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductModal;