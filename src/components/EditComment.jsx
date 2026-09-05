import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { CiEdit } from "react-icons/ci";
import api from "../api/axios";

// the server caps a comment at 280 characters, same as a post
const MAX_COMMENT = 280;

function EditComment({ comment, postId, onCommentUpdated }) {
  const [show, setShow] = useState(false);
  const [content, setContent] = useState(comment.content ?? "");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // re-seed from the comment each time the modal opens so a cancelled edit
  // doesn't leave stale text behind
  const handleShow = () => {
    setContent(comment.content ?? "");
    setError(null);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await api.patch(
        `/posts/${postId}/comments/${comment._id}`,
        { content: content.trim() },
      );
      // the reply is the whole updated comment, in the shape the list renders
      onCommentUpdated?.(response.data.data);
      setShow(false);
    } catch (requestError) {
      // the server matches on author too, so someone else's comment is a 404
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
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={handleShow}
        aria-label="Edit comment"
        title="Edit comment"
      >
        <CiEdit size={18} />
      </Button>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Comment</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-start">
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group controlId={`editComment-${comment._id}`}>
              <Form.Label>Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={MAX_COMMENT}
                required
              />
              <Form.Text muted>
                {MAX_COMMENT - content.length} characters left.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={saving || !content.trim()}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default EditComment;
