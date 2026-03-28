package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/joho/godotenv"
	"github.com/fluxystack/akademiweal/backend/internal/auth"
	"github.com/fluxystack/akademiweal/backend/internal/db"
	"github.com/fluxystack/akademiweal/backend/internal/handler"
	"github.com/fluxystack/akademiweal/backend/internal/repository"
	"github.com/fluxystack/akademiweal/backend/internal/service"
	"github.com/fluxystack/akademiweal/backend/internal/tracking"
)

func main() {
	// Load the first existing file: ./.env (when cwd is backend/) or backend/.env (when cwd is repo root).
	for _, p := range []string{".env", filepath.Join("backend", ".env")} {
		if err := godotenv.Load(p); err == nil {
			break
		}
	}

	database, err := db.OpenFromEnv()
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}
	defer func() {
		if err := database.Close(); err != nil {
			log.Printf("database close: %v", err)
		}
	}()

	signer, err := auth.NewSignerFromEnv()
	if err != nil {
		log.Fatalf("failed to init jwt: %v", err)
	}

	repo := repository.New(database)
	evtTracker := tracking.New(repo)
	svc := service.New(repo, signer, evtTracker)
	h := handler.New(svc, signer)

	addr := os.Getenv("HTTP_ADDR")
	if addr == "" {
		addr = ":9001"
	}

	server := &http.Server{
		Addr:         addr,
		Handler:      h.Routes(),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("starting backend server on %s\n", addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server failed: %v", err)
	}
}
