package database

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
)

type DB struct{
	conn *sql.DB
}

type Photo struct {
	ID        string `json:"id"`
	Filename  string `json:"filename"`
	Size      int64  `json:"size"`
	MimeType  string `json:"mime_type"`
	Width     int    `json:"width"`
	Height    int    `json:"height"`
	CreatedAt string `json:"created_at"`
}

func New(dbPath string) (*DB, error){
	conn , err := sql.Open("sqlite3",dbPath)
	if err!=nil{
		return nil,err
	}
	db:= &DB{conn:conn}
	if err:= db.migrate(); err!=nil{
		return nil,err
	}

	return db,nil
}

func (db *DB) migrate() error{
	query:= `
	CREATE TABLE IF NOT EXISTS photos (
		id         TEXT PRIMARY KEY,
		filename   TEXT NOT NULL,
		size       INTEGER NOT NULL,
		mime_type  TEXT NOT NULL,
		width      INTEGER DEFAULT 0,
		height     INTEGER DEFAULT 0,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_photos_created 
	ON photos(created_at DESC);
	`

	_,err := db.conn.Exec(query)
	return err
}

func (db *DB) InsertPhoto(p Photo) error{
	query:= `
	INSERT INTO photos (id, filename, size, mime_type, width, height)
	VALUES (?, ?, ?, ?, ?, ?)
	`

    _, err := db.conn.Exec(query, p.ID, p.Filename, p.Size, p.MimeType, p.Width, p.Height)
	return err
}

func (db *DB) GetPhoto(id string) (*Photo,error){
	query:=`SELECT id, filename, size, mime_type, width, height, created_at
	          FROM photos WHERE id = ?`

	photo := &Photo{}
	err:=db.conn.QueryRow(query,id).Scan(
		&photo.ID,
		&photo.Filename,
		&photo.Size,
		&photo.MimeType,
		&photo.Width,
		&photo.Height,
		&photo.CreatedAt,
	)		  

	if err==sql.ErrNoRows{
		return nil,nil
	}
	if err!=nil{
		return nil,err
	}

	return photo,nil

}

func (db *DB) ListPhotos(page,limit int)([]Photo,int,error){
	offset:=(page-1)*limit

	var total int
	err := db.conn.QueryRow("SELECT COUNT(*) FROM photos").Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query:=`
	SELECT id, filename, size, mime_type, width, height, created_at
	FROM photos
	ORDER BY created_at DESC
	LIMIT ? OFFSET ?
	`

	rows,err:= db.conn.Query(query,limit,offset)
	if err!=nil{
		return nil,0,err
	}
	defer rows.Close()

	var photos []Photo
	for rows.Next() {
		var p Photo
		err := rows.Scan(
			&p.ID,
			&p.Filename,
			&p.Size,
			&p.MimeType,
			&p.Width,
			&p.Height,
			&p.CreatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		photos = append(photos, p)
	}

	return photos,total,nil


}

func (db *DB) DeletePhoto(id string) error{
	_, err:= db.conn.Exec("DELETE FROM photos WHERE id = ?", id)
	return err
}