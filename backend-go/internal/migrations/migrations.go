package migrations

import (
	"errors"
	"fmt"
	"path/filepath"
	"runtime"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func sourceURL() (string, error) {
	_, thisFile, _, ok := runtime.Caller(0)
	if !ok {
		return "", errors.New("não foi possível localizar o diretório de migrations")
	}

	root := filepath.Join(filepath.Dir(thisFile), "..", "..", "migrations")

	abs, err := filepath.Abs(root)
	if err != nil {
		return "", fmt.Errorf("erro ao resolver caminho das migrations: %w", err)
	}

	return "file://" + filepath.ToSlash(abs), nil
}

func newMigrate(databaseURL string) (*migrate.Migrate, error) {
	src, err := sourceURL()
	if err != nil {
		return nil, err
	}

	m, err := migrate.New(src, databaseURL)
	if err != nil {
		return nil, fmt.Errorf("erro ao inicializar migrate: %w", err)
	}

	return m, nil
}

// Up aplica todas as migrations pendentes no banco apontado por databaseURL.
func Up(databaseURL string) error {
	m, err := newMigrate(databaseURL)
	if err != nil {
		return err
	}
	defer m.Close()

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("erro ao aplicar migrations: %w", err)
	}

	return nil
}

// Down reverte todas as migrations aplicadas no banco apontado por databaseURL.
func Down(databaseURL string) error {
	m, err := newMigrate(databaseURL)
	if err != nil {
		return err
	}
	defer m.Close()

	if err := m.Down(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("erro ao reverter migrations: %w", err)
	}

	return nil
}
