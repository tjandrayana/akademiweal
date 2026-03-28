package auth

import "context"

type userIDKey struct{}

// ContextWithUserID attaches the authenticated user id (from verified JWT only).
func ContextWithUserID(ctx context.Context, userID int64) context.Context {
	return context.WithValue(ctx, userIDKey{}, userID)
}

// UserIDFromContext returns user_id set by auth middleware.
func UserIDFromContext(ctx context.Context) (int64, bool) {
	v := ctx.Value(userIDKey{})
	if v == nil {
		return 0, false
	}
	id, ok := v.(int64)
	return id, ok
}
