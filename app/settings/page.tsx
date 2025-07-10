"use client";
import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
import Tables from "../components/Tables";
import UserManager from "../components/Modal/UserManager";

type User = {
  _id: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type ApiResponse = {
  success: boolean;
  data: User[];
};

const UsersPage = () => {
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
        header: "Email",
        accessor: "email",
        className: "min-w-[250px]",
      },
      {
        header: "Role",
        accessor: "role",
        className: "min-w-[100px]",
      },
      {
        header: "Status",
        accessor: "active",
        className: "min-w-[100px]",
      },
      {
        header: "Created At",
        accessor: "createdAt",
        className: "hidden md:table-cell min-w-[150px]",
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
      <tr key={user._id} className="hover:bg-gray-50">
        <td className={`px-6 py-4 whitespace-nowrap ${columns[0].className}`}>
          <div className="text-sm font-medium text-gray-900">{user.email}</div>
        </td>
        <td className={`px-6 py-4 whitespace-nowrap ${columns[1].className}`}>
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              user.role === "admin"
                ? "bg-purple-100 text-purple-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {user.role}
          </span>
        </td>
        <td className={`px-6 py-4 whitespace-nowrap ${columns[2].className}`}>
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              user.active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {user.active ? "Active" : "Inactive"}
          </span>
        </td>
        <td
          className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${columns[3].className}`}
        >
          {formatDate(user.createdAt)}
        </td>
        <td
          className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${columns[4].className}`}
        >
          <div className="flex justify-start space-x-2">
            <td
              className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${columns[4].className}`}
            >
              <div className="flex items-center space-x-1">
                <UserManager type="edit" user={user} onSuccess={fetchUsers} />
                <UserManager type="delete" user={user} onSuccess={fetchUsers} />
                
              </div>
            </td>
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
      <div className="mb-6 mt-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Accounts</h1>

        <div className="flex space-x-2">
          <UserManager type="create" onSuccess={fetchUsers} />
        </div>
      </div>
      <Tables
        columns={columns}
        data={users}
        renderRow={renderRow}
        itemsPerPage={10}
      />
    </div>
  );
};

export default UsersPage;
