import { useState } from "react";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import { BiLike } from "react-icons/bi";
import LikesLabel from "./LikesLabel";

function Comment({ comment, currentUserId, resolveLikers, onToggleLike }) {
  const [busy, setBusy] = useState(false);

  // the post owns the request and swaps in the comment the server returns
  const handleToggleLike = async () => {
    setBusy(true);
    try {
      await onToggleLike?.(comment);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ListGroup.Item>
      <div className="small text-muted">
        {/* author populates to null once that account is deleted */}
        {comment.author?.name ?? "Deleted user"} &middot;{" "}
        {new Date(comment.createdAt).toLocaleString()}
      </div>
      <div>{comment.content}</div>
      <div className="d-flex align-items-center gap-3 small text-muted mt-2">
        <Button
          variant={comment.likedByMe ? "primary" : "outline-primary"}
          size="sm"
          onClick={handleToggleLike}
          disabled={busy}
          aria-pressed={Boolean(comment.likedByMe)}
        >
          <BiLike /> {comment.likedByMe ? "Unlike" : "Like"}
        </Button>
        <LikesLabel
          id={comment._id}
          count={comment.likeCount}
          likers={resolveLikers?.(comment.likes) ?? []}
          currentUserId={currentUserId}
        />
      </div>
    </ListGroup.Item>
  );
}

export default Comment;
