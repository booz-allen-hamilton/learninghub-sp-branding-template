module.exports = {

  // skeleton code for web part
  load: function(options){
    let settings = $.extend(true, {}, {
      container: '',
      originalwidth: 1600
    }, options);

    (function($){
      var thisMap = $(settings.container).find('map');
      var thisArea = $(settings.container).find('area');
      var thisImage = $(settings.container).find('img');
      var originalCoords = [];
  	$(thisArea).each(function(i){
  		originalCoords[i] = $(this).attr('coords');
  		originalCoords[i] = originalCoords[i].split(',');
  	});
  	var newWidth = parseInt($(thisImage).width());
  	var percentDifference = newWidth / settings.originalwidth;
  	$(thisArea).each(function(i){
  		var newCoords = [];
  		$.each(originalCoords[i],function(e){
  			newCoords.push(originalCoords[i][e] * percentDifference);
  		});
  		var newCoords = newCoords.join(',');
  		$(this).attr('coords', newCoords);
  	});
  	// resize window
  	$(window).resize(function(){
  		var newWidth = parseInt($(thisImage).width());
  		var percentDifference = newWidth / settings.originalwidth;
  		$(thisArea).each(function(i){
  			var newCoords = [];
  			$.each(originalCoords[i],function(e){
  				newCoords.push(originalCoords[i][e] * percentDifference);
  			});
  			var newCoords = newCoords.join(',');
  			$(this).attr('coords', newCoords);
  		});
  	});
    }(jQuery));
  }
};
