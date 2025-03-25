import React, { useState, useEffect } from "react";
import userService from "../services/users";
import { Link } from "react-router-dom";
import styles from "../styles/Users.module.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    //grabs user from local stoarge if user is present

    userService.getAll().then((userList) => {
      setUsers(userList);
    });
  }, []);

  return (
    <div className="pageContainer">
      <table className={styles.tableStyles}>
        <thead>
          <th>Name</th>
          <th>Blogs Created</th>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user?.id}>
              {console.log("User in map: ", user)}
              <td>
                <Link to={`/users/${user.id}`}>{user.username}</Link>
              </td>
              <td className={styles.numberColStyle}>
                {user.blogs?.length || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
