// Shown while data loads, and when a request fails.
export function Loading() {
  return (
    <div className="text-center text-secondary py-5">
      <div className="spinner-border spinner-border-sm me-2"></div>
      Loading...
    </div>
  );
}

export function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="alert alert-danger py-2" role="alert">
      <i className="bi bi-exclamation-triangle me-2"></i>
      {message}
    </div>
  );
}
