package worker

import (
	"database/sql"
	"log"
	"time"

	"github.com/Fotoro/Fotoro-Server/internal/database"
	"github.com/Fotoro/Fotoro-Server/internal/storage"
	"github.com/Fotoro/Fotoro-Server/internal/thumbnail"
)

// StartThumbnailWorker launches a background goroutine that processes
// pending thumbnail generation jobs from the database.
// It runs forever, polling every 5 seconds when idle.
func StartThumbnailWorker(db *database.DB, store *storage.Storage) {
	go func() {
		for {
			// Fetch one pending job
			var jobID int
			var photoID string
			err := db.QueryRow(`
				SELECT id, photo_id FROM jobs
				WHERE job_type = 'thumbnail' AND status = 'pending'
				ORDER BY created_at LIMIT 1
			`).Scan(&jobID, &photoID)

			if err == sql.ErrNoRows {
				// No jobs – wait and try again
				time.Sleep(5 * time.Second)
				continue
			}
			if err != nil {
				log.Printf("worker: error fetching job: %v", err)
				time.Sleep(5 * time.Second)
				continue
			}

			// Mark as processing
			db.Exec(`UPDATE jobs SET status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, jobID)

			// Get photo details
			photo, err := db.GetPhoto(photoID)
			if err != nil || photo == nil {
				db.Exec(`UPDATE jobs SET status = 'failed', last_error = 'photo not found' WHERE id = ?`, jobID)
				continue
			}

			photoPath := store.PhotoPath(photo.ID, photo.Filename)
			thumbPath := store.ThumbnailPath(photo.ID)

			// Generate the thumbnail
			err = thumbnail.Generate(photoPath, thumbPath)
			if err != nil {
				// Increment attempt count and log error
				db.Exec(`UPDATE jobs SET status = 'pending', attempts = attempts + 1, last_error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, err.Error(), jobID)

				// Check attempts – if >= 3, mark as permanently failed
				var attempts int
				db.QueryRow("SELECT attempts FROM jobs WHERE id = ?", jobID).Scan(&attempts)
				if attempts >= 3 {
					db.Exec(`UPDATE jobs SET status = 'failed' WHERE id = ?`, jobID)
				}
			} else {
				// Success
				db.Exec(`UPDATE jobs SET status = 'done', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, jobID)
			}
		}
	}()
}