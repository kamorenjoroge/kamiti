"use client";
import { FiTrash2, FiEye, FiPlus, FiX } from 'react-icons/fi';
import { IconType } from 'react-icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Tables from "../Tables";

type Category = {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type CategoryProps = {
  type: 'view' | 'create';
  onSuccess?: () => void;
  children?: React.ReactNode;
  buttonText?: string;
  buttonIcon?: IconType;
  buttonClassName?: string;
  modalTitle?: string;
};

const Category = ({ 
  type, 
  onSuccess, 
  children,
  buttonText = type === 'create' ? "Add Product" : "View Products",
  buttonIcon: ButtonIcon = type === 'create' ? FiPlus : FiEye,
  buttonClassName = "inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium",
  modalTitle = type === 'create' ? "Add New Product" : "Product List"
}: CategoryProps) => {
  // Common state
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // View-specific state
  const [products, setProducts] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch products when modal opens (for view mode)
  useEffect(() => {
    if (type === 'view' && open) {
      const fetchProducts = async () => {
        try {
          setLoading(true);
          const response = await axios.get('/api/category');
          if (response.data.success) {
            setProducts(response.data.data);
          } else {
            setError('Failed to fetch products');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    }
  }, [type, open]);

  // Handle create product
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("Product created successfully");
        setName("");
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to create product");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete operations
  const handleDeleteClick = (product: Category) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setDeleting(true);
    try {
      const response = await axios.delete(`/api/category/${productToDelete._id}`);
      if (response.data.success) {
        setProducts(prev => prev.filter(product => product._id !== productToDelete._id));
        toast.success('Product deleted successfully');
        setShowDeleteModal(false);
        setProductToDelete(null);
        onSuccess?.();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Error deleting product');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // Return create modal
  if (type === 'create') {
    return (
      <>
        {children ? (
          <div onClick={() => setOpen(true)}>{children}</div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className={buttonClassName}
          >
            {ButtonIcon && <ButtonIcon className="-ml-1 mr-2 h-5 w-5" />}
            {buttonText}
          </button>
        )}

        {open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="flex justify-between items-center border-b p-4">
                <h3 className="text-xl font-bold text-gray-800">{modalTitle}</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-70"
                  >
                    {isLoading ? "Creating..." : "Create Product"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Return view mode button and modal
  return (
    <>
      {children ? (
        <div onClick={() => setOpen(true)}>{children}</div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={buttonClassName}
        >
          {ButtonIcon && <ButtonIcon className="-ml-1 mr-2 h-5 w-5" />}
          {buttonText}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">{modalTitle}</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading products...</p>
                </div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <Tables
                  columns={[
                    { header: "Name", accessor: "name" as const },
                    { header: "Actions", accessor: "_id" as const, className: "text-right" },
                  ]}
                  data={products}
                  renderRow={(item: Category) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="text-red-600 hover:text-red-900 focus:outline-none"
                          title="Delete"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  )}
                  itemsPerPage={10}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the product {productToDelete?.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleting}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Category;