const lists = window.lists = require('./lists');
const utilities = window.utilities = require('./utilities');

module.exports = {

  // skeleton code for web part
  load: function(options){
    let settings = $.extend(true, {}, {
      trigger: '.wp-universities',
      container: '.universities-container',
      contenttypeid: '0x01009E2AB436042E524F87C729D9C0C55549' //universitywebpart
    }, options);

    (function($){

      lists.buildwebpart({
        trigger: settings.trigger,
        container: settings.container
      });

      $(settings.container).each(function(){

        var thisContainer = $(this);

        // remove any previously-fetched items
        thisContainer.find('.container').remove();

        // get list name
        var listname = thisContainer.closest('.ms-webpartzone-cell').find(settings.trigger).attr('data-list');

        // get list items
        if(!bones.page.editmode){
          lists.getListItems({
            listname: listname,
            fields: 'Title,Enabled,LinkURL,SortOrder,ComingSoon,OpenLinkInNewWindow',
            orderby: 'SortOrder'
          }, function(items){
            if(thisContainer.closest('.ms-webpartzone-cell').find('.ms-webpart-chrome-title').size() > 0){
              thisContainer.closest('.ms-webpartzone-cell').find('.ms-webpart-chrome-title').hide();
              var webpartTitle = thisContainer.closest('.ms-webpartzone-cell').find('.js-webpart-titleCell').attr('title').split(' - ')[0];
              var webpartDescription = thisContainer.closest('.ms-webpartzone-cell').find('.js-webpart-titleCell').attr('title').split(' - ')[1];
              if(webpartTitle.toLowerCase() != 'untitled'){
                if(webpartDescription != undefined){
                  var webpartHeading = '<h1>'+webpartTitle+'</h1><div class="university-description">'+webpartDescription+'</div>';
                } else {
                  var webpartHeading = '<h1>'+webpartTitle+'</h1>';
                }
              } else {
                var webpartHeading = '';
              }
            } else {
              var webpartHeading = '<h1>Functional Universities</h1>';
            }
            var itemsdata = items.d.results;
            thisContainer.append('<div class="container">'+webpartHeading+'<ul/></div>');
            var thiscontainer = thisContainer.find('ul');
            for (var i = 0; i < itemsdata.length; i++) {
              var thisTitle = itemsdata[i].Title;
              var thisEnabled = itemsdata[i].Enabled;
              var thisLinkURL = itemsdata[i].LinkURL;
              var thisComingSoon = itemsdata[i].ComingSoon;
              var newWindow = itemsdata[i].OpenLinkInNewWindow;

              if(thisEnabled){
                if(thisComingSoon){
                  thiscontainer.append('<li class="university-link"><span class="disabled"><span class="university-link-text">'+thisTitle+'<span class="coming-soon-text">Coming Soon</span></span></span></li>');
                } else {
                  if(newWindow){
                    thiscontainer.append('<li class="university-link"><a href="'+thisLinkURL.Url+'" alt="'+thisTitle+'" target="_blank"><span class="university-link-text">'+thisTitle+'</span></a></li>');
                  } else {
                    thiscontainer.append('<li class="university-link"><a href="'+thisLinkURL.Url+'" alt="'+thisTitle+'"><span class="university-link-text">'+thisTitle+'</span></a></li>');
                  }
                }
              }
            }
          });
        };
      });

      // load editor
      lists.editwebpart({
        trigger: settings.trigger,
        container: settings.container,
        contenttypeid: settings.contenttypeid
      });

    }(jQuery));
  }
};
