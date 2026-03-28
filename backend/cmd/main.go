package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/fluxystack/akademiweal/backend/internal/auth"
	"github.com/fluxystack/akademiweal/backend/internal/db"
	"github.com/fluxystack/akademiweal/backend/internal/handler"
	"github.com/fluxystack/akademiweal/backend/internal/repository"
	"github.com/fluxystack/akademiweal/backend/internal/service"
	"github.com/fluxystack/akademiweal/backend/internal/tracking"
	"github.com/joho/godotenv"
)

// listenAddr prefers HTTP_ADDR if set (legacy). Then PORT (Vercel/Railway/Render convention).
// Otherwise HTTP_HOST + HTTP_PORT. Empty HTTP_HOST means listen on all interfaces (":port").
func listenAddr() string {
	if a := strings.TrimSpace(os.Getenv("HTTP_ADDR")); a != "" {
		return a
	}
	// PaaS platforms (Vercel, Railway, Render, Fly) inject PORT and expect 0.0.0.0:$PORT.
	if p := strings.TrimSpace(os.Getenv("PORT")); p != "" {
		return ":" + p
	}
	host := strings.TrimSpace(os.Getenv("HTTP_HOST"))
	port := strings.TrimSpace(os.Getenv("HTTP_PORT"))
	if port == "" {
		port = "9001"
	}
	if host == "" {
		return ":" + port
	}
	return host + ":" + port
}

func main() {
	// Load ./.env then overlay backend/.env so Supabase DATABASE_URL in backend/.env wins over any repo-root .env.
	if os.Getenv("VERCEL") == "" {
		_ = godotenv.Load(".env")
		_ = godotenv.Overload(filepath.Join("backend", ".env"))
	}

	defer func() {
		if r := recover(); r != nil {
			log.Println("PANIC:", r)
		}
	}()

	database, err := db.OpenFromEnv()
	if err != nil {
		log.Printf("[WARN] failed to open database: %v", err)
	}

	if database != nil {
		defer func() {
			if err := database.Close(); err != nil {
				log.Printf("database close: %v", err)
			}
		}()
	}

	signer, err := auth.NewSignerFromEnv()
	if err != nil {
		log.Printf("[FATAL]failed to init jwt: %v", err)
	}

	repo := repository.New(database)
	evtTracker := tracking.New(repo)
	svc := service.New(repo, signer, evtTracker)
	h := handler.New(svc, signer)

	addr := listenAddr()

	server := &http.Server{
		Addr:         addr,
		Handler:      h.Routes(),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("starting backend server on %s\n", addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Printf("[FATAL]server failed: %v", err)
	}
}
