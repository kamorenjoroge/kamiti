"use client";
import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
import Tables from "../components/Tables";
import UserManager from "../components/Modal/UserManager";

type User = {
  _id: string;
  email: string;
  role: "admin" | "secretary";
  active: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type ApiResponse = {
  success: boolean;
  data: User[];
};

const Page = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get<ApiResponse>("/api/users");
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = useMemo<
    { header: string; accessor: keyof User; className: string }[]
  >(
    () => [
      {
        header: "User Details",
        accessor: "email",
        className: "min-w-[280px]",
      },
      {
        header: "Status",
        accessor: "active",
        className: "min-w-[100px]",
      },
      {
        header: "Created At",
        accessor: "createdAt",
        className: "hidden lg:table-cell min-w-[150px]",
      },
      {
        header: "Actions",
        accessor: "_id",
        className: "min-w-[150px]",
      },
    ],
    []
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderRow = useCallback(
    (user: User) => (
      <tr key={user._id} className="hover:bg-gray-50 border-b border-gray-200">
        {/* User Details Column - Email and Role combined */}
        <td className={`px-6 py-4 ${columns[0].className}`}>
          <div className="flex flex-col space-y-1">
            <div className="text-sm font-medium text-gray-900 break-all">
              {user.email}
            </div>
            <div className="flex items-center">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>
        </td>
        
        {/* Status Column */}
        <td className={`px-6 py-4 whitespace-nowrap ${columns[1].className}`}>
          <span
            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              user.active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {user.active ? "Active" : "Inactive"}
          </span>
        </td>
        
        {/* Created At Column - Hidden on smaller screens */}
        <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${columns[2].className}`}>
          {formatDate(user.createdAt)}
        </td>
        
        {/* Actions Column */}
        <td className={`px-6 py-4 whitespace-nowrap ${columns[3].className}`}>
          <div className="flex items-center space-x-2">
            <UserManager type="edit" user={user} onSuccess={fetchUsers} />
            <UserManager type="delete" user={user} onSuccess={fetchUsers} />
          </div>
        </td>
      </tr>
    ),
    [columns]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex space-x-2">
          <UserManager type="create" onSuccess={fetchUsers} />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <Tables
          columns={columns}
          data={users}
          renderRow={renderRow}
          itemsPerPage={10}
        />
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new user account.</p>
        </div>
      )}
    </div>
  );
};

export default Page;