import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { FcVoicePresentation } from "react-icons/fc";
import RestoreSite from "./RestoreSite";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

function AppNavbar() {
  const { token, currentUser, logout } = useAuth();

  return (
    <Navbar expand="sm" bg="light" className="mb-3">
      <Container fluid>
        <div className="d-flex align-items-center gap-2">
          <Navbar.Brand
            as={Link}
            to="/"
            className="mb-0 d-flex align-items-center gap-2"
          >
            {/* decorative: the wordmark beside it already names the app */}
            <FcVoicePresentation size={32} aria-hidden="true" />
            Social Media App v2
          </Navbar.Brand>
          {currentUser?.isAdmin && <RestoreSite />}
          {token && (
            <Button
              as={Link}
              to="/feed"
              variant="primary"
              className="feed-button ms-3"
            >
              Feed
            </Button>
          )}
        </div>
        {/* logged out there is nothing to collapse, so the toggle goes too */}
        {token && (
          <>
            <Navbar.Toggle aria-controls="main-navbar" />
            <Navbar.Collapse id="main-navbar" className="justify-content-end">
              <Nav className="align-items-sm-center gap-2">
                <Navbar.Text>
                  Signed in as {currentUser?.name ?? currentUser?.username}
                </Navbar.Text>
                <Button variant="outline-secondary" onClick={logout}>
                  Log Out
                </Button>
              </Nav>
            </Navbar.Collapse>
          </>
        )}
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
