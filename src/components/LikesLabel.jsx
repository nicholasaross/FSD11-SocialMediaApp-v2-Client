import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { plural } from "../utils/plural";

// the same "N likes" control serves a post and each of its comments: plain
// text until someone has liked, then a popover naming them
function LikesLabel({ id, count = 0, likers = [], currentUserId }) {
  const label = plural(count, "like");

  if (count === 0) {
    return <span>{label}</span>;
  }

  return (
    <OverlayTrigger
      trigger="click"
      rootClose
      placement="top"
      overlay={
        <Popover id={`likes-${id}`}>
          <Popover.Header as="h3">Liked by</Popover.Header>
          <Popover.Body className="p-0">
            <ListGroup variant="flush">
              {likers.map((liker) => (
                <ListGroup.Item key={liker._id} className="py-2">
                  {liker._id === currentUserId ? (
                    <strong>{liker.name}</strong>
                  ) : (
                    liker.name
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Popover.Body>
        </Popover>
      }
    >
      <Button variant="link" className="p-0 border-0 align-baseline text-muted">
        {label}
      </Button>
    </OverlayTrigger>
  );
}

export default LikesLabel;
