package services

import (
	"bytes"
	"io"
	"io/ioutil"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHandleResponse(t *testing.T) {
	t.Run("Returns body if status == 200", func(t *testing.T) {
		body, err := handleResponse(makeResponse(200, "test"))
		assert.Nil(t, err)
		assert.Equal(t, "test", string(body))
	})

	t.Run("Returns ErrorNotFound if status == 404", func(t *testing.T) {
		_, err := handleResponse(makeResponse(404, ""))
		assert.Equal(t, ErrNotFoundError, err)
	})

	t.Run("Returns message from body if status == 400", func(t *testing.T) {
		_, err := handleResponse(makeResponse(400, "{ \"message\": \"error_message\" }"))
		assert.NotNil(t, err)
		assert.Equal(t, "error_message", asBadRequestError(t, err).Message)
	})

	t.Run("Returns body if status == 400 and no message key", func(t *testing.T) {
		_, err := handleResponse(makeResponse(400, "{ \"test\": \"test_message\"}"))
		assert.NotNil(t, err)
		assert.Equal(t, "{ \"test\": \"test_message\"}", asBadRequestError(t, err).Message)
	})

	t.Run("Returns Bad request error if status == 400 and no body", func(t *testing.T) {
		_, err := handleResponse(makeResponse(400, ""))
		assert.NotNil(t, err)
		_ = asBadRequestError(t, err)
	})

	t.Run("Returns error with invalid status if status == 500", func(t *testing.T) {
		_, err := handleResponse(makeResponse(500, ""))
		assert.NotNil(t, err)
		assert.Contains(t, err.Error(), "invalid status")
	})
}

func makeResponse(status int, body string) *http.Response {
	return &http.Response{
		StatusCode: status,
		Body:       makeBody(body),
	}
}

func makeBody(body string) io.ReadCloser {
	return ioutil.NopCloser(bytes.NewReader([]byte(body)))
}

func asBadRequestError(t *testing.T, err error) *BadRequestError {
	if badRequestError, ok := err.(*BadRequestError); ok {
		return badRequestError
	}
	assert.FailNow(t, "Error was not of type BadRequestError")
	return nil
}
