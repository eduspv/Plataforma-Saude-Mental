package auth

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"
)

type APIClient struct {
	HTTPClient *http.Client
}

func NewAPIClient() *APIClient {
	return &APIClient{
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (api *APIClient) VerifyCNPJ(cnpj string) error {
	cnpj = strings.ReplaceAll(cnpj, ".", "")
	cnpj = strings.ReplaceAll(cnpj, "/", "")
	cnpj = strings.ReplaceAll(cnpj, "-", "")

	url := fmt.Sprintf("https://brasilapi.com.br/api/cnpj/v1/%s", cnpj)

	resp, err := api.HTTPClient.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return errors.New("CNPJ não encontrado")
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("erro ao consultar CNPJ: status %d", resp.StatusCode)
	}
	log.Print("REsposta da API do CNPJ: ", resp)

	return nil
}
