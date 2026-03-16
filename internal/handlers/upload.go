package handlers

import (
	"mime"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/Fotoro/Fotoro-Server/internal/database"
	"github.com/Fotoro/Fotoro-Server/internal/storage"
	"github.com/Fotoro/Fotoro-Server/internal/thumbnail"
)

func UploadHandler(db *database.DB, store *storage.Storage) fiber.Handler {
	return func(c *fiber.Ctx) error {
		file, err := c.FormFile("file")
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "no file provided",
			})
		}

		ext := filepath.Ext(file.Filename)
		mimeType := mime.TypeByExtension(ext)

		allowedTypes := map[string]bool{
			"image/jpeg": true,
			"image/png":  true,
			"image/gif":  true,
			"image/webp": true,
		}

		if !allowedTypes[mimeType] {
			return c.Status(400).JSON(fiber.Map{
				"error": "only JPEG, PNG, GIF and WebP allowed",
			})
		}

		id := uuid.New().String()

		src, err := file.Open()
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": "could not read uploaded file",
			})
		}
		defer src.Close()

		size, err := store.SavePhoto(id, file.Filename, src)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": "could not save file",
			})
		}

		photo := database.Photo{
			ID:       id,
			Filename: file.Filename,
			Size:     size,
			MimeType: mimeType,
		}

		if err := db.InsertPhoto(photo); err != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": "could not save metadata",
			})
		}

		go func() {
			photoPath := store.PhotoPath(id, file.Filename)
			thumbPath := store.ThumbnailPath(id)
			if err := thumbnail.Generate(photoPath, thumbPath); err != nil {
				println("thumbnail generation failed:", err.Error())
			}
		}()

		return c.Status(201).JSON(fiber.Map{
			"id":       id,
			"filename": file.Filename,
			"size":     size,
		})
	}
}
