package routing

import (
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/web"
)

var (
	ServerError = func(err error) response.Response {
		return response.Error(500, "Server error", err)
	}
)

func Wrap(handler func(c *model.ReqContext) response.Response) web.Handler {
	return func(c *model.ReqContext) {
		if res := handler(c); res != nil {
			res.WriteTo(c)
		}
	}
}
