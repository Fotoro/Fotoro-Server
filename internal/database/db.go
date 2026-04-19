package database

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

type DB struct{
	conn *sql.DB
}

type Photo struct {
    ID        string `json:"id"`
    Hash      string `json:"hash"`
    Filename  string `json:"filename"`
    Size      int64  `json:"size"`
    MimeType  string `json:"mime_type"`
    Width     int    `json:"width"`
    Height    int    `json:"height"`
    CreatedAt string `json:"created_at"`
}

func New(dbPath string) (*DB, error) {
    conn, err := sql.Open("sqlite3", dbPath)
    if err != nil {
        return nil, err
    }

    // Performance PRAGMAs for large media libraries
    pragmas := []string{
        "PRAGMA journal_mode = WAL;",
        "PRAGMA synchronous = NORMAL;",
        "PRAGMA cache_size = -64000;",      // 64 MB cache
        "PRAGMA temp_store = MEMORY;",
        "PRAGMA busy_timeout = 5000;",      // 5 seconds timeout for concurrent writes
    }
    for _, p := range pragmas {
        if _, err := conn.Exec(p); err != nil {
            conn.Close()
            return nil, fmt.Errorf("failed to set pragma %q: %w", p, err)
        }
    }

    db := &DB{conn: conn}
    if err := db.migrate(); err != nil {
        conn.Close()
        return nil, err
    }
    return db, nil
}

func (db *DB) migrate() error {
	query := `
	CREATE TABLE IF NOT EXISTS photos (
		id         TEXT PRIMARY KEY,
		hash       TEXT UNIQUE NOT NULL,
		filename   TEXT NOT NULL,
		size       INTEGER NOT NULL,
		mime_type  TEXT NOT NULL,
		width      INTEGER DEFAULT 0,
		height     INTEGER DEFAULT 0,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_photos_created ON photos(created_at DESC);
	CREATE INDEX IF NOT EXISTS idx_photos_hash ON photos(hash);

	CREATE TABLE IF NOT EXISTS jobs (
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		photo_id   TEXT NOT NULL,
		job_type   TEXT NOT NULL,
		status     TEXT DEFAULT 'pending',
		attempts   INTEGER DEFAULT 0,
		last_error TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE
	);

	CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
	`
	_, err := db.conn.Exec(query)
	return err
}
// UpsertPhoto inserts a photo if its hash doesn't exist.
// Returns the actual ID (new or existing) and a boolean indicating if it was newly inserted.
func (db *DB) UpsertPhoto(p Photo) (id string, isNew bool, err error) {
    // Check if hash already exists
    var existingID string
    err = db.conn.QueryRow("SELECT id FROM photos WHERE hash = ?", p.Hash).Scan(&existingID)
    if err == nil {
        // Already exists
        return existingID, false, nil
    }
    if err != sql.ErrNoRows {
        // Real database error
        return "", false, err
    }

    // Insert new record
    _, err = db.conn.Exec(`
        INSERT INTO photos (id, hash, filename, size, mime_type, width, height)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, p.ID, p.Hash, p.Filename, p.Size, p.MimeType, p.Width, p.Height)
    if err != nil {
        return "", false, err
    }

    return p.ID, true, nil
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


// QueryRow executes a query that returns at most one row.
// It's a convenience wrapper around sql.DB.QueryRow.
func (db *DB) QueryRow(query string, args ...interface{}) *sql.Row {
	return db.conn.QueryRow(query, args...)
}

// Exec executes a query without returning any rows.
// It's a convenience wrapper around sql.DB.Exec.
func (db *DB) Exec(query string, args ...interface{}) (sql.Result, error) {
	return db.conn.Exec(query, args...)
}

// Begin starts a transaction.
func (db *DB) Begin() (*sql.Tx, error) {
	return db.conn.Begin()
}

// Close closes the database connection.
func (db *DB) Close() error {
	return db.conn.Close()
}