/*! tabify.js v1.0 | MIT License | https://github.com/oldrivercreative/tabify.js */
(function($){
  $.fn.tabify = function(options){

    // settings
    var settings = $.extend(true, {}, {
      selector: this.selector,
      enabled: $('#MSOLayout_InDesignMode').val() != '1' ? true : false,
      panel: '.ms-webpartzone-cell',
      container: '.ms-webpart-zone',
      title: 'h2.ms-webpart-titleText:eq(0)',
      hidetitles: false,
      cssclass: 'ui-tabs',
      reversez: false,
      oninit: false,
      onchange: false,
      destroy: false
    }, options);

    // tabify
    this.each(function(){

      // get objects
      var trigger = $(this).closest(settings.panel);
      var container = trigger.closest(settings.container);

      // destroy?
      if(settings.destroy){
        container.trigger('tabify-destroy');
      }

      // create
      else {

        // init
        container.on('tabify-init', function(){

          // add classes
          container.addClass(settings.cssclass);

          // <ul>
          var ul = $('<ul class="' + settings.cssclass + '-nav" />');

          // panels
          var tabContainers = 0;
          container.find(settings.panel).each(function(i){

            // get panel
            var panel = $(this);

            // not trigger?
            if(!panel.is(trigger)){

              // add classes
              panel.addClass(settings.cssclass + '-panel');

              // id
              var id = 'panel' + (i + 1);
              panel.attr('id', id);

              // title
              var label = 'No title';
              var title = panel.find(settings.title);

              // found title?
              if(title.size() > 0){

                // title text?
                var titletext = title.text();
                if(titletext.length > 0){
                  label = titletext;
                }

                // hide title?
                if(settings.hidetitles){
                  title.addClass(settings.cssclass + '-hidden');
                }

              }

              // <li>
              var li = $('<li><a href="#' + id + '"><span>' + label + '</span></a></li>');

              // <a>
              li.children('a').on('click', function(e){

                // prevent hash in url
                e.preventDefault();

                // target
                var target = $(this).attr('href');

                // change
                container.trigger('tabify-change', [ target ]);

              });

              // active panel?
              if(tabContainers == 0){
                panel.addClass('active');
                li.addClass('active');
                tabContainers++;
              }

              // add to <ul>
              ul.append(li);

            }

            // trigger
            else{
              panel.addClass(settings.cssclass + '-hidden');
            }

          });

          // reverse z-index?
          if(settings.reversez){

            // get <li>'s
            var items = ul.children('li');

            // z-index
            items.each(function(i){
              $(this).css('z-index', items.size() - i);
            });

          }

          // add tabs
          container.prepend(ul);

          // oninit?
          if(typeof(settings.oninit) == 'function'){
            settings.oninit();
          }

        });

        // change
        container.on('tabify-change', function(e, target){

          // deactivate links
          container.children('ul:eq(0)').children('li').removeClass('active');

          // deactivate panels
          container.find(settings.panel).removeClass('active');

          // activate link
          container.find('a[href="' + target + '"]').parent('li').addClass('active');

          // activate panel
          $(target).addClass('active');

        });

        // destroy
        container.on('tabify-destroy', function(){

          // remove classes
          container.removeClass(settings.cssclass);

          // remove panels
          container.find(settings.panel).removeAttr('id').removeClass(settings.cssclass + '-panel active');

          // remove <ul>
          container.children('ul:eq(0)').remove();

        });

        // enabled?
        if(settings.enabled){

          // init
          container.trigger('tabify-init');

        }

      }

    });

    // done
    return this;

  };
}(jQuery));
