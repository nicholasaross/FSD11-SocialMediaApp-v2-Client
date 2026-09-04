import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import { BiLike } from "react-icons/bi";
import Comment from "./Comment";
import LikesLabel from "./LikesLabel";
import api from "../api/axios";
import { plural } from "../utils/plural";
import { byNewestFirst } from "../utils/sort";

function Post({ post, currentUserId, resolveLikers, onToggleLike }) {
  const [busy, setBusy] = useState(false);
  const [showComments, setShowComments] = useState(false);
  // null means "not fetched yet", which is what keeps the request lazy
  const [comments, setComments] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

  // the parent owns the request and swaps in the post the server returns; this
  // only needs to keep the button quiet while that is in flight
  const handleToggleLike = async () => {
    setBusy(true);
    try {
      await onToggleLike?.(post);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setShowComments(true);
    if (comments) {
      return;
    }
    setLoadingComments(true);
    setCommentsError(null);
    try {
      const response = await api.get(`/posts/${post._id}/comments`);
      setComments([...(response.data.data ?? [])].sort(byNewestFirst));
    } catch (requestError) {
      setCommentsError(
        requestError.response?.data?.message ??
          "Could not reach the server. Is it running?",
      );
    } finally {
      setLoadingComments(false);
    }
  };

  // both comment like endpoints hand back the whole updated comment, so the
  // reply replaces just that row
  const handleToggleCommentLike = async (comment) => {
    try {
      const path = `/posts/${post._id}/comments/${comment._id}/likes`;
      const response = comment.likedByMe
        ? await api.delete(path)
        : await api.post(path);
      const updated = response.data.data;
      setComments((previous) =>
        previous.map((item) => (item._id === updated._id ? updated : item)),
      );
      setCommentsError(null);
    } catch (requestError) {
      setCommentsError(
        requestError.response?.data?.message ??
          "Could not reach the server. Is it running?",
      );
    }
  };

  const commentLabel = plural(post.commentCount ?? 0, "comment");

  return (
    <Card className="mb-4 text-start">
      {post.imageUrl && (
        <Card.Img
          variant="top"
          src={post.imageUrl}
          alt=""
          // a dead picture shouldn't leave a broken-image icon behind
          onError={(event) => {
            event.target.hidden = true;
          }}
        />
      )}
      <Card.Body>
        <Card.Subtitle className="mb-2 text-muted">
          {/* author populates to null once that account is deleted */}
          {post.author?.name ?? "Deleted user"} &middot;{" "}
          {new Date(post.createdAt).toLocaleString()}
        </Card.Subtitle>
        <Card.Text>{post.content}</Card.Text>
        <div className="d-flex align-items-center gap-3 small text-muted">
          <Button
            variant={post.likedByMe ? "primary" : "outline-primary"}
            size="sm"
            onClick={handleToggleLike}
            disabled={busy}
            aria-pressed={Boolean(post.likedByMe)}
          >
            <BiLike /> {post.likedByMe ? "Unlike" : "Like"}
          </Button>
          <LikesLabel
            id={post._id}
            count={post.likeCount}
            likers={resolveLikers?.(post.likes) ?? []}
            currentUserId={currentUserId}
          />
          {/* nothing to open when the post has no comments */}
          {post.commentCount > 0 ? (
            <Button
              variant="link"
              className="p-0 border-0 align-baseline text-muted"
              onClick={handleToggleComments}
              aria-expanded={showComments}
            >
              {commentLabel}
            </Button>
          ) : (
            <span>{commentLabel}</span>
          )}
        </div>
      </Card.Body>
      {showComments && (
        <ListGroup variant="flush">
          {loadingComments && (
            <ListGroup.Item className="small text-muted">
              Loading comments...
            </ListGroup.Item>
          )}
          {commentsError && (
            <ListGroup.Item>
              <Alert variant="danger" className="mb-0">
                {commentsError}
              </Alert>
            </ListGroup.Item>
          )}
          {comments?.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              currentUserId={currentUserId}
              resolveLikers={resolveLikers}
              onToggleLike={handleToggleCommentLike}
            />
          ))}
        </ListGroup>
      )}
    </Card>
  );
}

export default Post;
