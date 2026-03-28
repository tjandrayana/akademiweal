package tracking

import (
	"context"
	"log"
	"time"

	"github.com/fluxystack/akademiweal/backend/internal/repository"
)

const (
	queueSize  = 256
	insertTimeout = 5 * time.Second
)

type job struct {
	userID *int64
	name   string
	meta   map[string]any
}

// Tracker buffers events and writes them in a background worker so HTTP handlers stay fast.
type Tracker struct {
	repo *repository.Repository
	ch   chan job
}

// New starts a single worker goroutine that drains the queue.
func New(repo *repository.Repository) *Tracker {
	t := &Tracker{
		repo: repo,
		ch:   make(chan job, queueSize),
	}
	go t.run()
	return t
}

func (t *Tracker) run() {
	for j := range t.ch {
		ctx, cancel := context.WithTimeout(context.Background(), insertTimeout)
		err := t.repo.InsertEvent(ctx, j.userID, j.name, j.meta)
		cancel()
		if err != nil {
			log.Printf("events: insert failed: %v", err)
		}
	}
}

// Enqueue is non-blocking for the caller: returns after handing off to the buffer, or drops on overflow.
func (t *Tracker) Enqueue(userID *int64, name string, meta map[string]any) {
	if meta == nil {
		meta = map[string]any{}
	}
	select {
	case t.ch <- job{userID: userID, name: name, meta: meta}:
	default:
		uid := int64(0)
		if userID != nil {
			uid = *userID
		}
		log.Printf("events: queue full, dropping %s for user %d", name, uid)
	}
}
