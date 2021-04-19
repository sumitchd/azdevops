const authContext = new AuthenticationContext({
  clientId: "06a32d60-72a0-483e-b5a8-9a83552d7944",
});
authContext.handleWindowCallback();
// Only redirect to the main app if it's not in iframe
if (window === window.parent) {
  window.location.replace(location.origin + location.hash);
}