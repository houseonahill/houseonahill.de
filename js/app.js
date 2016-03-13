
(function(angular, window) {
  'use strict';

  var baseUrl = 'http://res.cloudinary.com/hoah/image/upload/';

  function getImage(elem, imgId) {
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

  angular.module('houseonahill', [])
    .directive('hoahImage', function() {
      return {
        restrict: 'A',
        link: function(scope, $elem, attr) {
          $elem.css(
            'background-image',
            getImage($elem[0], attr.hoahImage)
          );
        }
      }
    });

})(window.angular, window);
