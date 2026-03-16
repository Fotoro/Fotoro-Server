package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"

	"github.com/Fotoro/Fotoro-Server/internal/database"
	"github.com/Fotoro/Fotoro-Server/internal/handlers"
	"github.com/Fotoro/Fotoro-Server/internal/storage"
)

func main() {
	db, err := database.New("./metadata.db")
	if err != nil {
		log.Fatal("could not open database:", err)
	}

	store, err := storage.New(".")
	if err != nil {
		log.Fatal("could not initialize storage:", err)
	}

	app := fiber.New(fiber.Config{
		BodyLimit: 100 * 1024 * 1024,
	})

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

	app.Static("/", "./web")

	log.Println("Fotoro server running on :8080")
	log.Fatal(app.Listen(":8080"))
}
