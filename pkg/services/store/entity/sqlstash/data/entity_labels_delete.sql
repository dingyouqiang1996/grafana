DELETE FROM {{ .Ident "entity_labels" }}
  WHERE 1 = 1
    AND {{ .Ident "guid" }} = {{ .Arg .GUID }}
    {{ if gt (len .KeepLabels) 0 }}
      AND {{ .Ident "label" }} NOT IN
        (
          {{ $addComma := false }}
          {{ range .KeepLabels }}
            {{ if $addComma }}
              ,
            {{ end }}
            {{ $addComma = true }}

            {{ .Arg . }}
          {{ end }}
        )
    {{ end }}
;
