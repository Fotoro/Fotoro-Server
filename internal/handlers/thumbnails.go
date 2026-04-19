package handlers

import (
	"github.com/gofiber/fiber/v2"

	"github.com/Fotoro/Fotoro-Server/internal/database"
	"github.com/Fotoro/Fotoro-Server/internal/storage"
	"github.com/Fotoro/Fotoro-Server/internal/thumbnail"
)

// GetThumbnailHandler handles GET /thumbnails/:id
// Returns thumbnail — generates it if it doesn't exist yet
func GetThumbnailHandler(db *database.DB, store *storage.Storage) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		photo, err := db.GetPhoto(id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "database error"})
		}
		if photo == nil {
			return c.Status(404).JSON(fiber.Map{"error": "photo not found"})
		}

		thumbPath := store.ThumbnailPath(id)

		// Generate thumbnail if it doesn't exist yet
		// This handles the case where background generation hasn't finished
		if !store.ThumbnailExists(id) {
			photoPath := store.PhotoPath(photo.ID, photo.Filename)
			if err := thumbnail.Generate(photoPath, thumbPath); err != nil {
				return c.Status(500).JSON(fiber.Map{
					"error": "could not generate thumbnail",
				})
			}
		}

		// Tell browser to cache thumbnail forever
		// Thumbnails never change so this is safe
		c.Set("Cache-Control", "public, max-age=31536000, immutable")

		return c.SendFile(thumbPath)
	}
}