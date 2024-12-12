import { useEffect, useState } from "react";
import ApiClients, { CanceledError } from "../services/Api-clients";

interface Users {
  id: number;
  name: string;
  email: string;
}

const FetchingData = () => {
  const [user, setUser] = useState<Users[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editedName, setEditedName] = useState<string>("");

  const controller = new AbortController();

  useEffect(() => {
    setLoading(true);
    ApiClients.get<Users[]>("/users", {
      signal: controller.signal,
    })
      .then((response) => {
        setUser(response.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof CanceledError) return;
        setError(err.message);
        setLoading(false);
      });

    // Cleanup the controller on component unmount
    return () => controller.abort();
  }, []);

  // Add user
  const addUsers = () => {
    const originalUser = [...user];
    const newUser = { id: 0, name: "Amanuel", email: "amanuel@gmail.com" };
    setUser([newUser, ...user]);
    ApiClients.post("/users/", newUser)
      .then(({ data: savedUser }) => setUser([savedUser.data, ...user]))
      .catch((err) => {
        setError(err.message);
        setUser(originalUser);
      });
  };

  // Delete user
  const deleteUser = (userToDelete: Users) => {
    const originalUser = [...user];
    setUser((prevUsers) =>
      prevUsers.filter((user) => user.id !== userToDelete.id)
    );
    ApiClients.delete("/users/" + userToDelete.id).catch((err) => {
      setError(err.message);
      setUser(originalUser);
    });
  };

  // Edit user - Enter edit mode
  const handleEditClick = (userToEdit: Users) => {
    setEditingUserId(userToEdit.id);
    setEditedName(userToEdit.name);
  };

  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value);
  };

  // Update user after editing
  const updateUser = (userToUpdate: Users) => {
    const originalUser = [...user];
    const updatedUser = { ...userToUpdate, name: editedName };

    setUser((prevUsers) =>
      prevUsers.map((u) => (u.id === userToUpdate.id ? updatedUser : u))
    );

    ApiClients.patch("/users/" + userToUpdate.id, updatedUser).catch((err) => {
      setUser(originalUser);
      setError(err.message);
    });

    // Exit edit mode
    setEditingUserId(null);
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditingUserId(null); // Exit edit mode without saving
    setEditedName(""); // Reset the edited name
  };

  return (
    <>
      <div>
        {error && <pre>{error}</pre>}
        {/* {isLoading && <div className="spinner-border"></div>} */}

        <button className="btn btn-primary" onClick={addUsers}>
          Add
        </button>

        <ul className="list-group">
          {user.map((user) => (
            <li
              key={user.id}
              className="list-group-item d-flex justify-content-between"
            >
              {editingUserId === user.id ? (
                <>
                  <input
                    type="text"
                    value={editedName}
                    onChange={handleNameChange}
                    className="form-control"
                  />
                  <button
                    className="btn btn-outline-success mx-2"
                    onClick={() => updateUser(user)}
                  >
                    Update
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {user.name}
                  <div>
                    <button
                      className="btn btn-outline-secondary mx-2"
                      onClick={() => handleEditClick(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => deleteUser(user)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default FetchingData;
