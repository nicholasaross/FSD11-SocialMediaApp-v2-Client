import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { CiTrash } from "react-icons/ci";
import api from "../api/axios";

function DeleteUser({ user, onUserDeleted }) {
  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleShow = () => {
    setError(null);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setError(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await api.delete(`/users/${user._id}`);
      onUserDeleted?.();
      setShow(false);
    } catch (requestError) {
      // the server re-checks admin rights, so a 403 lands here if the token
      // says otherwise
      setError(
        requestError.response?.data?.message ??
          "Could not reach the server. Is it running?",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Button variant="outline-danger" onClick={handleShow}>
        <CiTrash /> Delete
      </Button>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-start">
          {error && <Alert variant="danger">{error}</Alert>}
          <p className="mb-0">
            Permanently delete <strong>{user.name}</strong>? Their posts,
            comments and likes go too. This cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete User"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DeleteUser;
