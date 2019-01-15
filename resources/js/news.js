const lists = window.lists = require('./lists');
const utilities = window.utilities = require('./utilities');

module.exports = {

  // skeleton code for web part
  load: function(options){
    let settings = $.extend(true, {}, {
      trigger: '.wp-news',
      container: '.news-container',
      contenttypeid: '0x0100AEA90137ECD81349B17DB7219FE344CD' // newswebpart
    }, options);

    (function($){

      lists.buildwebpart({
        trigger: settings.trigger,
        container: settings.container
      });

      $(settings.container).each(function(){

        var thisContainer = $(this);

        // remove any previously-fetched items
        thisContainer.find('ul').remove();

        // get list name
        var listname = thisContainer.closest('.ms-webpartzone-cell').find(settings.trigger).attr('data-list');

        // get list items
        if(!bones.page.editmode){
          lists.getListItems({
            listname: listname,
            fields: 'Title,Enabled,CallToAction,SortOrder,Excerpt,Id,OpenLinkInNewWindow',
            orderby: 'SortOrder'
          },function(items){
            var itemsdata = items.d.results;
            thisContainer.append('<ul/>');
            var thiscontainer = thisContainer.find('ul');
            for (var i = 0; i < itemsdata.length; i++) {
              var thisTitle = itemsdata[i].Title;
              var thisEnabled = itemsdata[i].Enabled;
              var thisExcerpt = itemsdata[i].Excerpt;
              var thisID = itemsdata[i].Id;
              var newWindow = itemsdata[i].OpenLinkInNewWindow;

              if(itemsdata[i].Excerpt === null){
                thisExcerpt = '';
              }

              if(thisEnabled){
                if(itemsdata[i].CallToAction != null && itemsdata[i].CallToAction != undefined) {
                  var thisButtonText = itemsdata[i].CallToAction.Description;
                  var thisButtonUrl = itemsdata[i].CallToAction.Url;
                  if(newWindow){
                    thiscontainer.append('<li class="news-slide row no-gutter"><div class="news-slide-image news-image-'+thisID+' col-sm-7"></div><div class="news-slide-content col-sm-5"><h1>News & Announcements</h1><div class="news-slide-title">'+thisTitle+'</div><div class="news-slide-excerpt">'+thisExcerpt+'</div><div class="news-slide-btn"><a href="'+thisButtonUrl+'" class="bah-cta" target="_blank">'+thisButtonText+'</a></div></div></li>');
                  } else {
                    thiscontainer.append('<li class="news-slide row no-gutter"><div class="news-slide-image news-image-'+thisID+' col-sm-7"></div><div class="news-slide-content col-sm-5"><h1>News & Announcements</h1><div class="news-slide-title">'+thisTitle+'</div><div class="news-slide-excerpt">'+thisExcerpt+'</div><div class="news-slide-btn"><a href="'+thisButtonUrl+'" class="bah-cta">'+thisButtonText+'</a></div></div></li>');
                  }
                } else {
                  thiscontainer.append('<li class="news-slide row no-gutter"><div class="news-slide-image news-image-'+thisID+' col-sm-7"></div><div class="news-slide-content col-sm-5"><h1>News & Announcements</h1><div class="news-slide-title">'+thisTitle+'</div><div class="news-slide-excerpt">'+thisExcerpt+'</div></div></li>');
                }
              }

              lists.getListFieldValuesHTML({
                listname: listname,
                fields: 'BAHImage',
                id: thisID
              }, function(fields,id){
                var thisImage = fields.d.BAHImage;

                var checkExist = setInterval(function() {
                   if(thisImage && $(thisImage) && $(thisImage)[0] && $(thisImage)[0].width != 0) {
                     var imageRatio = $(thisImage)[0].width/$(thisImage)[0].height;
                     var containerRatio = thisContainer.find('.news-image-'+id).width()/thisContainer.find('.news-image-'+id).height();

                     thisContainer.find('.news-image-'+id).append(thisImage);

                     if(imageRatio > containerRatio){
                       thisContainer.find('.news-image-'+id +' img').width('auto').height('100%');
                     } else {
                       thisContainer.find('.news-image-'+id +' img').width('100%').height('auto');
                     }

                    clearInterval(checkExist);

                   }
                }, 100);

              });

            }

            $(settings.container).carousel({
              loop: true,
              navigation: true,
              autoplay: true
            });

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
