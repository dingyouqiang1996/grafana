SELECT tm.id as id, t.uid as team_uid, u.uid as user_uid, tm.created, tm.updated, tm.permission
FROM {{ .Ident .TeamMemberTable }} tm
INNER JOIN {{ .Ident .TeamTable }} t ON tm.team_id = t.id
INNER JOIN {{ .Ident .UserTable }} u ON tm.user_id  = u.id
WHERE
tm.org_id = {{ .Arg .Query.OrgID}}
{{ if .Query.TeamUID }}
    AND t.uid = {{ .Arg .Query.TeamUID }}
{{ end }}
{{ if .Query.UserUID }}
    AND u.uid = {{ .Arg .Query.UserUID }}
{{ end }}
{{ if .Query.ContinueID }}
   AND tm.id >= {{ .Arg .Query.ContinueID }}
{{ end }}
ORDER BY tm.id ASC LIMIT {{ .Arg .Query.Limit }};
