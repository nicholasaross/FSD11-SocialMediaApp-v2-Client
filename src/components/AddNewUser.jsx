import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import api from "../api/axios";

const EMPTY_FORM = {
  name: "",
  username: "",
  email: "",
  password: "",
  biography: "",
  imageUrl: "",
};

function AddNewUser({ onUserAdded }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setShow(false);
    setForm(EMPTY_FORM);
    setError(null);
  };

  const handleShow = () => setShow(true);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    // only send optional fields when filled so the schema defaults apply
    const payload = { ...form };
    if (!payload.imageUrl.trim()) delete payload.imageUrl;
    if (!payload.biography.trim()) delete payload.biography;

    try {
      // signup returns a token for the new account; ignore it so the current
      // session stays as-is and just refresh the list
      await api.post("/users/signup", payload);
      onUserAdded?.();
      handleClose();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "Could not reach the server. Is it running?",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-end mb-4">
        <Button variant="primary" onClick={handleShow}>
          Add New User
        </Button>
      </div>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Add New User</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-start">
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3" controlId="newUserName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ada Lovelace"
                minLength={3}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newUserUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="adalovelace"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newUserEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ada@example.com"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newUserPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newUserBiography">
              <Form.Label>Biography</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="biography"
                value={form.biography}
                onChange={handleChange}
                placeholder="A short bio (optional)"
              />
            </Form.Group>
            <Form.Group controlId="newUserImageUrl">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
              />
              <Form.Text muted>
                Leave blank to use the default avatar.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Add User"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default AddNewUser;
