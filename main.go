package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"

	"github.com/Fotoro/Fotoro-Server/internal/database"
	"github.com/Fotoro/Fotoro-Server/internal/handlers"
	"github.com/Fotoro/Fotoro-Server/internal/storage"
	"github.com/Fotoro/Fotoro-Server/internal/thumbnail" 
	"github.com/Fotoro/Fotoro-Server/internal/worker" 
)

func main() {

	
	db, err := database.New("./metadata.db")
	if err != nil {
		log.Fatal("could not open database:", err)
	}
	defer db.Close()  

	store, err := storage.New(".")
	if err != nil {
		log.Fatal("could not initialize storage:", err)
	}
	worker.StartThumbnailWorker(db, store)


	app := fiber.New(fiber.Config{
		BodyLimit: 100 * 1024 * 1024,
	})
	app.Static("/", "./web")


	app.Use(logger.New())
	app.Use(cors.New())

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "version": "0.1.0"})
	})

	app.Post("/upload", handlers.UploadHandler(db, store))
	app.Get("/photos", handlers.ListPhotosHandler(db))
	app.Get("/photos/:id", handlers.GetPhotoHandler(db, store))
	app.Delete("/photos/:id", handlers.DeletePhotoHandler(db, store))
	app.Get("/thumbnails/:id", handlers.GetThumbnailHandler(db, store))
	app.Post("/admin/generate-thumbnails", func(c *fiber.Ctx) error {
		photos, _, err := db.ListPhotos(1, 10000)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		generated := 0
		failed := 0

		for _, photo := range photos {
			if store.ThumbnailExists(photo.ID) {
				continue
			}

			photoPath := store.PhotoPath(photo.ID, photo.Filename)
			thumbPath := store.ThumbnailPath(photo.ID)

			err := thumbnail.Generate(photoPath, thumbPath)
			if err != nil {
				failed++
				continue
			}

			generated++
		}


		return c.JSON(fiber.Map{
			"generated": generated,
			"failed":    failed,
			"skipped":   len(photos) - generated - failed,
		})
	})

	log.Println("Fotoro server running on :8080")
	log.Fatal(app.Listen(":8080"))
}