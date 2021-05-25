package testdatasource

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana-plugin-sdk-go/experimental"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/stretchr/testify/require"
)

func TestCSVFileScenario(t *testing.T) {
	cfg := setting.NewCfg()
	cfg.DataPath = t.TempDir()
	cfg.StaticRootPath = "../../../public"

	p := &testDataPlugin{
		Cfg: cfg,
	}

	t.Run("loadCsvFile", func(t *testing.T) {
		t.Run("Should load file and convert to DataFrame", func(t *testing.T) {
			frame, err := p.loadCsvFile("population_by_state.csv")
			require.NoError(t, err)
			require.NotNil(t, frame)

			require.Len(t, frame.Fields, 4)

			require.Equal(t, "State", frame.Fields[0].Name)
			require.Equal(t, "2020", frame.Fields[1].Name)
			require.Equal(t, data.FieldTypeNullableString, frame.Fields[0].Type())
			require.Equal(t, data.FieldTypeNullableFloat64, frame.Fields[1].Type())
			require.GreaterOrEqual(t, frame.Fields[0].Len(), 2)

			val, ok := frame.Fields[1].ConcreteAt(0)
			require.True(t, ok)
			require.Equal(t, float64(39368078), val)
		})

		files := []string{"simple", "mixed"}
		for _, name := range files {
			t.Run("Should load CSV: "+name, func(t *testing.T) {
				filePath := filepath.Join("testdata", name+".csv")
				// Can ignore gosec G304 here, because this is a constant defined above
				// nolint:gosec
				fileReader, err := os.Open(filePath)
				require.NoError(t, err)

				defer func() {
					_ = fileReader.Close()
				}()

				frame, err := p.loadCsvContent(fileReader, name)
				require.NoError(t, err)
				require.NotNil(t, frame)

				dr := &backend.DataResponse{
					Frames: data.Frames{frame},
				}
				err = experimental.CheckGoldenDataResponse(
					filepath.Join("testdata", name+".golden.txt"), dr, true,
				)
				require.NoError(t, err)
			})
		}

		t.Run("Should not allow non file name chars", func(t *testing.T) {
			_, err := p.loadCsvFile("../population_by_state.csv")
			require.Error(t, err)
		})
	})
}

func TestReadCSV(t *testing.T) {
	fBool, err := csvLineToField("T, F,F,T  ,")
	require.NoError(t, err)

	fBool2, err := csvLineToField("true,false,T,F,F")
	require.NoError(t, err)

	fNum, err := csvLineToField("1,2,,4,5")
	require.NoError(t, err)

	fStr, err := csvLineToField("a,b,,,c")
	require.NoError(t, err)

	frame := data.NewFrame("", fBool, fBool2, fNum, fStr)
	frameToJSON, err := data.FrameToJSON(frame)
	require.NoError(t, err)
	out := frameToJSON.Bytes(data.IncludeAll)

	// require.Equal(t, "", string(out))

	require.JSONEq(t, `{"schema":{
		"fields":[
			{"type":"boolean","typeInfo":{"frame":"bool","nullable":true}},
			{"type":"boolean","typeInfo":{"frame":"bool","nullable":true}},
			{"type":"number","typeInfo":{"frame":"float64","nullable":true}},
			{"type":"string","typeInfo":{"frame":"string","nullable":true}}
		]},"data":{
			"values":[
				[true,false,false,true,null],
				[true,false,true,false,false],
				[1,2,null,4,5],
				["a","b",null,null,"c"]
		]}}`, string(out))
}
