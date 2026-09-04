// newest first. /posts already arrives sorted this way but /posts/:id/comments
// comes back oldest first, so both are sorted here to keep the feed consistent
// regardless of what the API hands back.
export const byNewestFirst = (a, b) =>
  new Date(b.createdAt) - new Date(a.createdAt);
