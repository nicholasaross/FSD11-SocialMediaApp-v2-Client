import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import { BiLike } from "react-icons/bi";
import Avatar from "./Avatar";
import Comment from "./Comment";
import DeletePost from "./DeletePost";
import EditPost from "./EditPost";
import LikesLabel from "./LikesLabel";
import api from "../api/axios";
import { plural } from "../utils/plural";
import { byNewestFirst } from "../utils/sort";

// the server caps a comment at 280 characters, same as a post
const MAX_COMMENT = 280;

// a dead picture shouldn't leave a broken-image icon behind, but the failure
// has to be react state: setting img.hidden in the error handler put the node
// in a state react never clears, so one hiccup on a first, uncached load hid
// the picture until a full page reload. the img is keyed by attempt so a retry
// builds a fresh node, which is what actually re-requests the file.
function PostImage({ src }) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return null;
  }

  return (
    <Card.Img
      key={attempt}
      variant="top"
      src={src}
      alt=""
      // one retry covers a transient failure; a genuinely dead url fails twice
      onError={() =>
        attempt === 0 ? setAttempt(attempt + 1) : setFailed(true)
      }
    />
  );
}

function Post({
  post,
  currentUserId,
  isAdmin,
  resolveLikers,
  resolveAvatar,
  onToggleLike,
  onPostUpdated,
  onPostDeleted,
}) {
  const [busy, setBusy] = useState(false);
  const [showComments, setShowComments] = useState(false);
  // null means "not fetched yet", which is what keeps the request lazy
  const [comments, setComments] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  // kept apart from commentsError so a failed submit shows by the box that
  // caused it rather than in the list above
  const [draftError, setDraftError] = useState(null);

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

  // edit hands back the whole updated comment, so it replaces just that row;
  // delete only confirms, so the row goes by id. the derived count below
  // follows the list, so both keep the "N comments" label honest
  const handleCommentUpdated = (updated) => {
    setComments((previous) =>
      previous.map((item) => (item._id === updated._id ? updated : item)),
    );
  };

  const handleCommentDeleted = (commentId) => {
    setComments((previous) => previous.filter((item) => item._id !== commentId));
  };

  const handleAddComment = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) {
      return;
    }
    setPosting(true);
    setDraftError(null);
    try {
      const response = await api.post(`/posts/${post._id}/comments`, {
        content,
      });
      // the reply is the populated comment, already the shape this list
      // renders, so it goes straight in. previous is null when the post had no
      // comments to fetch, and the new one is then the whole list
      const created = response.data.data;
      setComments((previous) => (previous ? [created, ...previous] : [created]));
      // the first comment on a post is written with the list closed; open it so
      // the comment doesn't just vanish into a collapsed section
      setShowComments(true);
      setDraft("");
    } catch (requestError) {
      setDraftError(
        requestError.response?.data?.message ??
          "Could not reach the server. Is it running?",
      );
    } finally {
      setPosting(false);
    }
  };

  // once the comments are loaded the local list is the truth, since it also
  // carries anything added here; before that the server's count is all we have
  const commentCount = comments ? comments.length : (post.commentCount ?? 0);
  const commentLabel = plural(commentCount, "comment");

  // a post with no comments always offers the box; once it has some, the box
  // belongs with them and appears only when they do
  const showCommentForm = commentCount === 0 || showComments;

  // the feed mixes the signed-in user's posts in with everyone else's, so their
  // own are ringed in the same primary blue the buttons use
  const isOwnPost = Boolean(currentUserId) && post.author?._id === currentUserId;

  return (
    <Card
      className={`mb-4 text-start${isOwnPost ? " border-primary border-3" : ""}`}
    >
      {/* keyed by url so editing the picture starts a fresh attempt rather
          than inheriting the old one's failure */}
      {post.imageUrl && (
        <PostImage key={post.imageUrl} src={post.imageUrl} />
      )}
      <Card.Body>
        <Card.Subtitle className="mb-2 text-muted d-flex align-items-center gap-2">
          <Avatar src={resolveAvatar?.(post.author?._id)} />
          <span>
            {/* author populates to null once that account is deleted */}
            {post.author?.name ?? "Deleted user"} &middot;{" "}
            {new Date(post.createdAt).toLocaleString()}
          </span>
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
          {commentCount > 0 ? (
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
          {/* the server matches on author for both, so these only go to the
              author; ms-auto parks them at the far end of the row */}
          {isOwnPost && (
            <div className="d-flex gap-2 ms-auto">
              <EditPost post={post} onPostUpdated={onPostUpdated} />
              <DeletePost post={post} onPostDeleted={onPostDeleted} />
            </div>
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
              resolveAvatar={resolveAvatar}
              isAdmin={isAdmin}
              postId={post._id}
              onToggleLike={handleToggleCommentLike}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
            />
          ))}
        </ListGroup>
      )}
      {showCommentForm && (
        <Card.Footer className="bg-transparent">
          {draftError && (
            <Alert variant="danger" className="py-2">
              {draftError}
            </Alert>
          )}
          <Form onSubmit={handleAddComment}>
            {/* every post renders one of these, so the id carries the post id
                to keep it unique on the page */}
            <Form.Group controlId={`comment-draft-${post._id}`}>
              <Form.Label visuallyHidden>Add a comment</Form.Label>
              {/* a plain flex row rather than an InputGroup: that joins the two
                  edge to edge and squares off the inner corners, which a gap
                  would leave on show */}
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Add a comment..."
                  maxLength={MAX_COMMENT}
                  // posting into a list still loading would be overwritten by
                  // the reply that lands after it
                  disabled={posting || loadingComments}
                />
                <Button
                  type="submit"
                  className="flex-shrink-0"
                  disabled={posting || loadingComments || !draft.trim()}
                >
                  {posting ? "Posting..." : "Comment"}
                </Button>
              </div>
            </Form.Group>
          </Form>
        </Card.Footer>
      )}
    </Card>
  );
}

export default Post;
