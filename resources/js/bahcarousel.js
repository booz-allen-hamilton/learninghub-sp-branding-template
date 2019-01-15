const lists = window.lists = require('./lists')

module.exports = {

  // skeleton code for web part
  load: function(options){
    let settings = $.extend(true, {}, {
      trigger: '.wp-carousel',
      container: '.carousel-container',
      contenttypeid: '0x010015F950C274B07E4383EC13B86EAE52F4' // BAH Carousel
    }, options);

    (function($){

      lists.buildwebpart({
        trigger: settings.trigger,
        container: settings.container
      })

      $(settings.container).each(function(){

        var thisContainer = $(this)

        // remove any previously-fetched items
        thisContainer.find('ul').remove()

        // get list name
        var listname = thisContainer.closest('.ms-webpartzone-cell').find(settings.trigger).attr('data-list')

        // get list items
        if(!bones.page.editmode){
          lists.getListItems({
            listname: listname,
            fields: 'Title,Enabled,SortOrder,Id',
            orderby: 'SortOrder'
          },function(items){
            var itemsdata = items.d.results
            thisContainer.append('<ul/>')
            var thiscontainer = thisContainer.find('ul')
            for (var i = 0; i < itemsdata.length; i++) {
              var thisTitle = itemsdata[i].Title
              var thisEnabled = itemsdata[i].Enabled
              var thisID = itemsdata[i].Id

              if(thisEnabled){
                thiscontainer.append('<li class="carousel-slide row no-gutter"><div class="hero-image carousel-image-'+thisID+'"></div><div class="hero-text"><span class="hero-text-pluses"><span class="hero-text-content hero-text-content-'+thisID+'">'+thisTitle+'</span></span></div></li>')
                $('.hero-text-content-'+thisID).html($('.hero-text-content-'+thisID).text()).css('display','block')
              }

              lists.getListFieldValuesHTML({
                listname: listname,
                fields: 'HeroImage',
                id: thisID
              }, function(fields,id){
                var thisImage = fields.d.HeroImage

                var checkExist = setInterval(function() {
                  if($(thisImage)[0].width != 0) {
                    var thisImageSrc = $(thisImage).attr('src')
                    thisContainer.find('.carousel-image-'+id).css('cssText','background-image:url('+thisImageSrc+')')
                    clearInterval(checkExist)
                  }
                }, 100)

              })

            }

            $(settings.container).carousel({
              loop: true,
              navigation: true,
              autoplay: true
            })

          })
        }
      })

      // load editor
      lists.editwebpart({
        trigger: settings.trigger,
        container: settings.container,
        contenttypeid: settings.contenttypeid
      })

    }(jQuery))
  }
}
