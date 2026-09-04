import Card from "react-bootstrap/Card";
import DeleteUser from "./DeleteUser";
import EditUser from "./EditUser";

const DEFAULT_AVATAR = "/assets/default.png";

function User({ user, currentUserId, isAdmin, onEdit, onDelete, onImageError }) {
  // server only lets you PUT your own account (403 otherwise), so edit shows
  // only on the signed-in user's own card
  const isOwnAccount = Boolean(currentUserId) && user._id === currentUserId;
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
        {isOwnAccount && <EditUser user={user} onUserUpdated={onEdit} />}
        {canDelete && <DeleteUser user={user} onUserDeleted={onDelete} />}
      </Card.Body>
    </Card>
  );
}

export default User;
