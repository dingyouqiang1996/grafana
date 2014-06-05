define([
  'underscore',
  'crypto',
],
function (_, crypto) {
  "use strict";

  return function Settings (options) {
    /**
     * To add a setting, you MUST define a default. Also,
     * THESE ARE ONLY DEFAULTS.
     * They are overridden by config.js in the root directory
     * @type {Object}
     */
    var defaults = {
      elasticsearch                 : "http://"+window.location.hostname+":9200",
      datasources                   : {
        default: {
          url: "http://"+window.location.hostname+":8080",
          default: true
        }
      },
      panel_names                   : [],
      default_route                 : '/dashboard/file/default.json',
      grafana_index                 : 'grafana-dash',
      elasticsearch_all_disabled    : false,
      timezoneOffset                : null,
      playlist_timespan             : "1m",
      unsaved_changes_warning       : true,

      time_formats : {
        formats : [
          { maxSecPerTick : 45, format : "%H:%M:%S" },
          { maxSecPerTick : 3600, format : "%H:%M" },
          { maxSecPerTick : 80000, format : "%m/%d %H:%M" },
          { maxSecPerTick : 2419200, format : "%m/%d" },
        ],
        fallbackForLargeTimespans : "%Y-%m",
        fallbackForUndefinedSecPerTick : "%H:%M"
      }
    };

    // This initializes a new hash on purpose, to avoid adding parameters to
    // config.js without providing sane defaults
    var settings = {};
    _.each(defaults, function(value, key) {
      settings[key] = typeof options[key] !== 'undefined' ? options[key]  : defaults[key];
    });

    var parseBasicAuth = function(datasource) {
      var passwordEnd = datasource.url.indexOf('@');
      if (passwordEnd > 0) {
        var userStart = datasource.url.indexOf('//') + 2;
        var userAndPassword = datasource.url.substring(userStart, passwordEnd);
        var bytes = crypto.charenc.Binary.stringToBytes(userAndPassword);
        datasource.basicAuth = crypto.util.bytesToBase64(bytes);

        var urlHead = datasource.url.substring(0, userStart);
        datasource.url = urlHead + datasource.url.substring(passwordEnd + 1);
      }

      return datasource;
    };

    var parseMultipleHosts = function(datasource) {
      datasource.urls = _.map(datasource.url.split(","), function (url) { return url.trim(); });
      return datasource;
    };

    if (options.graphiteUrl) {
      settings.datasources = {
        graphite: {
          type: 'graphite',
          url: options.graphiteUrl,
          default: true
        }
      };
    }

    _.each(settings.datasources, function(datasource, key) {
      datasource.name = key;
      parseBasicAuth(datasource);
      if (datasource.type === 'influxdb') { parseMultipleHosts(datasource); }
    });

    var elasticParsed = parseBasicAuth({ url: settings.elasticsearch });
    settings.elasticsearchBasicAuth = elasticParsed.basicAuth;
    settings.elasticsearch = elasticParsed.url;

    settings.time_formats.formats = _.sortBy( settings.time_formats.formats, function( format ) { return format.maxSecPerTick; } );
    return settings;
  };
});
