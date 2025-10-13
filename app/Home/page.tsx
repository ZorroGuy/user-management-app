"use client";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import {
  addUser,
  deleteUser,
  updateUser,
  User,
} from "../redux/slices/userSlice";
import CustomTable from "../components/CustomTable/CustomTable";
import Modal from "../components/Model/Model";
import CustomForm from "../components/CustomForm/CustomForm";
import "./Home.css";

const Homepage: React.FC = () => {
  const users = useSelector((state: RootState) => state.users.users);
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const openAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  const handleSubmit = (user: User) => {
    if (editingUser) {
      dispatch(updateUser(user));
    } else {
      user.id = String(Date.now());
      dispatch(addUser(user));
    }
    setIsModalOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    dispatch(deleteUser(id));
  };

  return (
    <div className="homepage-container">
      <div className="homepage-header">
        <h1 className="homepage-title">User Management</h1>
        <button className="btn-add-user" onClick={openAddModal}>
          + Add User
        </button>
      </div>

      <div className="table-container">
        <CustomTable
          users={users}
          onEdit={openEditModal}
          onDelete={handleDeleteUser}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit User" : "Add User"}
      >
        <CustomForm
          initialValues={editingUser || undefined}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Homepage;
