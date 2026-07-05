export let currentUser = null;

export function setCurrentUser(user) {
  currentUser = user;
}

export function clearCurrentUser() {
  currentUser = null;
}
