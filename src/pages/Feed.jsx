import { useCallback, useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { Link, useSearchParams } from "react-router";
import Post from "../components/Post";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { POST_CREATED_EVENT } from "../utils/events";
import { byNewestFirst } from "../utils/sort";

function Feed() {
  const { currentUser } = useAuth();
  // ?author=<id> narrows the feed to one person, which the user cards link to.
  // it lives in the URL so the filtered view can be linked to and gets back
  // and forward for free
  const [searchParams] = useSearchParams();
  const authorId = searchParams.get("author");
  const [posts, setPosts] = useState([]);
  const [usersById, setUsersById] = useState(() => new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    try {
      // /posts returns everyone's posts, the signed-in user's included, newest
      // first, or one author's when ?author= is set. post.likes is a bare list
      // of user ids, so the user list comes along to put names to them.
      const [postsResponse, usersResponse] = await Promise.all([
        api.get("/posts", authorId ? { params: { author: authorId } } : {}),
        api.get("/users/"),
      ]);
      // copied before sorting so the response array isn't reordered in place
      setPosts([...(postsResponse.data.data ?? [])].sort(byNewestFirst));
      setUsersById(
        new Map((usersResponse.data.data ?? []).map((user) => [user._id, user])),
      );
      setError(null);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "Could not reach the server. Is it running?",
      );
    } finally {
      setLoading(false);
    }
  }, [authorId]);

  // posts and comments both carry likes as bare user ids; this puts names to
  // them from the user list fetched alongside the feed
  const resolveLikers = useCallback(
    (ids = []) =>
      ids.map(
        // a like outlives the account that left it
        (id) => usersById.get(id) ?? { _id: id, name: "Unknown user" },
      ),
    [usersById],
  );

  // the API populates author with name/email/biography only, so the picture
  // comes out of the same user list that puts names to likes. undefined here
  // means "no picture", which Avatar renders as the default
  const resolveAvatar = useCallback(
    (userId) => (userId ? usersById.get(userId)?.imageUrl : undefined),
    [usersById],
  );

  // edit hands back the whole updated post, so it replaces just that card the
  // way a like does; delete only confirms, so the card goes by id
  const handlePostUpdated = useCallback((updated) => {
    setPosts((previous) =>
      previous.map((item) => (item._id === updated._id ? updated : item)),
    );
  }, []);

  const handlePostDeleted = useCallback((postId) => {
    setPosts((previous) => previous.filter((item) => item._id !== postId));
  }, []);

  // both like endpoints are idempotent and hand back the whole updated post,
  // so the reply replaces just that card rather than refetching the feed
  const toggleLike = useCallback(async (post) => {
    try {
      const response = post.likedByMe
        ? await api.delete(`/posts/${post._id}/likes`)
        : await api.post(`/posts/${post._id}/likes`);
      const updated = response.data.data;
      setPosts((previous) =>
        previous.map((item) => (item._id === updated._id ? updated : item)),
      );
      setError(null);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "Could not reach the server. Is it running?",
      );
    }
  }, []);

  // the await keeps setState out of the effect body, which the
  // react-hooks/set-state-in-effect rule flags as a cascading render
  useEffect(() => {
    (async () => {
      await fetchPosts();
    })();
  }, [fetchPosts]);

  // the navbar's Create Post button announces new posts on window; the reply it
  // carries is already the shape the feed renders, so it goes straight to the
  // top rather than costing a refetch. the id check keeps a post the feed has
  // already loaded from doubling up.
  useEffect(() => {
    const onPostCreated = (event) => {
      const created = event.detail;
      if (!created?._id) {
        return;
      }
      // a filtered feed only takes the new post when it belongs to the author
      // being shown, otherwise it would appear somewhere it doesn't belong
      if (authorId && created.author?._id !== authorId) {
        return;
      }
      setPosts((previous) =>
        previous.some((post) => post._id === created._id)
          ? previous
          : [created, ...previous],
      );
    };
    window.addEventListener(POST_CREATED_EVENT, onPostCreated);
    return () => window.removeEventListener(POST_CREATED_EVENT, onPostCreated);
  }, [authorId]);

  const authorName = authorId ? usersById.get(authorId)?.name : null;

  return (
    <Container className="mt-5">
      <Row>
        <Col md={8} className="mx-auto">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h1 className="h3 mb-0">
              {/* the name comes from the user list fetched alongside the posts,
                  so it fills in once that lands */}
              {authorId ? `Posts by ${authorName ?? "this user"}` : "Your Feed"}
            </h1>
            {authorId && (
              <Link to="/feed" className="flex-shrink-0 ms-3">
                Show all posts
              </Link>
            )}
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading && <p className="text-muted">Loading posts...</p>}
          {!loading && !error && posts.length === 0 && (
            <p className="text-muted">
              {authorId ? "This user hasn't posted yet." : "No posts yet."}
            </p>
          )}
          {posts.map((post) => (
            <Post
              key={post._id}
              post={post}
              currentUserId={currentUser?._id}
              isAdmin={currentUser?.isAdmin}
              onToggleLike={toggleLike}
              onPostUpdated={handlePostUpdated}
              onPostDeleted={handlePostDeleted}
              resolveLikers={resolveLikers}
              resolveAvatar={resolveAvatar}
            />
          ))}
        </Col>
      </Row>
    </Container>
  );
}

export default Feed;
