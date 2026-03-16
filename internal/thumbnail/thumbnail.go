package thumbnail

import (
	"github.com/disintegration/imaging"
)

const (
	ThumbWidth  = 400
	ThumbHeight = 400
)


func Generate(srcPath, dstPath string) error {
	src, err := imaging.Open(srcPath, imaging.AutoOrientation(true))
	if err != nil {
		return err
	}

	thumb := imaging.Fit(src, ThumbWidth, ThumbHeight, imaging.Lanczos)

	return imaging.Save(thumb, dstPath, imaging.JPEGQuality(85))
}