import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Modal, Table, Button, TextInput, Toast } from "flowbite-react";
import {
  HiOutlineExclamationCircle,
  HiTrash,
  HiDownload,
  HiPlus,
  HiPencilAlt,
  HiCheckCircle,
  HiXCircle,
} from "react-icons/hi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";

const departments = ["SSG", "SSO", "SSD"];

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    username: "",
    email: "",
    department: "",
    role: "staff",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [addErrorMessage, setAddErrorMessage] = useState("");
  const [addSuccessMessage, setAddSuccessMessage] = useState("");
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [editSuccessMessage, setEditSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `/api/user/getusers?excludeUserId=${currentUser._id}`
        );
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
          if (data.users.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (["admin", "superAdmin"].includes(currentUser.role)) {
      fetchUsers();
    }
  }, [currentUser._id, currentUser.role]);

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = users.filter((user) => {
      const matchesName =
        user.firstname.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.lastname.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.middlename.toLowerCase().includes(lowerCaseSearchTerm);
      const matchesDepartment = user.department
        .toLowerCase()
        .includes(lowerCaseSearchTerm);
      const matchesRole = user.role.toLowerCase().includes(lowerCaseSearchTerm);
      return matchesName || matchesDepartment || matchesRole;
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleShowMore = async () => {
    const startIndex = users.length;
    try {
      const res = await fetch(
        `/api/user/getusers?startIndex=${startIndex}&excludeUserId=${currentUser._id}`
      );
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => [...prev, ...data.users]);
        if (data.users.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`/api/user/delete-user/${userIdToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete));
        setShowModal(false);
        setSuccessMessage("User deleted successfully.");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        console.log(data.message);
        setErrorMessage(data.message);
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (error) {
      console.log(error.message);
      setErrorMessage("Error deleting user.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const checkSuperAdminExists = () => {
    return users.some((user) => user.role === "superAdmin");
  };

  const handleSaveEditUser = async () => {
    if (currentUser.role !== "superAdmin" && userToEdit.role === "superAdmin") {
      setEditErrorMessage("Only superAdmins can assign the superAdmin role.");
      return;
    }

    if (
      currentUser.role === "admin" &&
      (userToEdit.role === "superAdmin" || userToEdit.role === "admin")
    ) {
      setEditErrorMessage("Admins cannot assign admin or superAdmin roles.");
      return;
    }

    if (userToEdit.role === "superAdmin" && checkSuperAdminExists()) {
      setEditErrorMessage("There can only be one superAdmin.");
      return;
    }

    try {
      const res = await fetch(`/api/user/update-user/${userToEdit._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userToEdit),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((user) => (user._id === userToEdit._id ? data : user))
        );
        setEditSuccessMessage("User updated successfully.");
        setTimeout(() => {
          setEditSuccessMessage("");
          setShowEditModal(false); // Close modal after success message disappears
        }, 3000);
      } else {
        console.log(data.message);
        setEditErrorMessage(data.message);
        setTimeout(() => setEditErrorMessage(""), 3000);
      }
    } catch (error) {
      console.log(error.message);
      setEditErrorMessage("Error updating user.");
      setTimeout(() => setEditErrorMessage(""), 3000);
    }
  };

  const handleAddUser = async () => {
    if (currentUser.role !== "superAdmin" && userToEdit.role === "superAdmin") {
      setAddErrorMessage("Only superAdmins can assign the superAdmin role.");
      return;
    }

    if (
      currentUser.role === "admin" &&
      (userToEdit.role === "superAdmin" || userToEdit.role === "admin")
    ) {
      setAddErrorMessage("Admins cannot assign admin or superAdmin roles.");
      return;
    }

    if (userToEdit.role === "superAdmin" && checkSuperAdminExists()) {
      setAddErrorMessage("There can only be one superAdmin.");
      return;
    }

    try {
      const res = await fetch(`/api/auth/createuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userToEdit),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => [...prev, data.user]);
        setAddSuccessMessage("User added successfully.");
        setTimeout(() => {
          setAddSuccessMessage("");
          setShowAddModal(false); // Close modal after success message disappears
        }, 3000);
      } else {
        console.log(data.message);
        setAddErrorMessage(data.message);
        setTimeout(() => setAddErrorMessage(""), 3000);
      }
    } catch (error) {
      console.log(error.message);
      setAddErrorMessage("Error adding user.");
      setTimeout(() => setAddErrorMessage(""), 3000);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setUserToEdit({ ...userToEdit, [e.target.id]: e.target.value });
  };

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setShowEditModal(true);
  };

  const handleAddUserModal = () => {
    setUserToEdit({
      firstname: "",
      middlename: "",
      lastname: "",
      username: "",
      email: "",
      department: "",
      role: "staff",
      password: "",
    });
    setShowAddModal(true);
  };

  return (
    <div className="container mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500 overflow-x-auto">
      {successMessage && (
        <Toast className="fixed top-4 right-4 z-50">
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
            <HiCheckCircle className="h-5 w-5" />
          </div>
          <div className="ml-3 text-sm font-normal">{successMessage}</div>
          <Toast.Toggle />
        </Toast>
      )}
      {errorMessage && (
        <Toast className="fixed top-4 right-4 z-50">
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
            <HiXCircle className="h-5 w-5" />
          </div>
          <div className="ml-3 text-sm font-normal">{errorMessage}</div>
          <Toast.Toggle />
        </Toast>
      )}
      <div className="p-3 w-full overflow-x-auto flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
          All Users
        </h1>
      </div>

      <div className="mb-4 w-full flex items-center justify-between">
        <div className="flex-grow mr-4">
          <TextInput
            type="text"
            placeholder="Search by name, department, or role..."
            rightIcon={AiOutlineSearch}
            className="w-full sm:w-96"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={handleAddUserModal}
          color="blue"
          className="flex items-center"
        >
          <HiPlus className="w-5 h-5 mr-2 -ml-1" />
          Add user
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table
          hoverable
          className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400"
        >
          <Table.Head className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Username</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Department</Table.HeadCell>
            <Table.HeadCell>Role</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
            {filteredUsers.map((user) => (
              <Table.Row
                key={user._id}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Table.Cell className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      className="w-10 h-10 rounded-full"
                      src={user.profilePicture}
                      alt={user.username}
                    />
                    <div className="ml-4">
                      <div className="text-base font-semibold text-gray-900 dark:text-white">
                        {user.firstname} {user.middlename} {user.lastname}
                      </div>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell className="px-6 py-4">{user.username}</Table.Cell>
                <Table.Cell className="px-6 py-4">{user.email}</Table.Cell>
                <Table.Cell className="px-6 py-4">{user.department}</Table.Cell>
                <Table.Cell className="px-6 py-4">{user.role}</Table.Cell>
                <Table.Cell className="px-6 py-4">
                  <div className="flex items-center ml-auto space-x-2 sm:space-x-3">
                    <Button onClick={() => handleEditUser(user)} color="blue">
                      <HiPencilAlt className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button
                      onClick={() => {
                        setShowModal(true);
                        setUserIdToDelete(user._id);
                      }}
                      color="failure"
                    >
                      <HiTrash className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        {showMore && (
          <button
            onClick={handleShowMore}
            className="w-full text-teal-500 self-center text-sm py-7"
          >
            Show more
          </button>
        )}
      </div>
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this user?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteUser}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Add User Modal */}
      <Modal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        size="2xl"
      >
        <Modal.Header>Add new user</Modal.Header>
        <Modal.Body>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddUser();
            }}
          >
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="firstname"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  First Name
                </label>
                <TextInput
                  id="firstname"
                  type="text"
                  placeholder="First Name"
                  value={userToEdit.firstname}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="middlename"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Middle Name
                </label>
                <TextInput
                  id="middlename"
                  type="text"
                  placeholder="Middle Name"
                  value={userToEdit.middlename}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="lastname"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Last Name
                </label>
                <TextInput
                  id="lastname"
                  type="text"
                  placeholder="Last Name"
                  value={userToEdit.lastname}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Username
                </label>
                <TextInput
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={userToEdit.username}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email
                </label>
                <TextInput
                  id="email"
                  type="text"
                  placeholder="Email"
                  value={userToEdit.email}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="department"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Department
                </label>
                <div className="flex space-x-4">
                  {departments.map((dept) => (
                    <label key={dept} className="flex items-center">
                      <input
                        type="radio"
                        id="department"
                        name="department"
                        value={dept}
                        checked={userToEdit.department === dept}
                        onChange={handleChange}
                        className="form-radio"
                      />
                      <span className="ml-2">{dept}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <div className="relative">
                  <TextInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={userToEdit.password}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center text-sm leading-5">
                    <button type="button" onClick={togglePasswordVisibility}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
              {currentUser.role === "superAdmin" && (
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="role"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Role
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        id="role"
                        name="role"
                        value="admin"
                        checked={userToEdit.role === "admin"}
                        onChange={handleChange}
                        className="form-radio"
                      />
                      <span className="ml-2">Admin</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        id="role"
                        name="role"
                        value="staff"
                        checked={userToEdit.role === "staff"}
                        onChange={handleChange}
                        className="form-radio"
                      />
                      <span className="ml-2">Staff</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            {addErrorMessage && (
              <div className="mb-4 text-red-500">{addErrorMessage}</div>
            )}
            {addSuccessMessage && (
              <div className="mb-4 text-green-500">{addSuccessMessage}</div>
            )}
            <div className="items-center p-6 border-t border-gray-200 rounded-b dark:border-gray-700">
              <Button
                type="submit"
                gradientDuoTone="pinkToOrange"
                className="w-full"
              >
                Save all
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        size="2xl"
      >
        <Modal.Header>Edit user</Modal.Header>
        <Modal.Body>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveEditUser();
            }}
          >
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="firstname"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  First Name
                </label>
                <TextInput
                  id="firstname"
                  type="text"
                  placeholder="First Name"
                  value={userToEdit.firstname}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="middlename"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Middle Name
                </label>
                <TextInput
                  id="middlename"
                  type="text"
                  placeholder="Middle Name"
                  value={userToEdit.middlename}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="lastname"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Last Name
                </label>
                <TextInput
                  id="lastname"
                  type="text"
                  placeholder="Last Name"
                  value={userToEdit.lastname}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Username
                </label>
                <TextInput
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={userToEdit.username}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email
                </label>
                <TextInput
                  id="email"
                  type="text"
                  placeholder="Email"
                  value={userToEdit.email}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="department"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Department
                </label>
                <div className="flex space-x-4">
                  {departments.map((dept) => (
                    <label key={dept} className="flex items-center">
                      <input
                        type="radio"
                        id="department"
                        name="department"
                        value={dept}
                        checked={userToEdit.department === dept}
                        onChange={handleChange}
                        className="form-radio"
                      />
                      <span className="ml-2">{dept}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <div className="relative">
                  <TextInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={userToEdit.password}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center text-sm leading-5">
                    <button type="button" onClick={togglePasswordVisibility}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
              {currentUser.role === "superAdmin" && (
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="role"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Role
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        id="role"
                        name="role"
                        value="admin"
                        checked={userToEdit.role === "admin"}
                        onChange={handleChange}
                        className="form-radio"
                      />
                      <span className="ml-2">Admin</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        id="role"
                        name="role"
                        value="staff"
                        checked={userToEdit.role === "staff"}
                        onChange={handleChange}
                        className="form-radio"
                      />
                      <span className="ml-2">Staff</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            {editErrorMessage && (
              <div className="mb-4 text-red-500">{editErrorMessage}</div>
            )}
            {editSuccessMessage && (
              <div className="mb-4 text-green-500">{editSuccessMessage}</div>
            )}
            <div className="items-center p-6 border-t border-gray-200 rounded-b dark:border-gray-700">
              <Button
                type="submit"
                gradientDuoTone="pinkToOrange"
                className="w-full"
              >
                Save all
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
