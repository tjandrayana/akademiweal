package handler

import (
	"context"
	"errors"
	"net/http"
	"strings"
)

// listLessonsClientGone reports whether err is only because the client disconnected or the
// request context was canceled. pgx/driver errors do not always unwrap to context.Canceled
// in a way errors.Is recognizes, so we also match when the request is already done.
func listLessonsClientGone(r *http.Request, err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, context.Canceled) {
		return true
	}
	if ce := r.Context().Err(); ce != nil && errors.Is(err, ce) {
		return true
	}
	if errors.Is(err, context.DeadlineExceeded) && r.Context().Err() != nil {
		if errors.Is(r.Context().Err(), context.DeadlineExceeded) {
			return true
		}
	}
	// Request already canceled (e.g. browser navigated away); error text may still be driver-specific.
	if errors.Is(r.Context().Err(), context.Canceled) {
		msg := strings.ToLower(err.Error())
		if strings.Contains(msg, "context canceled") ||
			strings.Contains(msg, "canceling request") {
			return true
		}
	}
	return false
}
