"use client";

import React, { useState } from "react";
import "./CustomTable.css";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { toast } from "react-toastify";
import { CustomTableProps } from "./types";

const CustomTable: React.FC<CustomTableProps> = ({
  users,
  onEdit,
  onDelete,
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (onDelete) {
      Swal.fire({
        title: "Are you sure?",
        text: "This will delete the user!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          onDelete(id);
          toast.success("User deleted successfully!");
        }
      });
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">#</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">LinkedIn URL</th>
            <th className="p-2 border">Gender</th>
            <th className="p-2 border">Edit</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => {
            const isExpanded = expandedRow === user.id;
            return (
              <React.Fragment key={user.id}>
                <tr className="border-b">
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border">{user.name}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">
                    <a
                      href={user.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {user.linkedin}
                    </a>
                  </td>
                  <td className="p-2 border">{user.gender}</td>
                  <td className="p-2 border flex gap-2 items-center">
                    <button onClick={() => onEdit(user)}>
                      <FaEdit className="text-blue-500" />
                    </button>
                    <button onClick={() => handleDelete(user.id)}>
                      <FaTrash className="text-red-500" />
                    </button>
                    <button
                      onClick={() =>
                        setExpandedRow(isExpanded ? null : user.id)
                      }
                    >
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="p-2 border">
                      <div>
                        <p>
                          <strong>Line 1:</strong> {user.address.line1}
                        </p>
                        <p>
                          <strong>Line 2:</strong> {user.address.line2}
                        </p>
                        <p>
                          <strong>State:</strong> {user.address.state}
                        </p>
                        <p>
                          <strong>City:</strong> {user.address.city}
                        </p>
                        <p>
                          <strong>PIN:</strong> {user.address.pin}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CustomTable;
