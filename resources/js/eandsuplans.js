const lists = window.lists = require('./lists');
const utilities = window.utilities = require('./utilities');

var resourceJobFamily = [];
var resourceFunctionalCommunity = [];
var resourceCareerTrack = [];

var container = '#learningplans-container';
var thiscontainer = $(container);

var resultsParentContainer = '.learningplans-results-column';
var resultsNavigationContainer = '.alpha-filter';
var resultsContainer = '.results';
var filterParentContainer = '.filter-column';
var filterContainer = '.filter-group-options';

module.exports = {

  // skeleton code for web part
  load: function(){

    eandsuplans.resetWebPart();
    eandsuplans.buildWebPart();

     var checkExist = setInterval(function() {
        if($('.learningplan-item').size() != 0) {
          eandsuplans.buildRefinement();
          eandsuplans.filterResultsByAlphabet();
          eandsuplans.filterResultsByRefinement();

          // save desc original heights for animation
          $('.trimmed').each(function(){
            var thisHeight = $(this).height();
            $(this).attr('data-height',thisHeight);
            $(this).css('height','90px');
          });

          // show more or less fellow description
          $('.description-toggle-link').click(function(e){
            e.preventDefault();
            if($(this).hasClass('description-more-link')){
              var thisOrigHeight = $(this).parent().find('.trimmed').attr('data-height');
              $(this).parent().find('.trimmed').animate({
                height: thisOrigHeight
              });
              $(this).prev().hide();
              $(this).css('opacity', '0');
            } else {
              $(this).parent().animate({
                height: 90
              });
              $(this).closest('.description').find('.description-more-link').css('opacity', '1');
              $(this).closest('.description').find('.description-overlay').show();
            }
          })

          // hash change
          $(window).on('hashchange', function(e){

            // get hash
            var hash = window.location.hash.replace('#', '');
            hash = decodeURIComponent(hash);

            var _alphabets = $('.alphabet > ul > li > a');
            var _refinements = $('.filter-group > ul > li');
            var _contentRows = $('.learningplan-item');
            var _count = 0;

            _contentRows.hide();

            $('.mobile-alpha-list').removeClass('active');
            $('.alphabet > ul > li > a').removeClass('mobile-active');

            if(hash.length === 0 || hash === 'all') {
              _refinements.removeClass('active');
              $('[data-filter="all"]').addClass('active');
              $('.course-info, .service-info').remove();
              _alphabets.removeClass('active');
              $('[data-alpha="all"]').addClass('active');
              _contentRows.fadeIn(400);
              _count = _contentRows.size();
            } else {
              if(hash.length === 1){
                _refinements.removeClass('active');
                $('[data-filter="all"]').addClass('active');
                $('.course-info, .service-info').remove();
                _alphabets.removeClass('active');
                $('[data-alpha="all"]').removeClass('active');
                $('[data-alpha-filter="'+hash+'"]').fadeIn(400);
                $('[data-alpha="'+hash+'"]').addClass('active');
                _count = $('[data-alpha-filter="'+hash+'"]').size();
              } else {
                _alphabets.removeClass('active');
                $('[data-alpha="all"]').addClass('active');
                _refinements.removeClass('active');
                $('.course-info, .service-info').remove();

                // store filters in array
                var activeFilters = hash.split(',');

                // show results based on active filter array
                _contentRows.each(function(i) {
                  var theseTags = [];

                  $(this).find('.tags span').each(function(){
                    theseTags.push(this);
                  })

                  var _cellText = theseTags.map(function (item) {
                   return item.textContent;
                 });

                  var thisContains = activeFilters.every(function(val){
                    return _cellText.indexOf(val) >= 0;
                  });

                  /*for (var filteritem of activeFilters) {
                    $('[data-filter="'+filteritem+'"]').addClass('active');
                  }*/

                  var arrayLength = activeFilters.length;
                  for (var i = 0; i < arrayLength; i++) {
                    var filteritem = activeFilters[i];
                    $('[data-filter="' + filteritem + '"]').addClass('active');
                  }

                  if(thisContains) {
                    _count += 1;
                    $(this).fadeIn(400);
                  }
                });
              }
            }

            $('.no-results').remove();

            if(_count === 0){
              $('<div class="no-results">There are no results. <a href="#">VIEW ALL</a></div>').appendTo('.results');
              $('.course-info, .service-info').remove();

              $('.no-results a').click(function(e){
                e.preventDefault();
                _contentRows.hide();
                _alphabets.removeClass('active');
                _refinements.removeClass('active');
                $('[data-alpha="all"]').addClass('active');
                $('[data-filter="all"]').addClass('active')
                _contentRows.fadeIn(400);
                $('.no-results').remove();
                var hash = '#all';
                window.location.hash = hash;
              });
            }

          });

         clearInterval(checkExist);

         $(window).trigger('hashchange');

        }
     }, 100);

  },
  buildWebPart: function buildWebPart()
  {
      // Render filtering column
      thiscontainer.append('<div class="filter-toggle"><i class="fa fa-filter" aria-hidden="true"></i><span class="text">Filter</span></div><div class="filter-column col-md-3"></div>');

      // Render results column
      thiscontainer.append('<div class="learningplans-results-column col-md-9">');
          // Render alphabet navigation
          $(resultsParentContainer).append('<div class="alpha-filter">');

            eandsuplans.buildAlphabet();

          $(resultsParentContainer).append('</div><div class="row no-gutter info-container"></div>');
          // Render results panel
          $(resultsParentContainer).append('<div class="results">');

            // Render results
            lists.getListItems({
              listname: 'EandSU Plans', //listname,
              fields: 'Title,Desc,Enabled,LinkURL,OpenLinkInNewWindow,JobFamily,FunctionalCommunity,CareerTrack',
              orderby: 'Title'
            },function(items){
              var itemsdata = items.d.results;
              for (var i = 0; i < itemsdata.length; i++) {
                var thisTitle = itemsdata[i].Title;
                var thisDesc = itemsdata[i].Desc;
                var thisEnabled = itemsdata[i].Enabled;
                var newWindow = itemsdata[i].OpenLinkInNewWindow;
                var courseID = '';

                var letter = thisTitle.toLowerCase().substring(0,1);
                var finalDescription = '';
                var thisTitleBuild = '<div class="title">'+thisTitle+'</div>';

                if(thisDesc != undefined || thisDesc != null){
                  finalDescription = '<div class="description">'+thisDesc+'</div>';
                }

                if(thisEnabled){

                  if(itemsdata[i].LinkURL != null && itemsdata[i].LinkURL != undefined) {
                    var thisUrl = itemsdata[i].LinkURL;
                    if(newWindow){
                      thisTitleBuild = '<div class="title"><a href="' + thisUrl + '" class="learningplan-title" target="_blank">' + thisTitle + '</a></div>'
                    } else {
                      thisTitleBuild = '<div class="title"><a href="' + thisUrl + '" class="learningplan-title">' + thisTitle + '</a></div>'
                    }
                  }

                  var sParent = '<div class="learningplan-item" data-alpha-filter="'+letter+'">' +
                    thisTitleBuild +
                    courseID +
                    finalDescription +
                    '<div class="tags">';
                  var items = '';

                  //filter data

                  if(itemsdata[i].JobFamily && itemsdata[i].JobFamily.length)
                  {
                    items += '<span class="JobFamily">' + itemsdata[i].JobFamily + '</span>';
                    resourceJobFamily.push(itemsdata[i].JobFamily);
                  }

                  if(itemsdata[i].FunctionalCommunity && itemsdata[i].FunctionalCommunity.length)
                  {
                    items += '<span class="FunctionalCommunity">' + itemsdata[i].FunctionalCommunity + '</span>';
                    resourceFunctionalCommunity.push(itemsdata[i].FunctionalCommunity);
                  }

                  if(itemsdata[i].CareerTrack && itemsdata[i].CareerTrack.length)
                  {
                    items += '<span class="CareerTrack">' + itemsdata[i].CareerTrack + '</span>';
                    resourceCareerTrack.push(itemsdata[i].CareerTrack);
                  }

                  var cParent = '</div></div>';

                  $(resultsContainer).append(sParent + items + cParent);
                }
              }
            });

          $(resultsParentContainer).append('</div>');
      thiscontainer.append('</div>');
  },
  buildAlphabet: function buildAlphabet()
  {
    $(resultsNavigationContainer).append('<div class="alphabet">' +
      '<ul>' +
        '<li><a href="#" data-alpha="all" class="active">All</a></li>' +
        '<li><a href="#" data-alpha="a">A</a></li>' +
        '<li><a href="#" data-alpha="b">B</a></li>' +
        '<li><a href="#" data-alpha="c">C</a></li>' +
        '<li><a href="#" data-alpha="d">D</a></li>' +
        '<li><a href="#" data-alpha="e">E</a></li>' +
        '<li><a href="#" data-alpha="f">F</a></li>' +
        '<li><a href="#" data-alpha="g">G</a></li>' +
        '<li><a href="#" data-alpha="h">H</a></li>' +
        '<li><a href="#" data-alpha="i">I</a></li>' +
        '<li><a href="#" data-alpha="j">J</a></li>' +
        '<li><a href="#" data-alpha="k">K</a></li>' +
        '<li><a href="#" data-alpha="l">L</a></li>' +
        '<li><a href="#" data-alpha="m">M</a></li>' +
        '<li><a href="#" data-alpha="n">N</a></li>' +
        '<li><a href="#" data-alpha="o">O</a></li>' +
        '<li><a href="#" data-alpha="p">P</a></li>' +
        '<li><a href="#" data-alpha="q">Q</a></li>' +
        '<li><a href="#" data-alpha="r">R</a></li>' +
        '<li><a href="#" data-alpha="s">S</a></li>' +
        '<li><a href="#" data-alpha="t">T</a></li>' +
        '<li><a href="#" data-alpha="u">U</a></li>' +
        '<li><a href="#" data-alpha="v">V</a></li>' +
        '<li><a href="#" data-alpha="w">W</a></li>' +
        '<li><a href="#" data-alpha="x">X</a></li>' +
        '<li><a href="#" data-alpha="y">Y</a></li>' +
        '<li><a href="#" data-alpha="z">Z</a></li>' +
      '</ul>' +
      '</div>');
      $('#learningplans-container').prepend('<div class="alpha-filter"><div class="alphabet mobile-alphabet"><div class="mobile-alpha-trigger"><span class="arrow"><i class="fa fa-angle-down" aria-hidden="true"></i></span></div>' +
        '<ul class="mobile-alpha-list">' +
          '<li><a href="#" data-alpha="all" class="active">All</a></li>' +
          '<li><a href="#" data-alpha="a">A</a></li>' +
          '<li><a href="#" data-alpha="b">B</a></li>' +
          '<li><a href="#" data-alpha="c">C</a></li>' +
          '<li><a href="#" data-alpha="d">D</a></li>' +
          '<li><a href="#" data-alpha="e">E</a></li>' +
          '<li><a href="#" data-alpha="f">F</a></li>' +
          '<li><a href="#" data-alpha="g">G</a></li>' +
          '<li><a href="#" data-alpha="h">H</a></li>' +
          '<li><a href="#" data-alpha="i">I</a></li>' +
          '<li><a href="#" data-alpha="j">J</a></li>' +
          '<li><a href="#" data-alpha="k">K</a></li>' +
          '<li><a href="#" data-alpha="l">L</a></li>' +
          '<li><a href="#" data-alpha="m">M</a></li>' +
          '<li><a href="#" data-alpha="n">N</a></li>' +
          '<li><a href="#" data-alpha="o">O</a></li>' +
          '<li><a href="#" data-alpha="p">P</a></li>' +
          '<li><a href="#" data-alpha="q">Q</a></li>' +
          '<li><a href="#" data-alpha="r">R</a></li>' +
          '<li><a href="#" data-alpha="s">S</a></li>' +
          '<li><a href="#" data-alpha="t">T</a></li>' +
          '<li><a href="#" data-alpha="u">U</a></li>' +
          '<li><a href="#" data-alpha="v">V</a></li>' +
          '<li><a href="#" data-alpha="w">W</a></li>' +
          '<li><a href="#" data-alpha="x">X</a></li>' +
          '<li><a href="#" data-alpha="y">Y</a></li>' +
          '<li><a href="#" data-alpha="z">Z</a></li>' +
        '</ul>' +
        '</div></div>');
  },
  buildRefinement: function buildRefinement()
  {

    resourceJobFamily.sort();
    resourceFunctionalCommunity.sort();
    resourceCareerTrack.sort();

    $(filterParentContainer).append('<div id="all-filter" class="filter-group" class="opened">' +
      '<ul class="filter-group-options"><li data-filter="all" class="active"><div class="filter-checkbox"></div><div class="filter-title">VIEW ALL</div></li></ul></div>');

    $(filterParentContainer).append('<div id="job-family" class="filter-group" class="opened">' +
      '<h3 class="filter-group-title">Job Family</h3>' +
        '<ul class="filter-group-options">');
        eandsuplans.getUniqueResults(resourceJobFamily).forEach(function(JobFamily) {
          eandsuplans.addRefinementItem(JobFamily, 'job-family');
        });
    $(filterParentContainer).append('</ul></div>');

      $(filterParentContainer).append('<div id="functional-community" class="filter-group" class="opened">' +
        '<h3 class="filter-group-title">Functional Community</h3>' +
          '<ul class="filter-group-options">');
          eandsuplans.getUniqueResults(resourceFunctionalCommunity).forEach(function(FunctionalCommunity) {
            eandsuplans.addRefinementItem(FunctionalCommunity, 'functional-community');
          });
      $(filterParentContainer).append('</ul></div>');

      $(filterParentContainer).append('<div id="career-track" class="filter-group" class="opened">' +
        '<h3 class="filter-group-title">Career Track</h3>' +
          '<ul class="filter-group-options">');
          eandsuplans.getUniqueResults(resourceCareerTrack).forEach(function(CareerTrack) {
            eandsuplans.addRefinementItem(CareerTrack, 'career-track');
          });
      $(filterParentContainer).append('</ul></div>');
  },
  addRefinementItem: function addRefinementItem(tag, id)
  {
    $('#' + id + '> ul').append('<li data-filter="' + tag + '">' +
            '<div class="filter-checkbox"></div>' +
              '<div class="filter-title">' + tag + '</div>' +
          '</li>');
  },
  filterResultsByAlphabet: function filterResultsByAlphabet() {

    $('.mobile-alpha-trigger').click(function(){
      $('.mobile-alpha-list').addClass('active');
      $(this).next().find('a').addClass('mobile-active');
    })

    var _alphabets = $('.alphabet > ul > li > a');

    _alphabets.click(function(e){
      e.preventDefault();
      var value = $(this).attr('data-alpha').toLowerCase();
      var hash = '#' + value;
      window.location.hash = hash;
    });
  },
  filterResultsByRefinement: function filterResultsByRefinement() {

    $('.filter-toggle').click(function(){
      if($(this).hasClass('active')) {
        $(this).removeClass('active');
        $('.filter-column').slideUp(400);
      } else {
        $(this).addClass('active');
        $('.filter-column').slideDown(400);
      }
    });

    var _refinements = $('.filter-group > ul > li');

    _refinements.click(function() {
      var value = $(this).attr('data-filter').toLowerCase();
      var activeFilters = 'all';

      if(value != 'all') {
        this.classList.toggle('active');
        $('[data-filter="all"]').removeClass('active');
        activeFilters = '';

        // store any remaining active filters in array
            $('[data-filter].active').each(function(i){
              var thisActiveFilter = $(this).attr('data-filter');
              if (i > 0) {
              activeFilters = activeFilters.concat("," + thisActiveFilter);
              } else {
                activeFilters = activeFilters.concat(thisActiveFilter);
              }
            })
            // es6 method activeFilters = Array.from(document.querySelectorAll('[data-filter].active')).map(item => item.dataset.filter);
        }

      var hash = '#' + activeFilters;
      window.location.hash = hash;
    });
  },
  getUniqueResults: function getUniqueResults(arr)
  {
    var uniqueArray = arr.filter(function(elem, pos, arr) {
      return arr.indexOf(elem) == pos;
    });

    return uniqueArray;
  },
  resetWebPart: function resetWebPart()
  {
    var container = '#learningplans-container';
    var thiscontainer = $(container);
    thiscontainer.empty();
  }
}
