package storage

import (
	"io"
	"os"
	"path/filepath"
)

type Storage struct {
	PhotosDir     string
	ThumbnailsDir string
}

func New(base string) (*Storage, error) {
	// Convert to absolute path — fixes issues with relative paths
	absBase, err := filepath.Abs(base)
	if err != nil {
		return nil, err
	}

	photosDir := filepath.Join(absBase, "photos")
	thumbsDir := filepath.Join(absBase, "thumbnails")

	if err := os.MkdirAll(photosDir, 0755); err != nil {
		return nil, err
	}
	if err := os.MkdirAll(thumbsDir, 0755); err != nil {
		return nil, err
	}

	return &Storage{
		PhotosDir:     photosDir,
		ThumbnailsDir: thumbsDir,
	}, nil
}

func (s *Storage) PhotoPath(id, filename string) string {
	ext := filepath.Ext(filename)
	return filepath.Join(s.PhotosDir, id+ext)
}

func (s *Storage) ThumbnailPath(id string) string {
	return filepath.Join(s.ThumbnailsDir, id+".jpg")
}

func (s *Storage) SavePhoto(id, filename string, src io.Reader) (int64, error) {
	path := s.PhotoPath(id, filename)

	dst, err := os.Create(path)
	if err != nil {
		return 0, err
	}
	defer dst.Close()

	return io.Copy(dst, src)
}

func (s *Storage) DeletePhoto(id, filename string) error {
	photoPath := s.PhotoPath(id, filename)
	thumbPath := s.ThumbnailPath(id)

	os.Remove(thumbPath)
	return os.Remove(photoPath)
}

func (s *Storage) PhotoExists(id, filename string) bool {
	path := s.PhotoPath(id, filename)
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}

func (s *Storage) ThumbnailExists(id string) bool {
	path := s.ThumbnailPath(id)
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}
