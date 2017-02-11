// Plugin to connect two geographical points with a line
  function lines(config) {
    var lines = [];
    config = config || {};

    var addLine = function(slng, slat, dlng, dlat, options) {
      options = options || {};
      options.color = options.color || config.color || 'white';
      options.ttl   = options.ttl   || config.ttl   || 2000;
      var line = { time: new Date(), options: options };
        line.slat = slng;
        line.slng = slat;
        line.dlat = dlng;
        line.dlng = dlat;
      lines.push(line);
    };

    var drawLines = function(planet, context, now) {
      var newLines = [];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var alive = now - line.time;
        if (alive < line.options.ttl) {
          newLines.push(line);
          drawLine(planet, context, now, alive, line);
        }
      }
      lines = newLines;
    };

    var drawLine = function(planet, context, now, alive, line) {
      var alpha = 1 - (alive / line.options.ttl);
      var color = d3.rgb(line.options.color);
      color = "rgba(" + color.r + "," + color.g + "," + color.b + "," + alpha + ")";

      var gradient = context.createLinearGradient(line.slat, line.dlat, line.slng, line.dlng);
      gradient.addColorStop(1, "green");
      gradient.addColorStop(1, "red");

      var m = midpoint(line.slat, line.slng, line.dlat, line.dlng, percent(alive, line.options.ttl));

      var line = {type: "LineString", coordinates: [[line.slat, line.slng], m]}

      context.strokeStyle = color;
      context.beginPath();
      planet.path.context(context)(line);
      context.stroke();
    };

    return function (planet) {
      planet.plugins.lines = {
        add: addLine
      };

      planet.onDraw(function() {
        var now = new Date();
        planet.withSavedContext(function(context) {
          drawLines(planet, context, now);
        });
      });
    };
  };
