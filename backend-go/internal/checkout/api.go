package checkout

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

type APIClient struct {
	HTTPClient *http.Client
	APIKey     string
}

func NewAPIClient(apiKey string) *APIClient {
	return &APIClient{
		HTTPClient: &http.Client{Timeout: 10 * time.Second},
		APIKey:     apiKey,
	}
}

func (a *APIClient) CreateCustomer(body *CreateCustomerRequest) (*CreateCustomerResponse, error) {
	if body == nil {
		return nil, errors.New("dados do cliente não informados")
	}

	payloadBytes, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(http.MethodPost, "https://api-sandbox.asaas.com/v3/customers", bytes.NewBuffer(payloadBytes))
	if err != nil {
		return nil, err
	}

	req.Header.Add("accept", "application/json")
	req.Header.Add("content-type", "application/json")
	req.Header.Add("User-Agent", "SaudeMentalBackend/1.0.0")
	req.Header.Add("access_token", a.APIKey)

	log.Printf("[DEBUG_ASAAS] URL=%s", req.URL.String())
	log.Printf("[DEBUG_ASAAS] header access_token len=%d prefix=%q", len(req.Header.Get("access_token")), req.Header.Get("access_token")[:min(30, len(req.Header.Get("access_token")))])

	resp, err := a.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("erro ao criar customer no Asaas: status %d - %s", resp.StatusCode, string(responseBody))
	}

	var customerResponse CreateCustomerResponse
	if err := json.Unmarshal(responseBody, &customerResponse); err != nil {
		return nil, err
	}

	if customerResponse.ID == "" {
		return nil, errors.New("Asaas não retornou ID do customer")
	}

	return &customerResponse, nil
}

func (a *APIClient) CreatePayment(body *CreatePaymentRequest) (*CreatePaymentResponse, error) {
	if body == nil {
		return nil, errors.New("dados da cobrança não informados")
	}

	payloadBytes, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	bodyJSON, err := json.MarshalIndent(body, "", "  ")
	if err != nil {
		return nil, err
	}
	log.Println("JSON ENVIADO AO ASAAS:", string(bodyJSON))

	req, err := http.NewRequest(http.MethodPost, "https://api-sandbox.asaas.com/v3/payments", bytes.NewBuffer(payloadBytes))
	if err != nil {
		return nil, err
	}

	req.Header.Add("accept", "application/json")
	req.Header.Add("content-type", "application/json")
	req.Header.Add("User-Agent", "SaudeMentalBackend/1.0.0")
	req.Header.Add("access_token", a.APIKey)

	resp, err := a.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("erro ao criar cobrança no Asaas: status %d - %s", resp.StatusCode, string(responseBody))
	}

	var paymentResponse CreatePaymentResponse
	if err := json.Unmarshal(responseBody, &paymentResponse); err != nil {
		return nil, err
	}

	if paymentResponse.ID == "" {
		return nil, errors.New("Asaas não retornou ID da cobrança")
	}

	if paymentResponse.InvoiceURL == "" {
		return nil, errors.New("Asaas não retornou URL da cobrança")
	}

	return &paymentResponse, nil
}
