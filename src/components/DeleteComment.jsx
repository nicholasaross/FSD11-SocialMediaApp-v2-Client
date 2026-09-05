import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { CiTrash } from "react-icons/ci";
import api from "../api/axios";

function DeleteComment({ comment, postId, onCommentDeleted }) {
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
      await api.delete(`/posts/${postId}/comments/${comment._id}`);
      // the reply carries only a message, so the caller drops the comment by id
      onCommentDeleted?.(comment._id);
    } catch (requestError) {
      // the server re-checks author-or-admin, so a 403 lands here
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
        aria-label="Delete comment"
        title="Delete comment"
      >
        <CiTrash size={18} />
      </Button>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-start">
          {error && <Alert variant="danger">{error}</Alert>}
          <p className="mb-0">
            Permanently delete this comment by{" "}
            <strong>{comment.author?.name ?? "a deleted user"}</strong>? This
            cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete Comment"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DeleteComment;
