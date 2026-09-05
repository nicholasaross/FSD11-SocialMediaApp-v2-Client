import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { CiEdit } from "react-icons/ci";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function buildForm(user) {
  return {
    name: user.name ?? "",
    username: user.username ?? "",
    email: user.email ?? "",
    biography: user.biography ?? "",
    imageUrl: user.imageUrl ?? "",
  };
}

function EditUser({ user, onUserUpdated }) {
  const { updateCurrentUser } = useAuth();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(() => buildForm(user));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // re-seed from the user each time the modal opens so a cancelled edit
  // doesn't leave stale values behind
  const handleShow = () => {
    setForm(buildForm(user));
    setError(null);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setError(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    // clearing the field removes the picture: server treats empty imageUrl as
    // none, and the card falls back to the default avatar
    const payload = {
      name: form.name,
      username: form.username,
      email: form.email,
      biography: form.biography,
      imageUrl: form.imageUrl.trim(),
    };

    try {
      const response = await api.put(`/users/${user._id}`, payload);
      // the reply is the updated account: hand it to the session so editing
      // your own profile doesn't leave the navbar on login-time values. it is
      // a no-op when an admin edits somebody else
      updateCurrentUser(response.data.data);
      onUserUpdated?.();
      setShow(false);
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
      <Button variant="primary" onClick={handleShow}>
        <CiEdit /> Edit
      </Button>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-start">
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3" controlId={`editName-${user._id}`}>
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={form.name}
                onChange={handleChange}
                minLength={3}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId={`editUsername-${user._id}`}>
              <Form.Label>Username</Form.Label>
              <Form.Control
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId={`editEmail-${user._id}`}>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId={`editBiography-${user._id}`}>
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
            <Form.Group controlId={`editImageUrl-${user._id}`}>
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
              />
              <Form.Text muted>
                Clear this field to fall back to the default avatar.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default EditUser;
