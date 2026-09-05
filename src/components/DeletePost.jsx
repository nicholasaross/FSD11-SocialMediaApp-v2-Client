import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { CiTrash } from "react-icons/ci";
import api from "../api/axios";

function DeletePost({ post, onPostDeleted }) {
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
      await api.delete(`/posts/${post._id}`);
      // the reply carries only a message, so the caller drops the post by id
      onPostDeleted?.(post._id);
    } catch (requestError) {
      // the server matches on author too, so someone else's post is a 404
      setError(
        requestError.response?.data?.message ??
          "Could not reach the server. Is it running?",
      );
      setDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={handleShow}
        aria-label="Delete post"
        title="Delete post"
      >
        <CiTrash size={18} />
      </Button>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Post</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-start">
          {error && <Alert variant="danger">{error}</Alert>}
          <p className="mb-0">
            Permanently delete this post? Its comments and likes go too. This
            cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete Post"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DeletePost;
