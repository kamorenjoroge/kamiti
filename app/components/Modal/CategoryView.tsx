"use client";
import Tables from "../Tables";
import { FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type Category = {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

const CategoryView = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/category');
        if (response.data.success) {
          setCategories(response.data.data);
        } else {
          setError('Failed to fetch categories');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle delete button click - show modal
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  // Handle actual delete action
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setDeleting(true);
    try {
      const response = await axios.delete(`/api/category/${categoryToDelete._id}`);
      if (response.data.success) {
        setCategories(prev => prev.filter(category => category._id !== categoryToDelete._id));
        toast.success('Category deleted successfully');
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      } else {
        toast.error('Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Error deleting category');
    } finally {
      setDeleting(false);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  // Define columns for the table
  const columns = [
    {
      header: "Name",
      accessor: "name" as const,
    },
    {
      header: "Actions",
      accessor: "_id" as const,
      className: "text-right",
    },
  ];

  // Render each row
  const renderRow = (item: Category) => {
    return (
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
    );
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Categories</h1>
        <div className="flex justify-center items-center h-64">
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Categories</h1>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Categories</h1>
      <Tables
        columns={columns}
        data={categories}
        renderRow={renderRow}
        itemsPerPage={10}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-dark/60 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the category &quot;{categoryToDelete?.name}&ldquo;? This action cannot be undone.
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
    </div>
  );
};

export default CategoryView;