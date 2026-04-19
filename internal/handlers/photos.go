package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/Fotoro/Fotoro-Server/internal/database"
	"github.com/Fotoro/Fotoro-Server/internal/storage"
)
// ListPhotosHandler handles GET /photos
// Supports pagination: GET /photos?page=1&limit=100
func ListPhotosHandler(db *database.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		page := c.QueryInt("page", 1)
		limit := c.QueryInt("limit", 100)

		if limit > 100 {
			limit = 100
		}
		if limit < 1 {
			limit = 1
		}

		photos, total, err := db.ListPhotos(page, limit)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": "could not fetch photos",
			})
		}

		totalPages := total / limit
		if total%limit != 0 {
			totalPages++
		}

		return c.JSON(fiber.Map{
			"photos":      photos,
			"total":       total,
			"page":        page,
			"limit":       limit,
			"total_pages": totalPages,
		})
	}
}
// GetPhotoHandler handles GET /photos/:id
// Returns full resolution photo file
func GetPhotoHandler(db *database.DB, store *storage.Storage) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		photo, err := db.GetPhoto(id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "database error"})
		}
		if photo == nil {
			return c.Status(404).JSON(fiber.Map{"error": "photo not found"})
		}

		photoPath := store.PhotoPath(photo.ID, photo.Filename)
		return c.SendFile(photoPath)
	}
}

// DeletePhotoHandler handles DELETE /photos/:id
func DeletePhotoHandler(db *database.DB, store *storage.Storage) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		photo, err := db.GetPhoto(id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "database error"})
		}
		if photo == nil {
			return c.Status(404).JSON(fiber.Map{"error": "photo not found"})
		}

		// Delete from disk
		if err := store.DeletePhoto(photo.ID, photo.Filename); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "could not delete file"})
		}

		// Delete from database
		if err := db.DeletePhoto(id); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "could not delete metadata"})
		}

		return c.JSON(fiber.Map{"deleted": id})
	}
}