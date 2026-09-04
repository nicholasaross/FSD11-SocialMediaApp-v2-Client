import { useCallback, useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Post from "../components/Post";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { byNewestFirst } from "../utils/sort";

function Feed() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [usersById, setUsersById] = useState(() => new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    try {
      // /posts returns everyone's posts newest first; the API has no "everyone
      // but me" filter, so the author check happens here. post.likes is a bare
      // list of user ids, so the user list comes along to put names to them.
      const [postsResponse, usersResponse] = await Promise.all([
        api.get("/posts"),
        api.get("/users/"),
      ]);
      const all = postsResponse.data.data ?? [];
      setPosts(
        all
          .filter((post) => post.author?._id !== currentUser?._id)
          .sort(byNewestFirst),
      );
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
  }, [currentUser?._id]);

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

  return (
    <Container className="mt-5">
      <Row>
        <Col md={8} className="mx-auto">
          <h1 className="h3 mb-4">Your Feed</h1>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading && <p className="text-muted">Loading posts...</p>}
          {!loading && !error && posts.length === 0 && (
            <p className="text-muted">No posts from other users yet.</p>
          )}
          {posts.map((post) => (
            <Post
              key={post._id}
              post={post}
              currentUserId={currentUser?._id}
              onToggleLike={toggleLike}
              resolveLikers={resolveLikers}
            />
          ))}
        </Col>
      </Row>
    </Container>
  );
}

export default Feed;
