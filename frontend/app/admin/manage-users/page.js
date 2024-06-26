"use client";
import React, { useState, useContext, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { UserContext } from "@/context/userContextProvider";
import UserSearch from "@/components/UserSearch";

export default function ManageUsersPage() {
  const { user } = useContext(UserContext);
  const [userId, setUserId] = useState("");
  const [userData, setUserData] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (user && user.token) {
      console.log(user.token);
    }
  });

  const formik = useFormik({
    initialValues: {
      userId: "",
      username: "",
      email: "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .required("username is required")
        .matches(
          /^[a-zA-Z0-9_-]{1,20}$/,
          'Username has to be 1-20 characters long and can only contain letters, numbers and "_", "-"'
        ),
      email: Yup.string()
        .required("Email is required")
        .matches(
          /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
          "Wrong email format"
        ),
    }),
    onSubmit: (values) => {
      handleEditUser(values);
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      newPassword: "",
    },
    validationSchema: Yup.object({
      newPassword: Yup.string().matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must be at least 8 characters long, cannot contain whitespaces, has to contain one lowercase letter, one uppercase letter, one number, and one special character"
      ),
    }),
    onSubmit: (values, { resetForm }) => {
      handlePasswordChange(values);
      resetForm();
    },
  });

  const handlePasswordChange = async (values) => {
    setMsg("changing password...");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}admin/editUser`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userData.id,
            password: values.newPassword,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMsg("Password changed successfully");
      } else {
        setMsg(data.error);
      }
    } catch (error) {
      setMsg("Error changing password", error);
    }
  };

  const handleEditUser = async (updatedUserData) => {
    setMsg("updating user...");
    console.log("edycja");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}admin/editUser`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userData.id,
            ...updatedUserData,
          }),
        }
      );

      if (response.ok) {
        setMsg("User updated successfully");
      } else if (response.status === 404) {
        setMsg("User not found");
      } else {
        setMsg("Error updating user");
      }
    } catch (error) {
      setMsg("Error updating user", error);
    }
  };

  const handleDeleteUser = async () => {
    setMsg("deleting...");
    console.log(userData.id);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}admin/deleteUser?userId=${userData.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setMsg("User deleted successfully");
        setUserData(null);
        setUserId("");
        formik.resetForm();
      } else if (response.status === 404) {
        setMsg("User not found");
      } else {
        setMsg("Error deleting user");
      }
    } catch (error) {
      setMsg("Error deleting user", error);
    }
  };

  const handleUserSelect = (user) => {
    setUserData(user);
    formik.setValues({
      userId: user.id,
      username: user.username,
      email: user.email,
    });
    setMsg("");
  };

  return (
    <section className="flex flex-col gap-3 p-3">
      <UserSearch onUserSelect={handleUserSelect} />
      {msg && <p className="msg">{msg}</p>}
      {userData && (
        <>
          <form className="form" onSubmit={formik.handleSubmit}>
            <h2>Change User Details</h2>
            <label>
              Username:
              <input
                type="text"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.username && formik.errors.username ? (
                <div className="error">{formik.errors.username}</div>
              ) : null}
            </label>
            <label>
              Email:
              <input
                type="text"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="error">{formik.errors.email}</div>
              ) : null}
            </label>
            <div className="buttons">
              <button type="submit" className="small-btn">
                Save Changes
              </button>
              <button
                className="small-btn bg-red-900"
                onClick={handleDeleteUser}
              >
                Delete User
              </button>
            </div>
          </form>
          <form className="form" onSubmit={passwordFormik.handleSubmit}>
            <h2>Change Password</h2>
            <label>
              New Password:
              <input
                type="text"
                name="newPassword"
                value={passwordFormik.values.newPassword}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
              />
              {passwordFormik.touched.newPassword &&
              passwordFormik.errors.newPassword ? (
                <div className="error">{passwordFormik.errors.newPassword}</div>
              ) : null}
            </label>
            <div className="buttons">
              <button className="small-btn">Change Password</button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
