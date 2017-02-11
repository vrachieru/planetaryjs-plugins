// Plugin to connect two geographical points with a particle.
  function particles(config) {
    var particles = [];
    config = config || {};

    var addParticle = function(slat, slng, dlat, dlng, options) {
      options       = options || {};
      options.color = options.color || config.color || 'white';
      options.ttl   = options.ttl   || config.ttl   || 2000;

      var particle  = {
        time: new Date(),
        options: options,
        source: {
          lat: slat,
          lng: slng
        },
        destination : {
          lat: dlat,
          lng: dlng
        }
      };

      particles.push(particle);
    };

    var drawParticles = function(planet, context, now) {
      var newParticles = [];

      for (var i = 0; i < particles.length; i++) {
        var particle = particles[i];
        var alive = now - particle.time;

        if (alive < particle.options.ttl) {
          newParticles.push(particle);
          drawParticle(planet, context, now, alive, particle);
        }
      }

      particles = newParticles;
    };

    var drawParticle = function(planet, context, now, alive, particle) {
      var percent = alive / particle.options.ttl;
      var alpha = 1 - percent;

      var color = d3.rgb(particle.options.color);
      color = "rgba(" + color.r + "," + color.g + "," + color.b + "," + alpha + ")";

      var particle = d3.geo
        .circle()
        .origin(calculateMidpoint(particle, percent))
        .angle(0.3)()

      context.fillStyle = color;
      context.beginPath();
      planet.path.context(context)(particle);
      context.fill();
    };

    var calculateMidpoint = function(particle, percent) {
      return d3.interpolateObject(
        [particle.source.lat, particle.source.lng],
        [particle.destination.lat, particle.destination.lng]
      )(percent);
    };

    return function (planet) {
      planet.plugins.particles = {
        add: addParticle
      };

      planet.onDraw(function() {
        var now = new Date();
        planet.withSavedContext(function(context) {
          drawParticles(planet, context, now);
        });
      });
    };
  };

