package service

// EnqueueEvent records an analytics event without blocking the request path (agent/backend.md).
// userID nil = anonymous client.
func (s *Service) EnqueueEvent(userID *int64, eventName string, metadata map[string]any) {
	s.tracker.Enqueue(userID, eventName, metadata)
}
