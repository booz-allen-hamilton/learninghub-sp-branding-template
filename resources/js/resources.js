const lists = window.lists = require('./lists');
const utilities = window.utilities = require('./utilities');

module.exports = {

  // skeleton code for web part
  load: function(options){
    let settings = $.extend(true, {}, {
      trigger: '.wp-resources',
      container: '.resources-container',
      contenttypeid: '0x0100B038C6A9EF4F10468708A64AC9289D8F' // resourceswebpart
    }, options);

    (function($){

      lists.buildwebpart({
        trigger: settings.trigger,
        container: settings.container
      });

      $(settings.container).each(function(){

        var thisContainer = $(this);

        // remove any previously-fetched items
        thisContainer.children('.resource-items').remove();

        if(thisContainer.closest('.ms-webpartzone-cell').find('.ms-webpart-chrome-title').size() > 0){
          var webpartDescription = thisContainer.closest('.ms-webpartzone-cell').find('.js-webpart-titleCell').attr('title').split(' - ')[1];
          if(webpartDescription.length > 0){
            thisContainer.closest('.ms-webpartzone-cell').find('h2.ms-webpart-titleText').append('<div class="webpart-description">'+webpartDescription)+'</div>';
          }
        }

        // get list name
        var listname = thisContainer.closest('.ms-webpartzone-cell').find(settings.trigger).attr('data-list');

        // get list items
        if(!bones.page.editmode){
          lists.getListItems({
            listname: listname,
            fields: 'Title,Desc,Enabled,LinkURL,SortOrder,Id,OpenLinkInNewWindow',
            orderby: 'SortOrder'
          },function(items){
            var itemsdata = items.d.results;
            var thiscontainer = thisContainer;
            for (var i = 0; i < itemsdata.length; i++) {
              var thisTitle = itemsdata[i].Title;
              var thisDesc= itemsdata[i].Desc;
              var thisEnabled = itemsdata[i].Enabled;
              var thisID = itemsdata[i].Id;
              var newWindow = itemsdata[i].OpenLinkInNewWindow;

              if(itemsdata[i].Desc === null){
                thisDesc = '';
              }

              if(thisEnabled){
                if(itemsdata[i].LinkURL != null && itemsdata[i].LinkURL != undefined) {
                  var thisUrl = itemsdata[i].LinkURL.Url;
                  if(newWindow){
                    thiscontainer.append('<a href="'+thisUrl+'" class="resource-item" target="_blank"><div class="resource-image resource-image-'+thisID+'"></div><div class="resource-content"><h2 class="resource-title">'+thisTitle+'</h2><div class="resource-desc">'+thisDesc+'</div></div></a>');
                  } else {
                    thiscontainer.append('<a href="'+thisUrl+'" class="resource-item"><div class="resource-image resource-image-'+thisID+'"></div><div class="resource-content"><h2 class="resource-title">'+thisTitle+'</h2><div class="resource-desc">'+thisDesc+'</div></div></a>');
                  }
                } else {
                  thiscontainer.append('<div class="resource-item"><div class="resource-image resource-image-'+thisID+'"></div><div class="resource-content"><h2 class="resource-title">'+thisTitle+'</h2><div class="resource-desc">'+thisDesc+'</div></div></div>');
                }
              }

              lists.getListFieldValuesHTML({
                listname: listname,
                fields: 'ThumbnailImage',
                id: thisID
              }, function(fields,id){
                var thisImage = fields.d.ThumbnailImage;
                if(thisImage != null){
                  thisContainer.find('.resource-image-'+id).append(thisImage);
                }
              });
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
