package main

import (
	"log"
	"os"
	"path/filepath"
	"time"


	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main(){
	
	app:=fiber.New()

	app.Use(cors.New())

	app.Static("/images","./uploads")
	app.Get("/",func(c *fiber.Ctx) error{
		return c.SendString("Fotoro server is running")
	})

	app.Post("/upload",uploadHandler)

	log.Fatal(app.Listen(":8080"))
}


func uploadHandler(c *fiber.Ctx) error{
	file, err := c.FormFile("file")
	if err!=nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error":err.Error()})
	}

	uploadDir:="./uploads"
	if err:=os.MkdirAll(uploadDir,0755); err!=nil{
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error":"Cannot create upload Directory"})
	}

	filename:= time.Now().Format("20060102-150405")+"_"+file.Filename
	savepath:= filepath.Join(uploadDir,filename)

	if err:= c.SaveFile(file,savepath); err!=nil{
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error":err.Error()})
	}

	return c.JSON(fiber.Map{
		"filename":filename,
		"size":file.Size,
	})
}
