// Copyright 2021 Grafana Labs
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package grafanaplugin

import (
	"github.com/grafana/grafana/packages/grafana-schema/src/common"
)

composableKinds: PanelCfg: {
	maturity: "experimental"

	lineage: {
		schemas: [{
			version: [0, 0]
			schema: {
				Options: {
					common.SingleStatBaseOptions
					displayMode:   common.BarGaugeDisplayMode & (*"gradient" | _)
					valueMode:     common.BarGaugeValueMode & (*"color" | _)
					namePlacement: common.BarGaugeNamePlacement & (*"auto" | _)
					showUnfilled:  bool | *true
					minVizWidth:   uint32 | *0
					minVizHeight:  uint32 | *10
				} @cuetsy(kind="interface")
			}
		}]
		lenses: []
	}
}
