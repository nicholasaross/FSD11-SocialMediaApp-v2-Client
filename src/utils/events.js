// window events used to talk between components that don't share a parent,
// the same trick api/axios.js uses to tell AuthProvider a token was rejected.
// the constant lives here so the dispatcher and the listener can't drift.
export const POST_CREATED_EVENT = "post:created";
