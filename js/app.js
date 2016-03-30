(function(angular, window) {
  'use strict';

  var baseUrl = 'http://res.cloudinary.com/hoah/image/upload/';
  var eventUrl = 'https://dl72tzizg8.execute-api.eu-west-1.amazonaws.com/dev/get';
  var showEvents = 10;
  var initMapCB = ('initMap' + Math.random()).replace('.', '');
  var mapsApiKey = 'AIzaSyAEB5kpoobXdUbylkkRitbCdwHVB4w1MUE';
  var mapsUrl = 'https://maps.googleapis.com/maps/api/js?key=' + mapsApiKey + '&callback=' + initMapCB;

  function loadGMaps() {
    var script = document.createElement('script');

    script.setAttribute('type', 'text/javascript');
    script.setAttribute('async', '');
    script.setAttribute('defer', '');
    script.setAttribute('src', mapsUrl);

    document.getElementsByTagName('head').item(0).appendChild(script);
  }

  function getImage(imgId, elem) {
    var rect = elem.getClientRects()[0];

    return [
      'url("',
      baseUrl,
      'w_',
      Math.ceil(rect.width / 100) * 100,
      ',h_',
      Math.ceil(rect.height / 100) * 100,
      ',q_70',
      ',c_fill',
      '/',
      imgId,
      '.jpg")'
    ].join('');
  }

  function prependZero(int) {
    if (int <= 9) {
      return '0' + int;
    }

    return int;
  }

  function enrichEvent(event) {
    var date = new Date(event.start_time);

    event.date = [
      prependZero(date.getDate()),
      '.',
      prependZero(date.getMonth() + 1),
      '.',
      date.getFullYear()
    ].join('');

    event.time = [
      prependZero(date.getHours()),
      ':',
      prependZero(date.getMinutes()),
    ].join('');

    return event;
  }

  angular.module('houseonahill', [])
    .service('gMap', function($q) {
      var d = $q.defer();

      window[initMapCB] = function() {
        d.resolve(window.google.maps);
      };

      loadGMaps();

      return d.promise;
    })
    .directive('hoahImage', function() {
      return {
        restrict: 'A',
        link: function(scope, $elem, attr) {
          if (attr.hoahImage && attr.hoahImage.length) {
            $elem.css(
              'background-image',
              getImage(attr.hoahImage, $elem[0])
            );
          }
        }
      }
    })
    .component('hoahEvents', {
      template: [
        '<div class="events">',
          '<p ng-if="loading">Loading</p>',
          '<div ng-if="!loading">',
            '<ul>',
              '<li ng-repeat="event in events | limitTo: show">',
                '<div class="quick left">',
                  '<span class="date">{{ event.date }}</span>',
                  '<br>',
                  '<span class="locationname" ng-if="event.place.name">{{ event.place.name }}<br></span>',
                  '<span class="time">Ab ca. {{ event.time }} Uhr</span>',
                '</div>',
                '<h3>{{ event.name }}</h3>',
                '<hoah-location ng-if="!private(event.name) && event.place.location"',
                  'name="event.place.name"',
                  'location="event.place.location">',
                '</hoah-location>',
                '<p ng-if="event.description">{{ event.description }}</p>',
                '<span class="clear"></span>',
              '</li>',
            '</ul>',
            '<button class="more" ng-if="show < max" ng-click="more()">Mehr anzeigen</button>',
          '</div>',
        '</div>'
      ].join('\n'),
      controller: function($http, $scope) {
        $scope.loading = true;
        $scope.show = showEvents;
        $scope.max = 0;

        $scope.more = function() {
          $scope.show += showEvents;
        };

        $scope.private = function(title) {
          return title.indexOf('privat') !== -1;
        };

        $http.get(eventUrl).then(function(response) {
          $scope.loading = false;
          $scope.events = response.data.map(enrichEvent);
          $scope.max = $scope.events.length;
        });
      }
    })
    .component('hoahLocation', {
      template: [
        '<p ng-if="!show">',
          '<a href="#show" ng-click="toggle($event)">',
            'Location-Details zu "{{ $ctrl.name }}" anzeigen',
          '</a>',
        '</p>',
        '<div ng-if="show" class="location">',
          '<h4>{{ $ctrl.name }}</h4>',
          '<p>',
            '<span ng-if="$ctrl.location.street">{{ $ctrl.location.street }}</span>',
            '<span ng-if="$ctrl.location.zip && $ctrl.location.city">{{ $ctrl.location.zip }} {{ $ctrl.location.city }}</span>',
            '<span ng-if="$ctrl.location.country">{{ $ctrl.location.country }}</span>',
          '</p>',
          '<hoah-map',
            'class="hoah-map"',
            'lat="{{ $ctrl.location.latitude }}"',
            'name="{{ $ctrl.name }}"',
            'lng="{{ $ctrl.location.longitude }}"',
          '></hoah-map>',
        '</div>'
      ].join('\n'),
      bindings: {
        name: '=',
        location: '='
      },
      controller: function($scope) {
        $scope.show = false;
        $scope.toggle = function($event) {
          $event.preventDefault();
          $scope.show = !$scope.show;
        }
      },
    })
    .directive('hoahMap', function(gMap) {
      return {
        scope: {
          'name': '@',
          'lat': '@',
          'lng': '@'
        },
        link: function(scope, elem) {
          gMap.then(function(googleMaps) {
            var latlng = new googleMaps.LatLng(scope.lat, scope.lng);
            var options = {
              zoom: 13,
              mapTypeId: googleMaps.MapTypeId.ROADMAP,
              center: latlng
            }

            var map = new googleMaps.Map(elem[0], options);
            var marker = new googleMaps.Marker({
              position: latlng,
              map: map,
              animation: googleMaps.Animation.DROP,
              title: scope.name
            });
          });
        }
      }
    });

})(window.angular, window);
