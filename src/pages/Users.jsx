import { useState } from "react";
import {
  Users as UsersIcon,
  Search,
  X,
  UserRound
} from "lucide-react";
import "./Users.css";

function Users() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const users = [
    {
      id: 1,
      name: "Rohit Kumar",
      role: "Worker",
      department: "Cold Chain Operations",
      status: "Active"
    },
    {
      id: 2,
      name: "Aman Sharma",
      role: "Worker",
      department: "Warehouse",
      status: "Active"
    },
    {
      id: 3,
      name: "Priya Singh",
      role: "Auditor",
      department: "Quality Control",
      status: "Active"
    },
    {
      id: 4,
      name: "Rahul Verma",
      role: "Manager",
      department: "Operations",
      status: "Active"
    }
  ];

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="users-page">

      {/* Header */}

      <div className="users-header">

        <div>
          <h1>Users</h1>
          <p>Manage workers and operational users.</p>
        </div>

        <div className="users-icon">
          <UsersIcon size={22} />
        </div>

      </div>


      {/* Search */}

      <div className="users-search">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>


      {/* Users Table */}

      <div className="users-table-card">

        <div className="users-table">

          <div className="table-header">
            <span>User</span>
            <span>Role</span>
            <span>Department</span>
            <span>Status</span>
            <span>Action</span>
          </div>


          {filteredUsers.length > 0 ? (

            filteredUsers.map((user) => (

              <div className="table-row" key={user.id}>

                <div className="user-name">

                  <div className="user-avatar">
                    <UserRound size={17} />
                  </div>

                  <span>{user.name}</span>

                </div>

                <span>{user.role}</span>

                <span>{user.department}</span>

                <span>
                  <span className="status-active">
                    {user.status}
                  </span>
                </span>

                <button
                  className="view-user-button"
                  onClick={() => setSelectedUser(user)}
                >
                  View Profile
                </button>

              </div>

            ))

          ) : (

            <div className="no-users">
              No users found.
            </div>

          )}

        </div>

      </div>


      {/* User Modal */}

      {selectedUser && (

        <div
          className="user-modal-overlay"
          onClick={() => setSelectedUser(null)}
        >

          <div
            className="user-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="user-modal-header">

              <div>
                <h2>{selectedUser.name}</h2>
                <p>User Profile</p>
              </div>

              <button
                className="user-modal-close"
                onClick={() => setSelectedUser(null)}
              >
                <X size={20} />
              </button>

            </div>


            <div className="user-profile">

              <div className="large-avatar">
                <UserRound size={30} />
              </div>

              <div className="profile-details">

                <div>
                  <span>Role</span>
                  <strong>{selectedUser.role}</strong>
                </div>

                <div>
                  <span>Department</span>
                  <strong>{selectedUser.department}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong className="profile-status">
                    {selectedUser.status}
                  </strong>
                </div>

              </div>

            </div>


            <div className="user-modal-footer">

              <button
                className="close-user-button"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Users;