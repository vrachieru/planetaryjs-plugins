  planetaryjs.plugins.pings = function(config) {
    var pings = [];
    config = config || {};

    var addPing = function(lng, lat, options) {
      options = options || {};
      options.color = options.color || config.color || 'white';
      options.angle = options.angle || config.angle || 5;
      options.ttl   = options.ttl   || config.ttl   || 2000;
      var ping = { time: new Date(), options: options };
      if (config.latitudeFirst) {
        ping.lat = lng;
        ping.lng = lat;
      } else {
        ping.lng = lng;
        ping.lat = lat;
      }
      pings.push(ping);
    };

    var drawPings = function(planet, context, now) {
      var newPings = [];
      for (var i = 0; i < pings.length; i++) {
        var ping = pings[i];
        var alive = now - ping.time;
        if (alive < ping.options.ttl) {
          newPings.push(ping);
          drawPing(planet, context, now, alive, ping);
        }
      }
      pings = newPings;
    };

    var drawPing = function(planet, context, now, alive, ping) {
      var alpha = 1 - (alive / ping.options.ttl);
      var color = d3.rgb(ping.options.color);
      color = "rgba(" + color.r + "," + color.g + "," + color.b + "," + alpha + ")";
      context.strokeStyle = color;
      var circle = d3.geo.circle().origin([ping.lng, ping.lat])
        .angle(alive / ping.options.ttl * ping.options.angle)();
      context.beginPath();
      planet.path.context(context)(circle);
      context.stroke();
    };

    return function (planet) {
      planet.plugins.pings = {
        add: addPing
      };

      planet.onDraw(function() {
        var now = new Date();
        planet.withSavedContext(function(context) {
          drawPings(planet, context, now);
        });
      });
    };
  };
