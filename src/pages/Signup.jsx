import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

const EMPTY_FORM = {
  name: "",
  username: "",
  email: "",
  password: "",
  biography: "",
  imageUrl: "",
};

function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    // only send optional fields when filled so the server defaults apply
    const payload = { ...form };
    if (!payload.imageUrl.trim()) delete payload.imageUrl;
    if (!payload.biography.trim()) delete payload.biography;

    try {
      await signup(payload);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "Could not reach the server. Is it running?",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: 460 }}>
      <Card>
        <Card.Body className="text-start">
          <Card.Title className="mb-3">Sign Up</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="signupName">
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
            <Form.Group className="mb-3" controlId="signupUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="adalovelace"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="signupEmail">
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
            <Form.Group className="mb-3" controlId="signupPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="signupBiography">
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
            <Form.Group className="mb-3" controlId="signupImageUrl">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
              />
              <Form.Text muted>Leave blank to use the default avatar.</Form.Text>
            </Form.Group>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="w-100"
            >
              {submitting ? "Creating account..." : "Sign Up"}
            </Button>
          </Form>
          <p className="mt-3 mb-0 text-center">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Signup;
