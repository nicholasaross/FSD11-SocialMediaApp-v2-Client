import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { CiRedo } from "react-icons/ci";
import api from "../api/axios";

function RestoreSite() {
  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);
  const [restoring, setRestoring] = useState(false);

  const handleShow = () => {
    setError(null);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setError(null);
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError(null);
    try {
      await api.get("/restore");
      // the seeded data lands in page-level state all over the app, so a full
      // reload is the reliable way to pick it up everywhere at once
      window.location.reload();
    } catch (requestError) {
      // requireAdmin re-checks the token, so a 403 lands here
      setError(
        requestError.response?.data?.message ??
          "Could not reach the server. Is it running?",
      );
      setRestoring(false);
    }
  };

  return (
    <>
      <Button variant="outline-primary" size="sm" onClick={handleShow}>
        <CiRedo /> Restore Site
      </Button>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Restore Site</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-start">
          {error && <Alert variant="danger">{error}</Alert>}
          <p className="mb-0">
            This deletes <strong>every post and comment</strong> and reseeds
            five fresh posts per non-admin user. Accounts are left alone. This
            cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={restoring}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRestore} disabled={restoring}>
            {restoring ? "Restoring..." : "Restore Site"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default RestoreSite;
