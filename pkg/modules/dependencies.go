package modules

const (
	All string = "all"

	CertGenerator string = "cert-generator"

	GrafanaAPIServer string = "grafana-apiserver"
)

var DependencyMap = map[string][]string{
	CertGenerator: {},

	GrafanaAPIServer: {CertGenerator},

	// All includes all modules necessary for Grafana to run as a standalone application.
	All: {GrafanaAPIServer},
}
