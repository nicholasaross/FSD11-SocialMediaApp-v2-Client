import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { Link } from "react-router";
import DeleteUser from "./DeleteUser";
import EditUser from "./EditUser";
import { DEFAULT_AVATAR } from "../utils/avatar";

function User({ user, currentUserId, isAdmin, onEdit, onDelete, onImageError }) {
  const isOwnAccount = Boolean(currentUserId) && user._id === currentUserId;
  // requireSelfOrAdmin: you may PUT your own account, and an admin may PUT
  // anyone's. the server updates only the fields the body carries, so a
  // password and admin rights survive an edit made from this form
  const canEdit = isOwnAccount || Boolean(isAdmin);
  // admins may remove anyone; their own card keeps Edit instead, since
  // deleting yourself would pull the account out from under the session
  const canDelete = Boolean(isAdmin) && !isOwnAccount;

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Img
          className="user-avatar d-block mx-auto"
          src={user.imageUrl || DEFAULT_AVATAR}
          alt={user.name}
          onError={(event) => onImageError?.(event, user)}
        />
        <Card.Title>{user.name}</Card.Title>
        <Card.Text as="div">
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
          {user.biography && <p>{user.biography}</p>}
        </Card.Text>
        <div className="d-flex justify-content-center gap-2">
          {/* ?author= narrows the feed to this user, which is the only thing
              that reads the API's author filter */}
          <Button
            as={Link}
            to={`/feed?author=${user._id}`}
            variant="outline-primary"
          >
            Feed
          </Button>
          {canEdit && <EditUser user={user} onUserUpdated={onEdit} />}
          {canDelete && <DeleteUser user={user} onUserDeleted={onDelete} />}
        </div>
      </Card.Body>
    </Card>
  );
}

export default User;
