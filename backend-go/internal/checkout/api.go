package checkout

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"time"
)

type APIClient struct {
	HTTPClient *http.Client
	APIKey     string
}

func NewAPIClient(apiKey string) *APIClient {
	return &APIClient{
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		APIKey: apiKey,
	}
}

func (a *APIClient) GettingPaymentLink(body *CreatePaymentLink) (*PaymentLinkResponse, error) {
	if body == nil {
		return nil, errors.New("dados do link de pagamento não informados")
	}

	var paymentLinkResponse PaymentLinkResponse

	payloadBytes, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	url := "https://api-sandbox.asaas.com/v3/paymentLinks"

	req, err := http.NewRequest(
		http.MethodPost,
		url,
		bytes.NewBuffer(payloadBytes),
	)
	if err != nil {
		return nil, err
	}

	req.Header.Add("accept", "application/json")
	req.Header.Add("User-Agent", "SaudeMentalBackend/1.0.0")
	req.Header.Add("content-type", "application/json")
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
		return nil, fmt.Errorf("erro ao criar link no Asaas: status %d - %s", resp.StatusCode, string(responseBody))
	}

	if err := json.Unmarshal(responseBody, &paymentLinkResponse); err != nil {
		return nil, err
	}

	if err := a.ValidateLinkResponse(&paymentLinkResponse, body); err != nil {
		return nil, err
	}

	return &paymentLinkResponse, nil
}

func (a *APIClient) ValidateLinkResponse(payLinkRes *PaymentLinkResponse, request *CreatePaymentLink) error {
	if payLinkRes == nil {
		return errors.New("o Asaas não enviou resposta")
	}

	if payLinkRes.ID == "" {
		return errors.New("o Asaas não enviou o ID do link de pagamento")
	}

	if payLinkRes.URL == "" {
		return errors.New("o Asaas não enviou o link de pagamento")
	}

	if request == nil {
		return nil
	}

	if payLinkRes.Name != request.Name {
		return errors.New("o nome retornado pelo Asaas é diferente do nome enviado")
	}

	if math.Abs(payLinkRes.Value-request.Value) > 0.001 {
		return errors.New("o valor retornado pelo Asaas é diferente do valor enviado")
	}

	if payLinkRes.BillingType != string(request.BillingType) {
		return errors.New("o tipo de pagamento retornado pelo Asaas é diferente do enviado")
	}

	if payLinkRes.ChargeType != string(request.ChargeType) {
		return errors.New("o tipo de cobrança retornado pelo Asaas é diferente do enviado")
	}

	return nil
}
