package handlers

import (
    "crypto/sha256"
    "encoding/hex"
    "image"
    "io"
    "log"
    "mime"
    "os"
    "path/filepath"

    "github.com/gofiber/fiber/v2"
    "github.com/rwcarlsen/goexif/exif"

    "github.com/Fotoro/Fotoro-Server/internal/database"
    "github.com/Fotoro/Fotoro-Server/internal/storage"

    // Register image formats
    _ "image/gif"
    _ "image/jpeg"
    _ "image/png"
)

func UploadHandler(db *database.DB, store *storage.Storage) fiber.Handler {
    return func(c *fiber.Ctx) error {
        file, err := c.FormFile("file")
        if err != nil {
            return c.Status(400).JSON(fiber.Map{
                "error": "no file provided — send file in 'file' field",
            })
        }

        ext := filepath.Ext(file.Filename)
        mimeType := mime.TypeByExtension(ext)

        allowedTypes := map[string]bool{
            "image/jpeg": true,
            "image/jpg":  true,
            "image/png":  true,
            "image/gif":  true,
            "image/webp": true,
        }
        if !allowedTypes[mimeType] {
            return c.Status(400).JSON(fiber.Map{
                "error": "only JPEG, PNG, GIF and WebP allowed",
            })
        }

        src, err := file.Open()
        if err != nil {
            return c.Status(500).JSON(fiber.Map{"error": "could not read uploaded file"})
        }
        defer src.Close()

        tmpFile, err := os.CreateTemp("", "fotoro-upload-*")
        if err != nil {
            return c.Status(500).JSON(fiber.Map{"error": "could not create temp file"})
        }
        defer os.Remove(tmpFile.Name())
        defer tmpFile.Close()

        // Compute SHA256 while writing to temp file
        hasher := sha256.New()
        tee := io.TeeReader(src, io.MultiWriter(hasher, tmpFile))
        size, err := io.Copy(io.Discard, tee)
        if err != nil {
            return c.Status(500).JSON(fiber.Map{"error": "could not process file"})
        }

        hash := hex.EncodeToString(hasher.Sum(nil))
        id := hash[:16] // first 16 chars as ID

        // Rewind for EXIF extraction
        if _, err := tmpFile.Seek(0, 0); err != nil {
            return c.Status(500).JSON(fiber.Map{"error": "temp file seek failed"})
        }

        // Extract dimensions (EXIF then fallback)
        var width, height int
        x, err := exif.Decode(tmpFile)
        if err == nil {
            if wTag, err := x.Get(exif.PixelXDimension); err == nil {
                width, _ = wTag.Int(0)
            }
            if hTag, err := x.Get(exif.PixelYDimension); err == nil {
                height, _ = hTag.Int(0)
            }
        }
        if width == 0 || height == 0 {
            if _, err := tmpFile.Seek(0, 0); err == nil {
                config, _, err := image.DecodeConfig(tmpFile)
                if err == nil {
                    width = config.Width
                    height = config.Height
                }
            }
        }

        // Rewind again for saving to permanent storage
        if _, err := tmpFile.Seek(0, 0); err != nil {
            return c.Status(500).JSON(fiber.Map{"error": "temp file seek failed"})
        }

        photo := database.Photo{
            ID:       id,
            Hash:     hash,
            Filename: file.Filename,
            Size:     size,
            MimeType: mimeType,
            Width:    width,
            Height:   height,
        }

        // Upsert metadata – now returns (actualID, isNew, error)
        actualID, isNew, err := db.UpsertPhoto(photo)
        if err != nil {
            return c.Status(500).JSON(fiber.Map{"error": "database error"})
        }

        if !isNew {
            // Duplicate detected – no need to save file again
            return c.Status(200).JSON(fiber.Map{
                "id":        actualID,
                "filename":  file.Filename,
                "size":      size,
                "duplicate": true,
            })
        }

        // New unique file – save to disk
        savedSize, err := store.SavePhoto(id, file.Filename, tmpFile)
        if err != nil {
            // Rollback DB entry to avoid orphaned record
            db.DeletePhoto(id)
            return c.Status(500).JSON(fiber.Map{"error": "could not save file"})
        }

        // Enqueue thumbnail generation job
        _, err = db.Exec(`INSERT INTO jobs (photo_id, job_type) VALUES (?, 'thumbnail')`, actualID)
        if err != nil {
            log.Printf("failed to enqueue thumbnail job for %s: %v", actualID, err)
        }

        return c.Status(201).JSON(fiber.Map{
            "id":       id,
            "filename": file.Filename,
            "size":     savedSize,
        })
    }
}