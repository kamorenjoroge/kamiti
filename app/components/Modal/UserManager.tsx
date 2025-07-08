"use client";
import { FiTrash2, FiEye, FiPlus, FiX } from 'react-icons/fi';
import { IconType } from 'react-icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Tables from "../Tables";

type User = {
  _id: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type UserProps = {
  type: 'view' | 'create';
  onSuccess?: () => void;
  children?: React.ReactNode;
  buttonText?: string;
  buttonIcon?: IconType;
  buttonClassName?: string;
  modalTitle?: string;
};

const UserManager = ({
  type,
  onSuccess,
  children,
  buttonText = type === 'create' ? "Add User" : "View Users",
  buttonIcon: ButtonIcon = type === 'create' ? FiPlus : FiEye,
  buttonClassName = "inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium",
  modalTitle = type === 'create' ? "Add New User" : "User List"
}: UserProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("secretary");
  const [active, setActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (type === 'view' && open) {
      const fetchUsers = async () => {
        try {
          setLoading(true);
          const response = await axios.get('/api/users');
          if (response.data.success) {
            setUsers(response.data.data);
          } else {
            setError('Failed to fetch users');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }
  }, [type, open]);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role, active }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("User created successfully");
        setEmail("");
        setRole("secretary");
        setActive(true);
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to create user");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      const response = await axios.delete(`/api/users/${userToDelete._id}`);
      if (response.data.success) {
        setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
        toast.success('User deleted successfully');
        setShowDeleteModal(false);
        setUserToDelete(null);
        onSuccess?.();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Error deleting user');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  if (type === 'create') {
    return (
      <>
        {children ? (
          <div onClick={() => setOpen(true)}>{children}</div>
        ) : (
          <button onClick={() => setOpen(true)} className={buttonClassName}>
            {ButtonIcon && <ButtonIcon className="-ml-1 mr-2 h-5 w-5" />}
            {buttonText}
          </button>
        )}

        {open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="flex justify-between items-center border-b p-4">
                <h3 className="text-xl font-bold text-gray-800">{modalTitle}</h3>
                <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="secretary">Secretary</option>
                  <option value="admin">Admin</option>
                </select>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                  Active
                </label>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setOpen(false)} className="px-4 py-2 border rounded-lg">
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
                  >
                    {isLoading ? "Creating..." : "Create User"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {children ? (
        <div onClick={() => setOpen(true)}>{children}</div>
      ) : (
        <button onClick={() => setOpen(true)} className={buttonClassName}>
          {ButtonIcon && <ButtonIcon className="-ml-1 mr-2 h-5 w-5" />}
          {buttonText}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">{modalTitle}</h3>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading users...</p>
                </div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <Tables
                  columns={[
                    { header: "Email", accessor: "email" as const },
                    { header: "Role", accessor: "role" as const },
                    { header: "Active", accessor: "active" as const },
                    { header: "Actions", accessor: "_id" as const, className: "text-right" },
                  ]}
                  data={users}
                  renderRow={(item: User) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 text-sm">{item.email}</td>
                      <td className="px-6 py-4 text-sm">{item.role}</td>
                      <td className="px-6 py-4 text-sm">{item.active ? "Yes" : "No"}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="text-red-600 hover:text-red-900"
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

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the user {userToDelete?.email}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={handleCancelDelete} disabled={deleting} className="px-4 py-2 bg-gray-200 rounded-md">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded-md">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManager;
