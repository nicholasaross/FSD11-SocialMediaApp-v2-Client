import { useCallback, useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import AddNewUser from "../components/AddNewUser";
import User from "../components/User";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { DEFAULT_AVATAR } from "../utils/avatar";

// swap in the local default when a stored imageUrl fails to load; the guard
// stops an endless loop if the default itself is missing
const handleImageError = (event, user) => {
  console.error(`Image failed to load for ${user.name}: ${user.imageUrl}`);
  if (!event.target.src.endsWith(DEFAULT_AVATAR)) {
    event.target.src = DEFAULT_AVATAR;
  }
};

function Landing() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);

  // the route only mounts this page when a token exists, so there is no
  // signed-out case to guard here
  const fetchUsers = useCallback(async () => {
    try {
      // responses are wrapped as { status, timestamp, data }; the list lives in data
      const response = await api.get("/users/");
      setUsers(response.data.data ?? []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  // the await keeps setState out of the effect body, which the
  // react-hooks/set-state-in-effect rule flags as a cascading render
  useEffect(() => {
    (async () => {
      await fetchUsers();
    })();
  }, [fetchUsers]);

  return (
    <Container className="mt-5 text-center">
      <AddNewUser onUserAdded={fetchUsers} />
      <Row>
        {users.length > 0 ? (
          users.map((user) => (
            <Col key={user._id} md={4} className="mb-4">
              <User
                user={user}
                currentUserId={currentUser?._id}
                isAdmin={currentUser?.isAdmin}
                onEdit={fetchUsers}
                onDelete={fetchUsers}
                onImageError={handleImageError}
              />
            </Col>
          ))
        ) : (
          <p>No users found.</p>
        )}
      </Row>
    </Container>
  );
}

export default Landing;
