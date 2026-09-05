import { useState } from "react";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import { BiLike } from "react-icons/bi";
import Avatar from "./Avatar";
import DeleteComment from "./DeleteComment";
import EditComment from "./EditComment";
import LikesLabel from "./LikesLabel";

function Comment({
  comment,
  currentUserId,
  isAdmin,
  postId,
  resolveLikers,
  resolveAvatar,
  onToggleLike,
  onCommentUpdated,
  onCommentDeleted,
}) {
  const [busy, setBusy] = useState(false);

  // the two rights differ server-side: only the author may edit, but an admin
  // may delete anyone's comment
  const isOwnComment =
    Boolean(currentUserId) && comment.author?._id === currentUserId;
  const canDelete = isOwnComment || Boolean(isAdmin);

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
      <div className="small text-muted d-flex align-items-center gap-2">
        <Avatar src={resolveAvatar?.(comment.author?._id)} />
        <span>
          {/* author populates to null once that account is deleted */}
          {comment.author?.name ?? "Deleted user"} &middot;{" "}
          {new Date(comment.createdAt).toLocaleString()}
        </span>
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
        {canDelete && (
          <div className="d-flex gap-2 ms-auto">
            {isOwnComment && (
              <EditComment
                comment={comment}
                postId={postId}
                onCommentUpdated={onCommentUpdated}
              />
            )}
            <DeleteComment
              comment={comment}
              postId={postId}
              onCommentDeleted={onCommentDeleted}
            />
          </div>
        )}
      </div>
    </ListGroup.Item>
  );
}

export default Comment;
