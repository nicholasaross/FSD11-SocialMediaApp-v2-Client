import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import api from "../api/axios";
import { POST_CREATED_EVENT } from "../utils/events";

const EMPTY_FORM = { content: "", imageUrl: "" };

// client-side validation: the server will also enforce this
const MAX_CONTENT = 280;

function CreatePost() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleShow = () => {
    setForm(EMPTY_FORM);
    setError(null);
    setCreated(false);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setForm(EMPTY_FORM);
    setError(null);
    setCreated(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    // a fresh edit means they're writing another post, so drop the receipt
    setCreated(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    // the author comes from the token, so content and the optional picture are
    // the whole payload; an empty imageUrl would fail the URL validator
    const payload = { content: form.content.trim() };
    if (form.imageUrl.trim()) payload.imageUrl = form.imageUrl.trim();

    try {
      const response = await api.post("/posts", payload);
      // this button lives in the navbar, with no parent in common with the
      // feed, so the created post is announced on window for a mounted feed to
      // pick up. the reply is the fully populated post the feed renders.
      window.dispatchEvent(
        new CustomEvent(POST_CREATED_EVENT, { detail: response.data.data }),
      );
      // nothing is visible behind the modal on other pages, so it stays open
      // to confirm the post landed
      setForm(EMPTY_FORM);
      setCreated(true);
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
      <Button
        variant="primary"
        className="navbar-action-button"
        onClick={handleShow}
      >
        Create Post
      </Button>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Create Post</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-start">
            {error && <Alert variant="danger">{error}</Alert>}
            {created && (
              <Alert variant="success">
                Post created. Write another, or close this window.
              </Alert>
            )}
            <Form.Group className="mb-3" controlId="newPostContent">
              <Form.Label>Post</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="What's on your mind?"
                minLength={3}
                maxLength={MAX_CONTENT}
                required
              />
              <Form.Text muted>
                {MAX_CONTENT - form.content.length} characters left.
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="newPostImageUrl">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
              />
              <Form.Text muted>Leave blank to post text only.</Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} disabled={saving}>
              {created ? "Close" : "Cancel"}
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? "Posting..." : "Post"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default CreatePost;
