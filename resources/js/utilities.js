module.exports = {

  // add any utility classes here
  loadExecuteRequestor: function () {
      ExecuteOrDelayUntilScriptLoaded(function () {
        var scriptbase = _spPageContextInfo.siteAbsoluteUrl + "/_layouts/15/";

        $.getScript(scriptbase + "SP.RequestExecutor.js", function () {
            utilities.logToConsole({
              message: "request executor is now loaded"
            });
        });
      }, "sp.js");
  },
  logToConsole: function (options) {
      let settings = $.extend(true, {}, {
        message: ''
      });
      return console.log(settings.message);
  },
  responsiveImages: function(options) {
    let settings = $.extend(true, {}, {
      image: '.responsive-image'
    }, options);

    $(settings.image).each(function(){
      let thisParent = $(this).parent();
      let thisImage = $(this);
      let checkExist = setInterval(function() {

         if($(thisImage).width() != 0 && thisParent.length != 0) {
           thisParent.addClass('responsive-image-container');
           let imageRatio = $(thisImage).width()/$(thisImage).height();
           let containerRatio = $(thisParent).width()/$(thisParent).height();

           if(imageRatio > containerRatio){
             $(thisImage).width('auto').height('100%');
           } else {
             $(thisImage).width('100%').height('auto');
           }

           clearInterval(checkExist);

         }
      }, 100);

    });
  },
  showIfNotEmpty: function(options){
    let settings = $.extend(true, {}, {
      element: '',
      showElement: ''
    }, options);

    $(settings.element).each(function(){
      let thistext = $(this).text().trim();

      if(settings.showElement){
        if(thistext.length > 0){
          $(settings.showElement).show();
        }
      } else {
        if(thistext.length > 0){
          $(this).show();
        }
      }
    });
  },
  siteBreadcrumb: function(){
    let rootAbsolute = _spPageContextInfo.siteAbsoluteUrl;
    let rootRelative = _spPageContextInfo.siteServerRelativeUrl;
    let thisSite = _spPageContextInfo.webServerRelativeUrl;
    let thisSiteTitle = _spPageContextInfo.webTitle;
    let websArray = thisSite.replace(rootRelative+'/', '').split('/');
    websArray.pop();

    if(thisSite != rootRelative){
      $('header h2.brand').addClass('university-brand');
      $('header .breadcrumb-title').append('<span class="breadcrumb-separator last-separator">&nbsp;/&nbsp;</span><span class="last-breadcrumb"><a href="'+thisSite+'">'+thisSiteTitle+'</a></span>');

      for(var i=0; i < websArray.length; i++) {
        let thisURL = rootAbsolute+'/'+websArray[i];
        $.ajax({
          type: 'GET',
          headers: {
            'accept': 'application/json;odata=verbose',
            "X-RequestDigest": bones.digest
          },
          url: thisURL + '/_api/web/title',
          success: function(data) {
            let parentSiteTitle = data.d.Title;
            $('<span class="breadcrumb-separator">&nbsp;/&nbsp;</span><span class="breadcrumb-item"><a href="'+thisURL+'">'+parentSiteTitle+'</a></span>').insertBefore('.last-separator');
          }
        });
      }
    }
  },
  scrollAction: function(){
    var viewport = $(window);
    var body = $('body');
    var scrollbody = $('#s4-workspace');
    var wh = viewport.height();
    var st = wh / 4;

    // scroll
    scrollbody.on('scroll', function(){
    	var t = $(this).scrollTop();
    	if(t > st){
    		body.addClass('scroll-down');
    	}
    	else{
    		body.removeClass('scroll-down');
    	}
    });
    scrollbody.trigger('scroll');

    $('[data-scroll]').on('click',function(e){
      e.preventDefault();
      var ribbonHeight = $('#suiteBarDelta').outerHeight() + $('#s4-ribbonrow').outerHeight();
      var contentOffset = $('#s4-bodyContainer').offset().top;
      var thisElement = $(this).attr('data-scroll');
      var scrolltolocation = $('.'+thisElement).offset().top - contentOffset - 73;

      $("#s4-workspace").stop().animate({
          scrollTop: scrolltolocation
      });

    });

  }
}
