import { useState, useEffect } from "react";
import "./App.css";
import { Button, Container, Row, Col } from "react-bootstrap";
import User from "./components/User";
import AddNewUser from "./components/AddNewUser";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { useAuth } from "./context/AuthContext";
import api from "./api/axios";

const DEFAULT_AVATAR = "/assets/default.png";

function App() {
  const { token, currentUser, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [authMode, setAuthMode] = useState("login");

  const fetchUsers = async () => {
    try {
      // responses are wrapped as { status, timestamp, data }; the list lives in data
      const response = await api.get("/users/");
      setUsers(response.data.data ?? []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }
    let active = true;
    (async () => {
      try {
        const response = await api.get("/users/");
        if (active) setUsers(response.data.data ?? []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  // swap in the local default when a stored imageUrl fails to load; the guard
  // stops an endless loop if the default itself is missing
  const handleImageError = (event, user) => {
    console.error(`Image failed to load for ${user.name}: ${user.imageUrl}`);
    if (!event.target.src.endsWith(DEFAULT_AVATAR)) {
      event.target.src = DEFAULT_AVATAR;
    }
  };

  if (!token) {
    return authMode === "login" ? (
      <Login onSwitch={() => setAuthMode("signup")} />
    ) : (
      <Signup onSwitch={() => setAuthMode("login")} />
    );
  }

  return (
    <Container className="mt-5 text-center">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted">
          Signed in as {currentUser?.name ?? currentUser?.username}
        </span>
        <Button variant="outline-secondary" size="sm" onClick={logout}>
          Log Out
        </Button>
      </div>
      <h1 className="display-4">Welcome to Full Stack Integration</h1>
      <AddNewUser onUserAdded={fetchUsers} />
      <Row>
        {users.length > 0 ? (
          users.map((user) => (
            <Col key={user._id} md={4} className="mb-4">
              <User
                user={user}
                currentUserId={currentUser?._id}
                onEdit={fetchUsers}
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

export default App;
