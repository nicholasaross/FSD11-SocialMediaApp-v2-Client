// "1 like" / "2 likes" — shared by the post and comment like labels
export const plural = (count, noun) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;
