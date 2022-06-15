package client

import (
	"bytes"
	"context"
	"net/http"
	"net/url"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana/pkg/tsdb/prometheus/models"
)

type doer interface {
	Do(req *http.Request) (*http.Response, error)
}

type Client struct {
	doer    doer
	method  string
	baseUrl string
}

func NewClient(d doer, method, baseUrl string) *Client {
	return &Client{doer: d, method: method, baseUrl: baseUrl}
}

func (c *Client) QueryRange(ctx context.Context, q *models.Query) (*http.Response, error) {
	u, err := url.ParseRequestURI(c.baseUrl)
	if err != nil {
		return nil, err
	}

	u.Path = path.Join(u.Path, "api/v1/query_range")

	qs := u.Query()
	qs.Set("query", q.Expr)
	tr := q.TimeRange()
	qs.Set("start", formatTime(tr.Start))
	qs.Set("end", formatTime(tr.End))
	qs.Set("step", strconv.FormatFloat(tr.Step.Seconds(), 'f', -1, 64))

	return c.fetch(ctx, c.method, u, qs, nil)
}

func (c *Client) QueryInstant(ctx context.Context, q *models.Query) (*http.Response, error) {
	u, err := url.ParseRequestURI(c.baseUrl)
	if err != nil {
		return nil, err
	}

	u.Path = path.Join(u.Path, "api/v1/query")

	qs := u.Query()
	qs.Set("query", q.Expr)
	tr := q.TimeRange()
	if !tr.End.IsZero() {
		qs.Set("time", formatTime(tr.End))
	}

	return c.fetch(ctx, c.method, u, qs, nil)
}

func (c *Client) QueryExemplars(ctx context.Context, q *models.Query) (*http.Response, error) {
	u, err := url.ParseRequestURI(c.baseUrl)
	if err != nil {
		return nil, err
	}

	u.Path = path.Join(u.Path, "api/v1/query_exemplars")

	qs := u.Query()
	tr := q.TimeRange()
	qs.Set("query", q.Expr)
	qs.Set("start", formatTime(tr.Start))
	qs.Set("end", formatTime(tr.End))

	return c.fetch(ctx, c.method, u, qs, nil)
}

type FetchReq struct {
	Method      string
	Url         *url.URL
	QueryString url.Values
}

func (c *Client) QueryResource(ctx context.Context, req *backend.CallResourceRequest) (*http.Response, error) {
	baseUrlParsed, err := url.ParseRequestURI(c.baseUrl)
	if err != nil {
		return nil, err
	}
	reqUrlParsed, err := url.Parse(req.URL)

	baseUrlParsed.Path = path.Join(baseUrlParsed.Path, req.Path)
	baseUrlParsed.RawQuery = reqUrlParsed.RawQuery

	return c.fetch(ctx, req.Method, baseUrlParsed, nil, req.Body)
}

func (c *Client) fetch(ctx context.Context, method string, u *url.URL, qs url.Values, body []byte) (*http.Response, error) {
	if strings.ToUpper(method) == http.MethodGet && qs != nil {
		u.RawQuery = qs.Encode()
	}
	bodyReader := bytes.NewReader(body)
	request, err := http.NewRequestWithContext(ctx, method, u.String(), bodyReader)
	if err != nil {
		return nil, err
	}

	if strings.ToUpper(method) == http.MethodPost {
		request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	}

	return c.doer.Do(request)
}

func formatTime(t time.Time) string {
	return strconv.FormatFloat(float64(t.Unix())+float64(t.Nanosecond())/1e9, 'f', -1, 64)
}
