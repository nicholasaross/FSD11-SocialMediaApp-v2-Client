import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { CiEdit } from "react-icons/ci";
import api from "../api/axios";

// the server caps post content at 280 characters
const MAX_CONTENT = 280;

function buildForm(post) {
  return { content: post.content ?? "", imageUrl: post.imageUrl ?? "" };
}

function EditPost({ post, onPostUpdated }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(() => buildForm(post));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // re-seed from the post each time the modal opens so a cancelled edit
  // doesn't leave stale values behind
  const handleShow = () => {
    setForm(buildForm(post));
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

    // imageUrl goes even when blank: the server $unsets the picture on an empty
    // value, which is the only way to take one off a post
    const payload = {
      content: form.content.trim(),
      imageUrl: form.imageUrl.trim(),
    };

    try {
      const response = await api.patch(`/posts/${post._id}`, payload);
      // the reply is the whole updated post, in the shape the feed renders
      onPostUpdated?.(response.data.data);
      setShow(false);
    } catch (requestError) {
      // the server matches on author too, so someone else's post is a 404
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
        aria-label="Edit post"
        title="Edit post"
      >
        <CiEdit size={18} />
      </Button>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Post</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-start">
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3" controlId={`editPost-${post._id}`}>
              <Form.Label>Post</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="content"
                value={form.content}
                onChange={handleChange}
                minLength={3}
                maxLength={MAX_CONTENT}
                required
              />
              <Form.Text muted>
                {MAX_CONTENT - form.content.length} characters left.
              </Form.Text>
            </Form.Group>
            <Form.Group controlId={`editPostImage-${post._id}`}>
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
              />
              <Form.Text muted>
                Clear this field to remove the picture.
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

export default EditPost;
