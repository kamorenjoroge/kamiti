"use client";

import { useState } from "react";
import axios from "axios";
import { FaUserEdit, FaUserPlus } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { MdWarning } from "react-icons/md";
import toast from "react-hot-toast";

type User = {
  _id: string;
  email: string;
  role: "admin" | "secretary";
  active: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type UserManagerProps = {
  type: "create" | "edit" | "delete";
  user?: User;
  onSuccess?: () => void;
};

const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({
  content,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const UserManager: React.FC<UserManagerProps> = ({ type, user, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    role: user?.role || "secretary",
    active: user?.active ?? true,
  });

  const getTitle = () => {
    switch (type) {
      case "create":
        return "Create New User";
      case "edit":
        return "Edit User";
      case "delete":
        return "Delete User";
      default:
        return "";
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case "create":
        return "flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary text-white rounded-md transition-colors";
      case "edit":
        return "p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors";
      case "delete":
        return "p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors";
      default:
        return "";
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const getContent = () => {
    switch (type) {
      case "create":
        return (
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="secretary">Secretary</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                Active User
              </label>
            </div>
          </form>
        );
      case "edit":
        return (
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="secretary">Secretary</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                Active User
              </label>
            </div>
          </form>
        );
      case "delete":
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <MdWarning className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete User
            </h3>
            <p className="text-sm text-gray-500 mb-4 break-words">
              Are you sure you want to delete{" "}
              <strong className="whitespace-normal break-all">
                {user?.email}
              </strong>
              ? This action cannot be undone.
            </p>
          </div>
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      switch (type) {
        case "create":
          await axios.post("/api/users", {
            email: formData.email,
            role: formData.role,
            active: formData.active,
          });
          break;
        case "edit":
          if (!user?._id) throw new Error("User ID is required for editing");
          await axios.put(`/api/users/${user._id}`, {
            email: formData.email,
            role: formData.role,
            active: formData.active,
          });
          break;
        case "delete":
          if (!user?._id) throw new Error("User ID is required for deletion");
          await axios.delete(`/api/users/${user._id}`);
          break;
      }

      setOpen(false);
      onSuccess?.();
     toast.success("User " + (type === "delete"? "deleted": type === "edit"? "updated": "saved") + " successfully!");
    } catch (err) {
      console.error(`Error during ${type} operation:`, err);
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {type === "create" ? (
        <button
          onClick={() => setOpen(true)}
          className={getButtonStyle()}
          aria-label={getTitle()}
        >
          <FaUserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      ) : (
        <Tooltip content={getTitle()}>
          <button
            onClick={() => setOpen(true)}
            className={getButtonStyle()}
            aria-label={getTitle()}
          >
            {type === "edit" ? (
              <FaUserEdit className="w-4 h-4" />
            ) : (
              <FiTrash2 className="w-4 h-4" />
            )}
            <span className="sr-only">{getTitle()}</span>
          </button>
        </Tooltip>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/90 bg-opacity-50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto my-8 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                {getTitle()}
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {getContent()}
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setError(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-secondary transition-colors"
                    disabled={loading}
                  >
                    Cancel 
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-md text-white transition-colors ${
                      type === "delete"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-primary hover:bg-dark hover:text-light"
                    } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {type === "delete" ? "Deleting..." : "Saving..."}
                      </span>
                    ) : type === "delete" ? (
                      "Delete"
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManager;