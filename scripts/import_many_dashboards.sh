#!/usr/bin/env bash

for index in {0..3000}
do
  echo -n "index $index"
  curl 'http://localhost:3000/api/dashboards/import' -H 'Pragma: no-cache' -H 'Origin: http://localhost:3000' -H 'Accept-Encoding: gzip, deflate' -H 'Accept-Language: en-US,en;q=0.8,sv;q=0.6' -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.101 Safari/537.36' -H 'Content-Type: application/json;charset=UTF-8' -H 'Accept: application/json, text/plain, */*' -H 'Cache-Control: no-cache' -H 'Referer: http://localhost:3000/dashboard/new?editview=import' -H 'Cookie: grafana_sess=662a67f11b47e657; grafana_user=admin; grafana_remember=bd839923f24f648c7cb53ede6ff9ef40826204e9a22df8f9; toggles=%7B%7D' -H 'Connection: keep-alive' --data-binary $'{"dashboard":{"__inputs":[{"name":"DS_GRAPHITE","label":"graphite","description":"","type":"datasource","pluginId":"graphite","pluginName":"Graphite"}],"__requires":[{"type":"panel","id":"singlestat","name":"Singlestat","version":""},{"type":"panel","id":"graph","name":"Graph","version":""},{"type":"grafana","id":"grafana","name":"Grafana","version":"3.1.0"},{"type":"datasource","id":"graphite","name":"Graphite","version":"1.0.0"}],"id":null,"title":"Big Dashboard dashname '"$index"$'","tags":["startpage","home","presentation"],"style":"dark","timezone":"browser","editable":true,"hideControls":false,"sharedCrosshair":true,"rows":[{"collapse":false,"editable":true,"height":"100px","panels":[{"cacheTimeout":null,"colorBackground":false,"colorValue":true,"colors":["rgba(245, 54, 54, 0.9)","rgba(237, 129, 40, 0.89)","rgba(50, 172, 45, 0.97)"],"datasource":"${DS_GRAPHITE}","editable":true,"error":false,"format":"none","gauge":{"maxValue":100,"minValue":0,"show":false,"thresholdLabels":false,"thresholdMarkers":true},"id":16,"interval":null,"links":[],"maxDataPoints":100,"nullPointMode":"connected","nullText":null,"postfix":"","postfixFontSize":"50%","prefix":"","prefixFontSize":"50%","span":3,"sparkline":{"fillColor":"rgba(31, 118, 189, 0.18)","full":true,"lineColor":"rgb(31, 120, 193)","show":true},"targets":[{"refId":"A","target":"apps.backend.backend_02.counters.requests.count"}],"thresholds":"100,270","title":"Sign ups","type":"singlestat","valueFontSize":"100%","valueMaps":[{"op":"=","text":"N/A","value":"null"}],"valueName":"avg","mappingTypes":[{"name":"value to text","value":1},{"name":"range to text","value":2}],"rangeMaps":[{"from":"null","to":"null","text":"N/A"}],"mappingType":1},{"cacheTimeout":null,"colorBackground":false,"colorValue":true,"colors":["rgba(245, 54, 54, 0.9)","rgba(237, 129, 40, 0.89)","rgba(50, 172, 45, 0.97)"],"datasource":"${DS_GRAPHITE}","editable":true,"error":false,"format":"none","gauge":{"maxValue":100,"minValue":0,"show":false,"thresholdLabels":false,"thresholdMarkers":true},"id":15,"interval":null,"links":[],"maxDataPoints":100,"nullPointMode":"connected","nullText":null,"postfix":"","postfixFontSize":"50%","prefix":"","prefixFontSize":"50%","span":3,"sparkline":{"fillColor":"rgba(31, 118, 189, 0.18)","full":true,"lineColor":"rgb(31, 120, 193)","show":true},"targets":[{"refId":"A","target":"scale(apps.backend.backend_01.counters.requests.count, 0.7)"}],"thresholds":"100,270","title":"Logins","type":"singlestat","valueFontSize":"100%","valueMaps":[{"op":"=","text":"N/A","value":"null"}],"valueName":"avg","mappingTypes":[{"name":"value to text","value":1},{"name":"range to text","value":2}],"rangeMaps":[{"from":"null","to":"null","text":"N/A"}],"mappingType":1},{"cacheTimeout":null,"colorBackground":false,"colorValue":true,"colors":["rgba(245, 54, 54, 0.9)","rgba(237, 129, 40, 0.89)","rgba(50, 172, 45, 0.97)"],"datasource":"${DS_GRAPHITE}","editable":true,"error":false,"format":"none","gauge":{"maxValue":100,"minValue":0,"show":false,"thresholdLabels":false,"thresholdMarkers":true},"id":17,"interval":null,"links":[],"maxDataPoints":100,"nullPointMode":"connected","nullText":null,"postfix":"","postfixFontSize":"50%","prefix":"","prefixFontSize":"50%","span":3,"sparkline":{"fillColor":"rgba(31, 118, 189, 0.18)","full":true,"lineColor":"rgb(31, 120, 193)","show":true},"targets":[{"refId":"A","target":"apps.backend.backend_04.counters.requests.count"}],"thresholds":"100,270","title":"Sign outs","type":"singlestat","valueFontSize":"100%","valueMaps":[{"op":"=","text":"N/A","value":"null"}],"valueName":"avg","mappingTypes":[{"name":"value to text","value":1},{"name":"range to text","value":2}],"rangeMaps":[{"from":"null","to":"null","text":"N/A"}],"mappingType":1},{"cacheTimeout":null,"colorBackground":false,"colorValue":true,"colors":["rgba(245, 54, 54, 0.9)","rgba(237, 129, 40, 0.89)","rgba(50, 172, 45, 0.97)"],"datasource":"${DS_GRAPHITE}","editable":true,"error":false,"format":"none","gauge":{"maxValue":100,"minValue":0,"show":false,"thresholdLabels":false,"thresholdMarkers":true},"id":18,"interval":null,"links":[],"maxDataPoints":100,"nullPointMode":"connected","nullText":null,"postfix":"","postfixFontSize":"50%","prefix":"","prefixFontSize":"50%","span":3,"sparkline":{"fillColor":"rgba(31, 118, 189, 0.18)","full":true,"lineColor":"rgb(31, 120, 193)","show":true},"targets":[{"refId":"A","target":"scale(apps.backend.backend_03.counters.requests.count, 0.3)"}],"thresholds":"100,270","title":"Support calls","type":"singlestat","valueFontSize":"100%","valueMaps":[{"op":"=","text":"N/A","value":"null"}],"valueName":"avg","mappingTypes":[{"name":"value to text","value":1},{"name":"range to text","value":2}],"rangeMaps":[{"from":"null","to":"null","text":"N/A"}],"mappingType":1}],"title":"New row"},{"collapse":false,"editable":true,"height":218.4375,"panels":[{"cacheTimeout":null,"colorBackground":false,"colorValue":true,"colors":["rgba(50, 172, 45, 0.97)","rgba(237, 129, 40, 0.89)","rgba(245, 54, 54, 0.9)"],"datasource":"${DS_GRAPHITE}","editable":true,"error":false,"format":"none","gauge":{"maxValue":300,"minValue":0,"show":true,"thresholdLabels":false,"thresholdMarkers":true},"id":20,"interval":null,"links":[],"maxDataPoints":100,"nullPointMode":"connected","nullText":null,"postfix":"","postfixFontSize":"50%","prefix":"","prefixFontSize":"50%","span":2,"sparkline":{"fillColor":"rgba(31, 118, 189, 0.18)","full":true,"lineColor":"rgb(31, 120, 193)","show":false},"targets":[{"refId":"A","target":"scale(apps.backend.backend_01.counters.requests.count, 0.7)"}],"thresholds":"200,270","title":"Logins","type":"singlestat","valueFontSize":"100%","valueMaps":[{"op":"=","text":"N/A","value":"null"}],"valueName":"avg","mappingTypes":[{"name":"value to text","value":1},{"name":"range to text","value":2}],"rangeMaps":[{"from":"null","to":"null","text":"N/A"}],"mappingType":1},{"cacheTimeout":null,"colorBackground":false,"colorValue":true,"colors":["rgba(50, 172, 45, 0.97)","rgba(237, 129, 40, 0.89)","rgba(245, 54, 54, 0.9)"],"datasource":"${DS_GRAPHITE}","editable":true,"error":false,"format":"none","gauge":{"maxValue":300,"minValue":0,"show":true,"thresholdLabels":false,"thresholdMarkers":true},"id":24,"interval":null,"links":[],"maxDataPoints":100,"nullPointMode":"connected","nullText":null,"postfix":"","postfixFontSize":"50%","prefix":"","prefixFontSize":"50%","span":2,"sparkline":{"fillColor":"rgba(31, 118, 189, 0.18)","full":true,"lineColor":"rgb(31, 120, 193)","show":false},"targets":[{"refId":"A","target":"scale(apps.backend.backend_01.counters.requests.count, 0.2)"}],"thresholds":"200,270","title":"Google hits","type":"singlestat","valueFontSize":"100%","valueMaps":[{"op":"=","text":"N/A","value":"null"}],"valueName":"avg","mappingTypes":[{"name":"value to text","value":1},{"name":"range to text","value":2}],"rangeMaps":[{"from":"null","to":"null","text":"N/A"}],"mappingType":1},{"cacheTimeout":null,"colorBackground":false,"colorValue":true,"colors":["rgba(50, 172, 45, 0.97)","rgba(237, 129, 40, 0.89)","rgba(245, 54, 54, 0.9)"],"datasource":"${DS_GRAPHITE}","editable":true,"error":false,"format":"bytes","gauge":{"maxValue":300,"minValue":0,"show":true,"thresholdLabels":false,"thresholdMarkers":true},"id":22,"interval":null,"links":[],"maxDataPoints":100,"nullPointMode":"connected","nullText":null,"postfix":"","postfixFontSize":"50%","prefix":"","prefixFontSize":"50%","span":2,"sparkline":{"fillColor":"rgba(31, 118, 189, 0.18)","full":true,"lineColor":"rgb(31, 120, 193)","show":false},"targets":[{"refId":"A","target":"scale(apps.backend.backend_01.counters.requests.count, 0.4)"}],"thresholds":"200,270","title":"Memory","type":"singlestat","valueFontSize":"100%","valueMaps":[{"op":"=","text":"N/A","value":"null"}],"valueName":"avg","mappingTypes":[{"name":"value to text","value":1},{"name":"range to text","value":2}],"rangeMaps":[{"from":"null","to":"null","text":"N/A"}],"mappingType":1},{"cacheTimeout":null,"colorBackground":false,"colorValue":true,"colors":["rgba(50, 172, 45, 0.97)","rgba(237, 129, 40, 0.89)","rgba(245, 54, 54, 0.9)"],"datasource":"${DS_GRAPHITE}","editable":true,"error":false,"format":"none","gauge":{"maxValue":300,"minValue":0,"show":true,"thresholdLabels":false,"thresholdMarkers":true},"id":21,"interval":null,"links":[],"maxDataPoints":100,"nullPointMode":"connected","nullText":null,"postfix":"","postfixFontSize":"50%","prefix":"","prefixFontSize":"50%","span":2,"sparkline":{"fillColor":"rgba(31, 118, 189, 0.18)","full":true,"lineColor":"rgb(31, 120, 193)","show":false},"targets":[{"refId":"A","target":"scale(apps.backend.backend_01.counters.requests.count, 0.8)"}],"thresholds":"200,270","title":"Logouts","type":"singlestat","valueFontSize":"100%","valueMaps":[{"op":"=","text":"N/A","value":"null"}],"valueName":"avg","mappingTypes":[{"name":"value to text","value":1},{"name":"range to text","value":2}],"rangeMaps":[{"from":"null","to":"null","text":"N/A"}],"mappingType":1},{"cacheTimeout":null,"colorBackground":false,"colorValue":true,"colors":["rgba(50, 172, 45, 0.97)","rgba(237, 129, 40, 0.89)","rgba(245, 54, 54, 0.9)"],"datasource":"${DS_GRAPHITE}","editable":true,"error":false,"format":"none","gauge":{"maxValue":300,"minValue":0,"show":true,"thresholdLabels":false,"thresholdMarkers":true},"id":26,"interval":null,"links":[],"maxDataPoints":100,"nullPointMode":"connected","nullText":null,"postfix":"","postfixFontSize":"50%","prefix":"","prefixFontSize":"50%","span":2,"sparkline":{"fillColor":"rgba(31, 118, 189, 0.18)","full":true,"lineColor":"rgb(31, 120, 193)","show":false},"targets":[{"refId":"A","target":"scale(apps.backend.backend_01.counters.requests.count, 0.2)"}],"thresholds":"200,270","title":"Google hits","type":"singlestat","valueFontSize":"100%","valueMaps":[{"op":"=","text":"N/A","value":"null"}],"valueName":"avg","mappingTypes":[{"name":"value to text","value":1},{"name":"range to text","value":2}],"rangeMaps":[{"from":"null","to":"null","text":"N/A"}],"mappingType":1},{"cacheTimeout":null,"colorBackground":false,"colorValue":true,"colors":["rgba(50, 172, 45, 0.97)","rgba(237, 129, 40, 0.89)","rgba(245, 54, 54, 0.9)"],"datasource":"${DS_GRAPHITE}","editable":true,"error":false,"format":"none","gauge":{"maxValue":300,"minValue":0,"show":true,"thresholdLabels":false,"thresholdMarkers":true},"id":25,"interval":null,"links":[],"maxDataPoints":100,"nullPointMode":"connected","nullText":null,"postfix":"","postfixFontSize":"50%","prefix":"","prefixFontSize":"50%","span":2,"sparkline":{"fillColor":"rgba(31, 118, 189, 0.18)","full":true,"lineColor":"rgb(31, 120, 193)","show":false},"targets":[{"refId":"A","target":"scale(apps.backend.backend_01.counters.requests.count, 0.8)"}],"thresholds":"200,270","title":"Logouts","type":"singlestat","valueFontSize":"100%","valueMaps":[{"op":"=","text":"N/A","value":"null"}],"valueName":"avg","mappingTypes":[{"name":"value to text","value":1},{"name":"range to text","value":2}],"rangeMaps":[{"from":"null","to":"null","text":"N/A"}],"mappingType":1}],"title":"New row"},{"collapsable":true,"collapse":false,"editable":true,"height":"250px","notice":false,"panels":[{"aliasColors":{"cpu":"#E24D42","memory":"#6ED0E0","statsd.fakesite.counters.session_start.desktop.count":"#6ED0E0"},"annotate":{"enable":false},"bars":false,"datasource":"${DS_GRAPHITE}","editable":true,"fill":3,"grid":{"max":null,"min":0,"threshold1":null,"threshold1Color":"rgba(216, 200, 27, 0.27)","threshold2":null,"threshold2Color":"rgba(234, 112, 112, 0.22)"},"id":4,"interactive":true,"legend":{"avg":false,"current":true,"max":false,"min":true,"show":true,"total":false,"values":false},"legend_counts":true,"lines":true,"linewidth":2,"nullPointMode":"connected","options":false,"percentage":false,"pointradius":5,"points":false,"renderer":"flot","resolution":100,"scale":1,"seriesOverrides":[{"alias":"cpu","fill":0,"lines":true,"yaxis":2,"zindex":2},{"alias":"memory","pointradius":2,"points":true}],"span":4,"spyable":true,"stack":false,"steppedLine":false,"targets":[{"hide":false,"refId":"A","target":"alias(movingAverage(scaleToSeconds(apps.fakesite.web_server_01.counters.request_status.code_302.count, 10), 20), \'cpu\')"},{"refId":"B","target":"alias(statsd.fakesite.counters.session_start.desktop.count, \'memory\')"}],"timeFrom":null,"timeShift":null,"timezone":"browser","title":"Memory / CPU","tooltip":{"msResolution":false,"query_as_alias":true,"shared":false,"value_type":"cumulative","sort":0},"type":"graph","xaxis":{"show":true},"yaxes":[{"format":"bytes","logBase":1,"max":null,"min":null,"show":true},{"format":"percent","logBase":1,"max":null,"min":0,"show":true}],"zerofill":true},{"aliasColors":{"logins":"#7EB26D","logins (-1 day)":"#447EBC"},"annotate":{"enable":false},"bars":false,"datasource":"${DS_GRAPHITE}","editable":true,"fill":1,"grid":{"max":null,"min":0,"threshold1":null,"threshold1Color":"rgba(216, 200, 27, 0.27)","threshold2":null,"threshold2Color":"rgba(234, 112, 112, 0.22)"},"id":3,"interactive":true,"legend":{"alignAsTable":false,"avg":false,"current":true,"max":true,"min":true,"rightSide":false,"show":true,"total":false,"values":false},"legend_counts":true,"lines":true,"linewidth":1,"nullPointMode":"connected","options":false,"percentage":false,"pointradius":5,"points":false,"renderer":"flot","resolution":100,"scale":1,"seriesOverrides":[],"span":4,"spyable":true,"stack":true,"steppedLine":false,"targets":[{"refId":"A","target":"alias(movingAverage(scaleToSeconds(apps.fakesite.web_server_01.counters.requests.count, 1), 2), \'logins\')"},{"refId":"B","target":"alias(movingAverage(timeShift(scaleToSeconds(apps.fakesite.web_server_01.counters.requests.count, 1), \'1h\'), 2), \'logins (-1 hour)\')"}],"timeFrom":null,"timeShift":"1h","timezone":"browser","title":"logins","tooltip":{"msResolution":false,"query_as_alias":true,"shared":false,"value_type":"cumulative","sort":0},"type":"graph","xaxis":{"show":true},"yaxes":[{"format":"short","logBase":1,"max":null,"min":null,"show":true},{"format":"short","logBase":1,"max":null,"min":null,"show":true}],"zerofill":true},{"aliasColors":{"cpu":"#E24D42","memory":"#6ED0E0","statsd.fakesite.counters.session_start.desktop.count":"#6ED0E0"},"annotate":{"enable":false},"bars":false,"datasource":"${DS_GRAPHITE}","editable":true,"fill":3,"grid":{"max":null,"min":0,"threshold1":null,"threshold1Color":"rgba(216, 200, 27, 0.27)","threshold2":null,"threshold2Color":"rgba(234, 112, 112, 0.22)"},"id":19,"interactive":true,"legend":{"avg":false,"current":true,"max":false,"min":true,"show":true,"total":false,"values":false},"legend_counts":true,"lines":true,"linewidth":2,"nullPointMode":"connected","options":false,"percentage":false,"pointradius":5,"points":false,"renderer":"flot","resolution":100,"scale":1,"seriesOverrides":[{"alias":"cpu","fill":0,"lines":true,"yaxis":2,"zindex":2},{"alias":"memory","pointradius":2,"points":true}],"span":4,"spyable":true,"stack":false,"steppedLine":false,"targets":[{"hide":false,"refId":"A","target":"alias(movingAverage(scaleToSeconds(apps.fakesite.web_server_01.counters.request_status.code_302.count, 10), 20), \'cpu\')"},{"refId":"B","target":"alias(statsd.fakesite.counters.session_start.desktop.count, \'memory\')"}],"timeFrom":null,"timeShift":"1h","timezone":"browser","title":"Memory / CPU","tooltip":{"msResolution":false,"query_as_alias":true,"shared":false,"value_type":"cumulative","sort":0},"type":"graph","xaxis":{"show":true},"yaxes":[{"format":"bytes","logBase":1,"max":null,"min":null,"show":true},{"format":"percent","logBase":1,"max":null,"min":0,"show":true}],"zerofill":true}],"title":"test"},{"collapsable":true,"collapse":false,"editable":true,"height":"300px","notice":false,"panels":[{"aliasColors":{"web_server_01":"#B7DBAB","web_server_02":"#7EB26D","web_server_03":"#508642","web_server_04":"#3F6833"},"annotate":{"enable":false},"bars":false,"datasource":"${DS_GRAPHITE}","editable":true,"fill":8,"grid":{"max":null,"min":0,"threshold1":null,"threshold1Color":"rgba(216, 200, 27, 0.27)","threshold2":null,"threshold2Color":"rgba(234, 112, 112, 0.22)"},"id":2,"interactive":true,"legend":{"alignAsTable":false,"avg":false,"current":false,"max":false,"min":false,"rightSide":false,"show":true,"total":false,"values":false},"legend_counts":true,"lines":true,"linewidth":2,"nullPointMode":"connected","options":false,"percentage":false,"pointradius":5,"points":false,"renderer":"flot","resolution":100,"scale":1,"seriesOverrides":[],"span":4,"spyable":true,"stack":true,"steppedLine":false,"targets":[{"refId":"A","target":"aliasByNode(movingAverage(scaleToSeconds(apps.fakesite.*.counters.requests.count, 1), 2), 2)"}],"timeFrom":null,"timeShift":null,"timezone":"browser","title":"server requests","tooltip":{"msResolution":false,"query_as_alias":true,"shared":true,"value_type":"cumulative","sort":0},"type":"graph","xaxis":{"show":true},"yaxes":[{"format":"short","logBase":1,"max":null,"min":null,"show":true},{"format":"short","logBase":1,"max":null,"min":null,"show":true}],"zerofill":true},{"aliasColors":{"upper_25":"#F9E2D2","upper_50":"#F2C96D","upper_75":"#EAB839"},"annotate":{"enable":false},"bars":true,"datasource":"${DS_GRAPHITE}","editable":true,"fill":1,"grid":{"max":null,"min":0,"threshold1":null,"threshold1Color":"rgba(216, 200, 27, 0.27)","threshold2":null,"threshold2Color":"rgba(234, 112, 112, 0.22)"},"id":5,"interactive":true,"legend":{"alignAsTable":true,"avg":true,"current":false,"max":false,"min":false,"rightSide":true,"show":true,"total":false,"values":true},"legend_counts":true,"lines":false,"linewidth":2,"nullPointMode":"connected","options":false,"percentage":false,"pointradius":5,"points":false,"renderer":"flot","resolution":100,"scale":1,"seriesOverrides":[],"span":4,"spyable":true,"stack":true,"steppedLine":false,"targets":[{"refId":"A","target":"aliasByNode(summarize(statsd.fakesite.timers.ads_timer.*, \'4min\', \'avg\'), 4)"}],"timeFrom":null,"timeShift":null,"timezone":"browser","title":"client side full page load","tooltip":{"msResolution":false,"query_as_alias":true,"shared":false,"value_type":"cumulative","sort":0},"type":"graph","xaxis":{"show":true},"yaxes":[{"format":"ms","logBase":1,"max":null,"min":null,"show":true},{"format":"short","logBase":1,"max":null,"min":null,"show":true}],"zerofill":true},{"aliasColors":{"web_server_01":"#B7DBAB","web_server_02":"#7EB26D","web_server_03":"#508642","web_server_04":"#3F6833"},"annotate":{"enable":false},"bars":false,"datasource":"${DS_GRAPHITE}","editable":true,"fill":8,"grid":{"max":null,"min":0,"threshold1":null,"threshold1Color":"rgba(216, 200, 27, 0.27)","threshold2":null,"threshold2Color":"rgba(234, 112, 112, 0.22)"},"id":14,"interactive":true,"legend":{"alignAsTable":false,"avg":false,"current":false,"max":false,"min":false,"rightSide":false,"show":true,"total":false,"values":false},"legend_counts":true,"lines":true,"linewidth":2,"nullPointMode":"connected","options":false,"percentage":false,"pointradius":5,"points":false,"renderer":"flot","resolution":100,"scale":1,"seriesOverrides":[],"span":4,"spyable":true,"stack":true,"steppedLine":false,"targets":[{"refId":"A","target":"aliasByNode(movingAverage(scaleToSeconds(apps.fakesite.*.counters.requests.count, 1), 2), 2)"}],"timeFrom":null,"timeShift":null,"timezone":"browser","title":"server requests","tooltip":{"msResolution":false,"query_as_alias":true,"shared":true,"value_type":"cumulative","sort":0},"type":"graph","xaxis":{"show":true},"yaxes":[{"format":"short","logBase":1,"max":null,"min":null,"show":true},{"format":"short","logBase":1,"max":null,"min":null,"show":true}],"zerofill":true}],"title":""},{"collapsable":true,"collapse":false,"editable":true,"height":"200px","notice":false,"panels":[{"aliasColors":{"cpu1":"#EF843C","cpu2":"#EAB839","upper_25":"#B7DBAB","upper_50":"#7EB26D","upper_75":"#629E51","upper_90":"#629E51","upper_95":"#508642"},"annotate":{"enable":false},"bars":false,"datasource":"${DS_GRAPHITE}","editable":true,"fill":3,"grid":{"max":null,"min":null,"threshold1":null,"threshold1Color":"rgba(216, 200, 27, 0.27)","threshold2":null,"threshold2Color":"rgba(234, 112, 112, 0.22)"},"id":6,"interactive":true,"legend":{"alignAsTable":true,"avg":true,"current":true,"legendSideLastValue":true,"max":false,"min":false,"rightSide":true,"show":false,"total":false,"values":true},"legend_counts":true,"lines":true,"linewidth":2,"links":[],"nullPointMode":"connected","options":false,"percentage":false,"pointradius":1,"points":false,"renderer":"flot","resolution":100,"scale":1,"seriesOverrides":[{"alias":"this is  test of breaking","yaxis":1}],"span":12,"spyable":true,"stack":false,"steppedLine":false,"targets":[{"refId":"A","target":"aliasByNode(statsd.fakesite.timers.ads_timer.*,4)"},{"refId":"B","target":"alias(scale(statsd.fakesite.timers.ads_timer.upper_95,-1),\'cpu1\')"},{"refId":"C","target":"alias(scale(statsd.fakesite.timers.ads_timer.upper_75,-1),\'cpu2\')"}],"timeFrom":null,"timeShift":null,"timezone":"browser","title":"","tooltip":{"msResolution":false,"query_as_alias":true,"shared":false,"value_type":"cumulative","sort":0},"transparent":true,"type":"graph","xaxis":{"show":false},"yaxes":[{"format":"ms","logBase":1,"max":null,"min":null,"show":false},{"format":"short","logBase":1,"max":null,"min":null,"show":false}],"zerofill":true}],"title":"test"}],"time":{"from":"now-30m","to":"now"},"timepicker":{"collapse":false,"enable":true,"notice":false,"now":true,"refresh_intervals":["5s","10s","30s","1m","5m","15m","30m","1h","2h","1d"],"status":"Stable","time_options":["5m","15m","1h","2h"," 6h","12h","24h","2d","7d","30d"],"type":"timepicker"},"templating":{"enable":false,"list":[]},"annotations":{"enable":false,"list":[]},"refresh":false,"schemaVersion":12,"version":5,"links":[],"gnetId":null},"overwrite":true,"inputs":[{"name":"DS_GRAPHITE","type":"datasource","pluginId":"graphite","value":"graphite"}]}' --compressed
done

