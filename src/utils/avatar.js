// the local stand-in shown for a user with no picture set
export const DEFAULT_AVATAR = "/assets/default.png";

// swap in the default when a stored imageUrl fails to load; the guard stops an
// endless loop if the default itself is missing
export const handleAvatarError = (event) => {
  if (!event.target.src.endsWith(DEFAULT_AVATAR)) {
    event.target.src = DEFAULT_AVATAR;
  }
};
