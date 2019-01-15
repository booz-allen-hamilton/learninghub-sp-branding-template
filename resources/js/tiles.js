const lists = window.lists = require('./lists');
const utilities = window.utilities = require('./utilities');

module.exports = {

  // skeleton code for web part
  load: function(options){
    let settings = $.extend(true, {}, {
      trigger: '.wp-tiles',
      container: '.tiles-container',
      contenttypeid: '0x01006EE6A902D00DD140999A126BFDF9EEEA' // tileswebpart
    }, options);

    (function($){

      lists.buildwebpart({
        trigger: settings.trigger,
        container: settings.container
      });

      $(settings.container).each(function(){

        var thisContainer = $(this);

        if(thisContainer.closest('.ms-webpartzone-cell').find('.ms-webpart-chrome-title').size() > 0){
          var webpartDescription = thisContainer.closest('.ms-webpartzone-cell').find('.js-webpart-titleCell').attr('title').split(' - ')[1];
          if(webpartDescription.length > 0){
            thisContainer.closest('.ms-webpartzone-cell').find('h2.ms-webpart-titleText').append('<div class="webpart-description">'+webpartDescription)+'</div>';
          }
        }

        // remove any previously-fetched items
        thisContainer.children('a.tiles-link').remove();

        // get list name
        var listname = thisContainer.closest('.ms-webpartzone-cell').find(settings.trigger).attr('data-list');

        // get list items
        if(!bones.page.editmode){
          lists.getListItems({
            listname: listname,
            fields: 'Title,Enabled,LinkURL,SortOrder,Desc,OpenLinkInNewWindow',
            orderby: 'SortOrder'
          }, function(items){
            var itemsdata = items.d.results;
            var thiscontainer = thisContainer;
            for (var i = 0; i < itemsdata.length; i++) {
              var thisTitle = itemsdata[i].Title;
              var thisDesc = itemsdata[i].Desc;
              var thisEnabled = itemsdata[i].Enabled;
              var thisLinkURL = itemsdata[i].LinkURL;
              var newWindow = itemsdata[i].OpenLinkInNewWindow;

              if(itemsdata[i].Desc === null){
                thisDesc = '';
              }

              if(thisEnabled){
                if(newWindow){
                  thiscontainer.append('<a href="'+thisLinkURL.Url+'" alt="'+thisTitle+'" class="tiles-link tiles-link-'+i%6+'" target="_blank"><span class="tiles-link-text"><span class="tiles-link-title">'+thisTitle+'</span><span class="tiles-link-desc">'+thisDesc+'</span></span></a>');
                } else {
                  thiscontainer.append('<a href="'+thisLinkURL.Url+'" alt="'+thisTitle+'" class="tiles-link tiles-link-'+i%6+'"><span class="tiles-link-text"><span class="tiles-link-title">'+thisTitle+'</span><span class="tiles-link-desc">'+thisDesc+'</span></span></a>');
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
