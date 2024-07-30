SELECT kv."resource_version", kv."value"
FROM "resource_history" as kv
INNER JOIN (
	SELECT "namespace", "group", "resource", "name", max("resource_version") AS "resource_version"
	FROM "resource_history" AS mkv
	WHERE 1 = 1 AND "resource_version" <= ? AND "namespace" = ?
	GROUP BY mkv."namespace", mkv."group", mkv."resource", mkv."name"
) AS maxkv
ON maxkv."resource_version" = kv."resource_version" AND maxkv."namespace" = kv."namespace" AND maxkv."group" = kv."group" AND maxkv."resource" = kv."resource" AND maxkv."name" = kv."name"
WHERE kv."action" != 3 AND kv."namespace" = ?
ORDER BY kv."resource_version" DESC
LIMIT ? OFFSET ?
;
