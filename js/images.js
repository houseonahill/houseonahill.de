jQuery(function($) {
  'use strict';

  var baseUrl = 'http://res.cloudinary.com/hoah/image/upload/';
  var $window = $(window);


  function getImage($section, imgId) {
    return [
      'url("',
      baseUrl,
      'w_',
      Math.ceil($section.width() / 100) * 100,
      ',h_',
      Math.ceil($section.height() / 100) * 100,
      ',q_70',
      ',c_fill',
      '/',
      imgId,
      '.jpg")'
    ].join('');
  }

  $('.section').each(function() {
    var $section = $(this);
    var imgId = $section.data('image');

    if (!imgId) {
      return;
    }

    $section.css('background-image', getImage($section, imgId));
  });

});