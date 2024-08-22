package middleware

import (
	"fmt"
	"net/http"
	"path"

	"github.com/grafana/grafana/pkg/cmd/grafana-cli/logger"
	"github.com/grafana/grafana/pkg/services/contexthandler"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/util"
	"github.com/grafana/grafana/pkg/web"
)

func ValidateActionUrl(cfg *setting.Cfg) web.Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
			c := contexthandler.FromContext(req.Context())

			// ignore local render calls
			if c.IsRenderCall {
				return
			}

			// only process requests targeting local instance
			if !isLocalPath(c) {
				// call next on url
				next.ServeHTTP(rw, req)
				return
			}

			// only process POST and PUT
			if c.Req.Method != http.MethodPost && c.Req.Method != http.MethodPut {
				return
			}

			if c.IsApiRequest() {
				// check if action header exists
				action := c.Req.Header.Get("X-Grafana-Action")

				if action == "" {
					// header not found, just return
					return
				}

				urlToCheck := c.Req.URL
				// get the urls allowed from server config
				pathsToCheck := util.SplitString(cfg.ActionsAllowPostURL)
				for _, i := range pathsToCheck {
					matched, err := path.Match(i, urlToCheck.Path)
					if err != nil {
						// match error, ignore
						logger.Warn("Error matching configured paths", "err", err)
						c.JsonApiErr(http.StatusForbidden, fmt.Sprintf("Error matching configured paths: %s", err.Error()), nil)
						return
					}
					if matched {
						// allowed
						logger.Debug("API call allowed", "path", i)
						next.ServeHTTP(rw, req)
						return
					}
				}
				logger.Warn("POST/PUT to path not allowed", "warn", urlToCheck)
				c.JsonApiErr(http.StatusForbidden, fmt.Sprintf("POST/PUT to path not allowed: %s", urlToCheck), nil)
				return
			}
		})
	}
}

// isLocalPath
// Actions are processed by internal api paths, this checks the URL to ensure the request is to the local instance
func isLocalPath(c *contextmodel.ReqContext) bool {
	netAddr, err := util.SplitHostPortDefault(c.Req.Host, "", "0") // we ignore the port
	if err != nil {
		c.JsonApiErr(http.StatusBadRequest, fmt.Sprintf("Error parsing request for action: %s", err.Error()), nil)
		return false
	}

	urlAddr, err := util.SplitHostPortDefault(c.Req.URL.Host, "", "0") // we ignore the port
	if err != nil {
		// match error, ignore
		logger.Warn("Error getting url address", "err", err)
		return false
	}
	pathIsLocal := urlAddr.Host == netAddr.Host
	if netAddr.Host != "" || pathIsLocal {
		// request is local
		return true
	}

	return false
}
