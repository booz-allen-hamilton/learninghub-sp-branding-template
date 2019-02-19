"use strict";

var lists = window.lists = require('./lists');

var utilities = window.utilities = require('./utilities');

var resourceJobFamily = [];
var resourceFunctionalCommunity = [];
var container = '#learningplans-container';
var thiscontainer = $(container);
var resultsParentContainer = '.learningplans-results-column';
var resultsNavigationContainer = '.alpha-filter';
var resultsContainer = '.results';
var filterParentContainer = '.filter-column';
var filterContainer = '.filter-group-options';
module.exports = {
  // skeleton code for web part
  load: function load() {
    analyticsu.resetWebPart();
    analyticsu.buildWebPart();
    var checkExist = setInterval(function () {
      if ($('.learningplan-item').size() != 0) {
        analyticsu.buildRefinement();
        analyticsu.filterResultsByAlphabet();
        analyticsu.filterResultsByRefinement(); // save desc original heights for animation

        $('.trimmed').each(function () {
          var thisHeight = $(this).height();
          $(this).attr('data-height', thisHeight);
          $(this).css('height', '90px');
        }); // show more or less fellow description

        $('.description-toggle-link').click(function (e) {
          e.preventDefault();

          if ($(this).hasClass('description-more-link')) {
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
        }); // hash change

        $(window).on('hashchange', function (e) {
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

          if (hash.length === 0 || hash === 'all') {
            _refinements.removeClass('active');

            $('[data-filter="all"]').addClass('active');
            $('.course-info, .service-info').remove();

            _alphabets.removeClass('active');

            $('[data-alpha="all"]').addClass('active');

            _contentRows.fadeIn(400);

            _count = _contentRows.size();
          } else {
            if (hash.length === 1) {
              _refinements.removeClass('active');

              $('[data-filter="all"]').addClass('active');
              $('.course-info, .service-info').remove();

              _alphabets.removeClass('active');

              $('[data-alpha="all"]').removeClass('active');
              $('[data-alpha-filter="' + hash + '"]').fadeIn(400);
              $('[data-alpha="' + hash + '"]').addClass('active');
              _count = $('[data-alpha-filter="' + hash + '"]').size();
            } else {
              _alphabets.removeClass('active');

              $('[data-alpha="all"]').addClass('active');

              _refinements.removeClass('active');

              $('.course-info, .service-info').remove(); // store filters in array

              var activeFilters = hash.split(','); // show results based on active filter array

              _contentRows.each(function (i) {
                var theseTags = [];
                $(this).find('.tags span').each(function () {
                  theseTags.push(this);
                });

                var _cellText = theseTags.map(function (item) {
                  return item.textContent;
                });

                var thisContains = activeFilters.every(function (val) {
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

                if (thisContains) {
                  _count += 1;
                  $(this).fadeIn(400);
                }
              });
            }
          }

          $('.no-results').remove();

          if (_count === 0) {
            $('<div class="no-results">There are no results. <a href="#">VIEW ALL</a></div>').appendTo('.results');
            $('.course-info, .service-info').remove();
            $('.no-results a').click(function (e) {
              e.preventDefault();

              _contentRows.hide();

              _alphabets.removeClass('active');

              _refinements.removeClass('active');

              $('[data-alpha="all"]').addClass('active');
              $('[data-filter="all"]').addClass('active');

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
  buildWebPart: function buildWebPart() {
    // Render filtering column
    thiscontainer.append('<div class="filter-toggle"><i class="fa fa-filter" aria-hidden="true"></i><span class="text">Filter</span></div><div class="filter-column col-md-3"></div>'); // Render results column

    thiscontainer.append('<div class="learningplans-results-column col-md-9">'); // Render alphabet navigation

    $(resultsParentContainer).append('<div class="alpha-filter">');
    analyticsu.buildAlphabet();
    $(resultsParentContainer).append('</div><div class="row no-gutter info-container"></div>'); // Render results panel

    $(resultsParentContainer).append('<div class="results">'); // Render results

    lists.getListItems({
      listname: 'AnalyticsU Plans',
      //listname,
      fields: 'Title,Desc,Enabled,LinkURL,OpenLinkInNewWindow,JobFamily,FunctionalCommunity',
      orderby: 'Title'
    }, function (items) {
      var itemsdata = items.d.results;

      for (var i = 0; i < itemsdata.length; i++) {
        var thisTitle = itemsdata[i].Title;
        var thisDesc = itemsdata[i].Desc;
        var thisEnabled = itemsdata[i].Enabled;
        var newWindow = itemsdata[i].OpenLinkInNewWindow;
        var courseID = '';
        var letter = thisTitle.toLowerCase().substring(0, 1);
        var finalDescription = '';
        var thisTitleBuild = '<div class="title">' + thisTitle + '</div>';

        if (thisDesc != undefined || thisDesc != null) {
          finalDescription = '<div class="description">' + thisDesc + '</div>';
        }

        if (thisEnabled) {
          if (itemsdata[i].LinkURL != null && itemsdata[i].LinkURL != undefined) {
            var thisUrl = itemsdata[i].LinkURL;

            if (newWindow) {
              thisTitleBuild = '<div class="title"><a href="' + thisUrl + '" class="learningplan-title" target="_blank">' + thisTitle + '</a></div>';
            } else {
              thisTitleBuild = '<div class="title"><a href="' + thisUrl + '" class="learningplan-title">' + thisTitle + '</a></div>';
            }
          }

          var sParent = '<div class="learningplan-item" data-alpha-filter="' + letter + '">' + thisTitleBuild + courseID + finalDescription + '<div class="tags">';
          var items = ''; //filter data

          if (itemsdata[i].JobFamily && itemsdata[i].JobFamily.length) {
            items += '<span class="JobFamily">' + itemsdata[i].JobFamily + '</span>';
            resourceJobFamily.push(itemsdata[i].JobFamily);
          }

          if (itemsdata[i].FunctionalCommunity && itemsdata[i].FunctionalCommunity.length) {
            items += '<span class="FunctionalCommunity">' + itemsdata[i].FunctionalCommunity + '</span>';
            resourceFunctionalCommunity.push(itemsdata[i].FunctionalCommunity);
          }

          var cParent = '</div></div>';
          $(resultsContainer).append(sParent + items + cParent);
        }
      }
    });
    $(resultsParentContainer).append('</div>');
    thiscontainer.append('</div>');
  },
  buildAlphabet: function buildAlphabet() {
    $(resultsNavigationContainer).append('<div class="alphabet">' + '<ul>' + '<li><a href="#" data-alpha="all" class="active">All</a></li>' + '<li><a href="#" data-alpha="a">A</a></li>' + '<li><a href="#" data-alpha="b">B</a></li>' + '<li><a href="#" data-alpha="c">C</a></li>' + '<li><a href="#" data-alpha="d">D</a></li>' + '<li><a href="#" data-alpha="e">E</a></li>' + '<li><a href="#" data-alpha="f">F</a></li>' + '<li><a href="#" data-alpha="g">G</a></li>' + '<li><a href="#" data-alpha="h">H</a></li>' + '<li><a href="#" data-alpha="i">I</a></li>' + '<li><a href="#" data-alpha="j">J</a></li>' + '<li><a href="#" data-alpha="k">K</a></li>' + '<li><a href="#" data-alpha="l">L</a></li>' + '<li><a href="#" data-alpha="m">M</a></li>' + '<li><a href="#" data-alpha="n">N</a></li>' + '<li><a href="#" data-alpha="o">O</a></li>' + '<li><a href="#" data-alpha="p">P</a></li>' + '<li><a href="#" data-alpha="q">Q</a></li>' + '<li><a href="#" data-alpha="r">R</a></li>' + '<li><a href="#" data-alpha="s">S</a></li>' + '<li><a href="#" data-alpha="t">T</a></li>' + '<li><a href="#" data-alpha="u">U</a></li>' + '<li><a href="#" data-alpha="v">V</a></li>' + '<li><a href="#" data-alpha="w">W</a></li>' + '<li><a href="#" data-alpha="x">X</a></li>' + '<li><a href="#" data-alpha="y">Y</a></li>' + '<li><a href="#" data-alpha="z">Z</a></li>' + '</ul>' + '</div>');
    $('#learningplans-container').prepend('<div class="alpha-filter"><div class="alphabet mobile-alphabet"><div class="mobile-alpha-trigger"><span class="arrow"><i class="fa fa-angle-down" aria-hidden="true"></i></span></div>' + '<ul class="mobile-alpha-list">' + '<li><a href="#" data-alpha="all" class="active">All</a></li>' + '<li><a href="#" data-alpha="a">A</a></li>' + '<li><a href="#" data-alpha="b">B</a></li>' + '<li><a href="#" data-alpha="c">C</a></li>' + '<li><a href="#" data-alpha="d">D</a></li>' + '<li><a href="#" data-alpha="e">E</a></li>' + '<li><a href="#" data-alpha="f">F</a></li>' + '<li><a href="#" data-alpha="g">G</a></li>' + '<li><a href="#" data-alpha="h">H</a></li>' + '<li><a href="#" data-alpha="i">I</a></li>' + '<li><a href="#" data-alpha="j">J</a></li>' + '<li><a href="#" data-alpha="k">K</a></li>' + '<li><a href="#" data-alpha="l">L</a></li>' + '<li><a href="#" data-alpha="m">M</a></li>' + '<li><a href="#" data-alpha="n">N</a></li>' + '<li><a href="#" data-alpha="o">O</a></li>' + '<li><a href="#" data-alpha="p">P</a></li>' + '<li><a href="#" data-alpha="q">Q</a></li>' + '<li><a href="#" data-alpha="r">R</a></li>' + '<li><a href="#" data-alpha="s">S</a></li>' + '<li><a href="#" data-alpha="t">T</a></li>' + '<li><a href="#" data-alpha="u">U</a></li>' + '<li><a href="#" data-alpha="v">V</a></li>' + '<li><a href="#" data-alpha="w">W</a></li>' + '<li><a href="#" data-alpha="x">X</a></li>' + '<li><a href="#" data-alpha="y">Y</a></li>' + '<li><a href="#" data-alpha="z">Z</a></li>' + '</ul>' + '</div></div>');
  },
  buildRefinement: function buildRefinement() {
    resourceJobFamily.sort();
    resourceFunctionalCommunity.sort();
    $(filterParentContainer).append('<div id="all-filter" class="filter-group" class="opened">' + '<ul class="filter-group-options"><li data-filter="all" class="active"><div class="filter-checkbox"></div><div class="filter-title">VIEW ALL</div></li></ul></div>');
    $(filterParentContainer).append('<div id="job-family" class="filter-group" class="opened">' + '<h3 class="filter-group-title">Job Family</h3>' + '<ul class="filter-group-options">');
    analyticsu.getUniqueResults(resourceJobFamily).forEach(function (JobFamily) {
      analyticsu.addRefinementItem(JobFamily, 'job-family');
    });
    $(filterParentContainer).append('</ul></div>');
    $(filterParentContainer).append('<div id="functional-community" class="filter-group" class="opened">' + '<h3 class="filter-group-title">Functional Community</h3>' + '<ul class="filter-group-options">');
    analyticsu.getUniqueResults(resourceFunctionalCommunity).forEach(function (FunctionalCommunity) {
      analyticsu.addRefinementItem(FunctionalCommunity, 'functional-community');
    });
    $(filterParentContainer).append('</ul></div>');
  },
  addRefinementItem: function addRefinementItem(tag, id) {
    $('#' + id + '> ul').append('<li data-filter="' + tag + '">' + '<div class="filter-checkbox"></div>' + '<div class="filter-title">' + tag + '</div>' + '</li>');
  },
  filterResultsByAlphabet: function filterResultsByAlphabet() {
    $('.mobile-alpha-trigger').click(function () {
      $('.mobile-alpha-list').addClass('active');
      $(this).next().find('a').addClass('mobile-active');
    });

    var _alphabets = $('.alphabet > ul > li > a');

    _alphabets.click(function (e) {
      e.preventDefault();
      var value = $(this).attr('data-alpha').toLowerCase();
      var hash = '#' + value;
      window.location.hash = hash;
    });
  },
  filterResultsByRefinement: function filterResultsByRefinement() {
    $('.filter-toggle').click(function () {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $('.filter-column').slideUp(400);
      } else {
        $(this).addClass('active');
        $('.filter-column').slideDown(400);
      }
    });

    var _refinements = $('.filter-group > ul > li');

    _refinements.click(function () {
      var value = $(this).attr('data-filter').toLowerCase();
      var activeFilters = 'all';

      if (value != 'all') {
        this.classList.toggle('active');
        $('[data-filter="all"]').removeClass('active');
        activeFilters = ''; // store any remaining active filters in array

        $('[data-filter].active').each(function (i) {
          var thisActiveFilter = $(this).attr('data-filter');

          if (i > 0) {
            activeFilters = activeFilters.concat("," + thisActiveFilter);
          } else {
            activeFilters = activeFilters.concat(thisActiveFilter);
          }
        }); // es6 method activeFilters = Array.from(document.querySelectorAll('[data-filter].active')).map(item => item.dataset.filter);
      }

      var hash = '#' + activeFilters;
      window.location.hash = hash;
    });
  },
  getUniqueResults: function getUniqueResults(arr) {
    var uniqueArray = arr.filter(function (elem, pos, arr) {
      return arr.indexOf(elem) == pos;
    });
    return uniqueArray;
  },
  resetWebPart: function resetWebPart() {
    var container = '#learningplans-container';
    var thiscontainer = $(container);
    thiscontainer.empty();
  }
};
"use strict";

/**
 *
 * Place your custom JavaScript into this file.
 *
 * SPBones uses ES6 JavaScript, which is compiled down to client-ready ES5 by
 * running the included Gulp Propeller script.
 *
 */
// bones
var bones = window.bones = require('./bones'); //const lists = window.lists = require('./list-functions');


var lists = window.lists = require('./lists'); //utilities


var utilities = window.utilities = require('./utilities'); //carousel


$.carousel = require('./carousel').carousel; // load web parts

var resources = window.resources = require('./resources');

var universities = window.universities = require('./universities');

var news = window.news = require('./news');

var bahcarousel = window.bahcarousel = require('./bahcarousel');

var tiles = window.tiles = require('./tiles');

var partnerships = window.partnerships = require('./partnerships');

var learningplans = window.learningplans = require('./learningplans');

var tabify = window.tabify = require('./tabify');

var eandsuplans = window.eandsuplans = require('./eandsuplans');

var analyticsu = window.analyticsu = require('./analyticsu'); // responsive image map


var imagemap = window.imagemap = require('./imagemap'); // is scrolled


utilities.scrollAction(); // load SP.executor

utilities.loadExecuteRequestor(); // resources

if ($('.wp-resources').size() > 0) {
  resources.load();
} // universities


if ($('.wp-universities').size() > 0) {
  universities.load();
} // news carousel


if ($('.wp-news').size() > 0) {
  news.load();
} // hero carousel


if ($('.wp-carousel').size() > 0) {
  bahcarousel.load();
} // tiles


if ($('.wp-tiles').size() > 0) {
  tiles.load();
} // partnerships


if ($('.wp-partnerships').size() > 0) {
  partnerships.load();
} // Learning Plans


if ($('.wp-learningplans').not('#wp-eandsuplans').not('#wp-analyticsu').size() > 0) {
  learningplans.load();
} // EandSU Plans


if ($('#wp-eandsuplans').size() > 0) {
  eandsuplans.load();
} // AnalyticsU Plans


if ($('#wp-analyticsu').size() > 0) {
  analyticsu.load();
} // tabify


$('.wp-tabs').tabify(); // image maps

if ($('.triangle-container').size() > 0) {
  imagemap.load({
    container: '.triangle-container',
    originalwidth: 1600
  });
} // responsive images


utilities.responsiveImages();
utilities.responsiveImages({
  image: '.hero-image img'
}); // show if not empty

utilities.showIfNotEmpty({
  element: '.grey-bar-text .ms-rtestate-field',
  showElement: '.grey-container'
});
utilities.showIfNotEmpty({
  element: '.grey-bar-zone',
  showElement: '.grey-container'
});
utilities.showIfNotEmpty({
  element: 'aside',
  showElement: 'aside'
}); // blur menu

/*
$(document).on('click', function(e){
  if(!$(e.target).is('#togglemenu')){
    $('#togglemenu').trigger('click');
  }
});
*/
// breadcrumb nav

utilities.siteBreadcrumb(); //related sites

lists.getListItems({
  listname: 'Related Sites',
  siteurl: bones.sitecollection.url,
  fields: 'Title,Enabled,LinkURL,SortOrder,OpenLinkInNewWindow',
  orderby: 'SortOrder'
}, function (items) {
  var itemsdata = items.d.results;
  var relatedcontainer = $('#related-sites');

  for (var i = 0; i < itemsdata.length; i++) {
    var thisTitle = itemsdata[i].Title;
    var thisEnabled = itemsdata[i].Enabled;
    var thisLinkURL = itemsdata[i].LinkURL;
    var newWindow = itemsdata[i].OpenLinkInNewWindow;

    if (thisEnabled) {
      if (newWindow) {
        relatedcontainer.append('<div class="related-site-link"><a href="' + thisLinkURL.Url + '" alt="' + thisTitle + '" target="_blank">' + thisTitle + '</a></div>');
      } else {
        relatedcontainer.append('<div class="related-site-link"><a href="' + thisLinkURL.Url + '" alt="' + thisTitle + '">' + thisTitle + '</a></div>');
      }
    }
  }
}); //footer contact info

lists.getListItems({
  listname: 'Footer Contact Info',
  siteurl: bones.sitecollection.url,
  fields: 'Title,HTMLDescription,SortOrder',
  orderby: 'SortOrder'
}, function (items) {
  var itemsdata = items.d.results;
  var footercontainer = $('.footer-contact-info');

  for (var i = 0; i < itemsdata.length; i++) {
    var thisTitle = itemsdata[i].Title;
    var thisDescription = itemsdata[i].HTMLDescription;
    footercontainer.append('<div class="footer-contact-item"><h4 class="footer-info-heading">' + thisTitle + '</h4><div class="info">' + thisDescription + '</div></div>');
  }
}); //footer bottom links

lists.getListItems({
  listname: 'Footer Bottom Links',
  siteurl: bones.sitecollection.url,
  fields: 'Title,Enabled,LinkURL,SortOrder',
  orderby: 'SortOrder'
}, function (items) {
  var itemsdata = items.d.results;
  var relatedcontainer = $('.footer-bottom-container');

  for (var i = 0; i < itemsdata.length; i++) {
    var thisTitle = itemsdata[i].Title;
    var thisEnabled = itemsdata[i].Enabled;
    var thisLinkURL = itemsdata[i].LinkURL;

    if (thisEnabled) {
      relatedcontainer.append('<a href="' + thisLinkURL.Url + '" alt="' + thisTitle + '">' + thisTitle + '</a>');
    }
  }
}); // scrolling issue resolved - no ribbon/suitebar problems

$(window).load(function () {
  if ($('#s4-ribbonrow').size() == 0) {
    $('#s4-workspace').height($(window).height()).width($(window).width()).addClass('no-ribbon');
  }
});
$(window).resize(function () {
  if ($('#s4-ribbonrow').size() == 0) {
    $('#s4-workspace').height($(window).height()).width($(window).width()).addClass('no-ribbon');
  }
}); // page title html

$('.hero-text-content').html($('.hero-text-content').text()).css('display', 'block'); // global nav links open in new window

$('header nav a:not([href^="' + bones.web.url + '"]):not([href^="/"])').attr('target', '_blank'); // accordions

if (!bones.page.editmode) {
  $('.bah-accordion').accordion({
    heightStyle: 'content',
    collapsible: true,
    active: false
  }).closest('.ms-webpartzone-cell').addClass('wp-accordion-cell');
} // SAMPLE: create list then add content type - Test Code
// lists.createListWithContentType({
//   listname: 'Sample List',
//   siteurl: bones.sitecollection.url,
//   description: 'Sample List using JSOM',
//   contentTypeId: '0x01002E2F04E4DDEC07479542035FE3E76514'
// });
// SAMPLE: calling each function seperatly
// lists.createLists({
//   listname: 'Sample List',
//   siteurl: bones.sitecollection.url,
//   description: 'Sample List using JSOM'
// });
// // timeout to allow list to be created ready to update
// setTimeout(function(){
//   lists.addContentTypeToList({
//     listname: 'Sample List',
//     siteurl: bones.sitecollection.url,
//     contentTypeId: '0x01002E2F04E4DDEC07479542035FE3E76514'
//   });
// }, 5000);
"use strict";

var lists = window.lists = require('./lists');

module.exports = {
  // skeleton code for web part
  load: function load(options) {
    var settings = $.extend(true, {}, {
      trigger: '.wp-carousel',
      container: '.carousel-container',
      contenttypeid: '0x010015F950C274B07E4383EC13B86EAE52F4' // BAH Carousel

    }, options);

    (function ($) {
      lists.buildwebpart({
        trigger: settings.trigger,
        container: settings.container
      });
      $(settings.container).each(function () {
        var thisContainer = $(this); // remove any previously-fetched items

        thisContainer.find('ul').remove(); // get list name

        var listname = thisContainer.closest('.ms-webpartzone-cell').find(settings.trigger).attr('data-list'); // get list items

        if (!bones.page.editmode) {
          lists.getListItems({
            listname: listname,
            fields: 'Title,Enabled,SortOrder,Id',
            orderby: 'SortOrder'
          }, function (items) {
            var itemsdata = items.d.results;
            thisContainer.append('<ul/>');
            var thiscontainer = thisContainer.find('ul');

            for (var i = 0; i < itemsdata.length; i++) {
              var thisTitle = itemsdata[i].Title;
              var thisEnabled = itemsdata[i].Enabled;
              var thisID = itemsdata[i].Id;

              if (thisEnabled) {
                thiscontainer.append('<li class="carousel-slide row no-gutter"><div class="hero-image carousel-image-' + thisID + '"></div><div class="hero-text"><span class="hero-text-pluses"><span class="hero-text-content hero-text-content-' + thisID + '">' + thisTitle + '</span></span></div></li>');
                $('.hero-text-content-' + thisID).html($('.hero-text-content-' + thisID).text()).css('display', 'block');
              }

              lists.getListFieldValuesHTML({
                listname: listname,
                fields: 'HeroImage',
                id: thisID
              }, function (fields, id) {
                var thisImage = fields.d.HeroImage;
                var checkExist = setInterval(function () {
                  if ($(thisImage)[0].width != 0) {
                    var thisImageSrc = $(thisImage).attr('src');
                    thisContainer.find('.carousel-image-' + id).css('cssText', 'background-image:url(' + thisImageSrc + ')');
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
        }
      }); // load editor

      lists.editwebpart({
        trigger: settings.trigger,
        container: settings.container,
        contenttypeid: settings.contenttypeid
      });
    })(jQuery);
  }
};
"use strict";

/**
 *
 * SPBones v2.0 | MIT License | https://github.com/oldrivercreative/spbones
 * 
 * Create an object that contains important information regarding the current
 * SharePoint site, web, page, and user. This object is especially useful when
 * building REST applications and web parts.
 *
 */
module.exports = {
  // form digest
  digest: document.getElementById('__REQUESTDIGEST').value,
  // current host
  host: {
    env: _spPageContextInfo.env,
    farm: _spPageContextInfo.farmLabel,
    name: window.location.host,
    protocol: window.location.protocol,
    url: window.location.protocol + '//' + window.location.host
  },
  // current list
  list: {
    id: _spPageContextInfo.listId,
    title: _spPageContextInfo.listTitle,
    url: _spPageContextInfo.listUrl
  },
  // current page
  page: {
    editmode: document.getElementById('MSOLayout_InDesignMode').value == '1',
    id: _spPageContextInfo.pageItemId,
    language: _spPageContextInfo.currentLanguage,
    physical: _spPageContextInfo.serverRequestPath,
    title: document.title
  },
  // current site collection
  sitecollection: {
    id: _spPageContextInfo.siteId,
    relative: _spPageContextInfo.siteServerRelativeUrl.replace(/^\/|\/$/g, ''),
    url: _spPageContextInfo.siteAbsoluteUrl.replace(/^\/|\/$/g, '')
  },
  // current user
  user: {
    id: _spPageContextInfo.userId,
    key: _spPageContextInfo.systemUserKey,
    name: _spPageContextInfo.userDisplayName
  },
  // current web
  web: {
    id: _spPageContextInfo.webId,
    logo: _spPageContextInfo.webLogoUrl,
    relative: _spPageContextInfo.webServerRelativeUrl.replace(/^\/|\/$/g, ''),
    title: _spPageContextInfo.webTitle,
    url: _spPageContextInfo.webAbsoluteUrl.replace(/^\/|\/$/g, '')
  }
};
"use strict";

/*! carousel.js v1.0 | MIT License | https://github.com/oldrivercreative/carousel */
module.exports = {
  carousel: function ($) {
    $.fn.carousel = function (options) {
      // settings
      var settings = $.extend({}, {
        paging: false,
        navigation: false,
        loop: false,
        autoplay: false,
        delay: 12000,
        buttons: {
          previous: 'Previous',
          next: 'Next',
          navigation: '%i'
        },
        movethreshold: 10,
        swipethreshold: 10,
        oninit: false,
        onupdate: false,
        destroy: false
      }, options); // autoplay timer

      var timer = false; // transform?

      window.optimusPrime = false;

      if ('WebkitTransform' in document.body.style || 'MozTransform' in document.body.style || 'transform' in document.body.style) {
        window.optimusPrime = true;
      } // carousel


      this.each(function () {
        // get objects
        var carousel = $(this);
        var shaker = carousel.find('ul:eq(0)'); // destroy?

        if (settings.destroy) {
          carousel.trigger('carousel-destroy');
        } // create
        else {
            // init
            carousel.on('carousel-init', function () {
              // data
              carousel.data('carousel-position', 0);
              carousel.data('carousel-touch-change', 0);
              carousel.data('carousel-last-touch', false);
              carousel.data('carousel-item-count', shaker.children().size()); // add classes

              carousel.addClass('ui-carousel');
              shaker.addClass('ui-carousel-shaker'); // paging?

              if (settings.paging) {
                // previous
                var previous = $('<button class="previous"><span>' + settings.buttons.previous + '</span></button>');
                previous.on('click', function (e) {
                  e.preventDefault(); // not a touch gesture

                  carousel.data('carousel-last-touch', false); // retreat

                  carousel.trigger('carousel-retreat');
                });
                carousel.append(previous); // next

                var next = $('<button class="next"><span>' + settings.buttons.next + '</span></button>');
                next.on('click', function (e) {
                  e.preventDefault(); // not a touch gesture

                  carousel.data('carousel-last-touch', false); // advance

                  carousel.trigger('carousel-advance');
                });
                carousel.append(next);
              } // navigation?


              if (settings.navigation) {
                // nav list
                var ul = $('<ul class="ui-carousel-nav"/>');

                for (var i = 0; i < carousel.data('carousel-item-count'); i++) {
                  // <button>
                  var navlabel = settings.buttons.navigation.replace('%i', i + 1);
                  var button = $('<button><span>' + navlabel + '</span></button>');
                  button.data('carousel-item', i);
                  button.on('click', function (e) {
                    e.preventDefault(); // set new position

                    var p = $(this).data('carousel-item');
                    var slidewidth = shaker.children('li:eq(0)').width() / shaker.width() * 100;
                    p = p * slidewidth * -1;
                    carousel.data('carousel-position', p); // not a touch gesture

                    carousel.data('carousel-last-touch', false); // contain

                    carousel.trigger('carousel-contain'); // slide

                    carousel.trigger('carousel-slide');
                  }); // <li>

                  var li = $('<li/>');
                  li.append(button); // active?

                  if (i === 0) {
                    li.addClass('ui-active');
                  } // add to nav list


                  ul.append(li);
                } // add


                carousel.append(ul);
              } // contain


              carousel.trigger('carousel-contain'); // autoplay?

              if (settings.autoplay) {
                carousel.trigger('carousel-queue');
              } // oninit?


              if (typeof settings.oninit == 'function') {
                settings.oninit();
              }
            }); // touch-down

            carousel.on('carousel-touch-down', function (e, position) {
              // add classes
              carousel.addClass('ui-touch-threshold'); // starting point

              carousel.data('carousel-touch-start', {
                x: position.x,
                y: $(window).scrollTop()
              }); // disable autoplay while swiping

              if (settings.autoplay) {
                carousel.trigger('carousel-dequeue');
              }
            }); // touch-move

            carousel.on('carousel-touch-move', function (e, position) {
              // threshold?
              if (carousel.hasClass('ui-touch-threshold')) {
                // get starting position
                var start = carousel.data('carousel-touch-start'); // scrolling?

                if (Math.abs($(window).scrollTop() - start.y) >= settings.movethreshold) {
                  carousel.removeClass('ui-touch-threshold');
                } // swiping?
                else if (Math.abs(position.x - start.x) >= settings.movethreshold) {
                    carousel.removeClass('ui-touch-threshold').addClass('ui-touch-swiping');
                    $('body').addClass('ui-swiping');
                  }
              } // swiping?


              if (carousel.hasClass('ui-touch-swiping')) {
                // position
                var start = carousel.data('carousel-touch-start');
                var distance = position.x - start.x;
                var position = carousel.data('carousel-position');
                var change = distance / shaker.width() * 100;
                carousel.data('carousel-touch-change', change); // shake it

                var p = position + change;

                if (window.optimusPrime) {
                  shaker.css({
                    WebkitTransform: 'translateX(' + p + '%)',
                    MozTransform: 'translateX(' + p + '%)',
                    transform: 'translateX(' + p + '%)'
                  });
                } else {
                  shaker.css('left', p + '%');
                } // onupdate?


                if (typeof settings.onupdate == 'function') {
                  settings.onupdate(p);
                }
              }
            }); // touch-up

            carousel.on('carousel-touch-up', function () {
              // threshold?
              if (carousel.hasClass('ui-touch-threshold')) {
                // remove classes
                carousel.removeClass('ui-touch-threshold');
              } // swiping?
              else if (carousel.hasClass('ui-touch-swiping')) {
                  // remove classes
                  carousel.removeClass('ui-touch-swiping');
                  $('body').removeClass('ui-swiping'); // position

                  var position = carousel.data('carousel-position');
                  var change = carousel.data('carousel-touch-change'); // swipe?

                  if (change >= settings.swipethreshold) {
                    var slidewidth = shaker.children('li:eq(0)').width() / shaker.width() * 100;

                    if (change <= slidewidth) {
                      change = slidewidth;
                    }
                  } else if (change <= settings.swipethreshold * -1) {
                    var slidewidth = shaker.children('li:eq(0)').width() / shaker.width() * 100;

                    if (change >= slidewidth * -1) {
                      change = slidewidth * -1;
                    }
                  } // touch gesture


                  carousel.data('carousel-last-touch', true); // update

                  carousel.data('carousel-position', position + change); // contain

                  carousel.trigger('carousel-contain'); // transform

                  carousel.trigger('carousel-slide');
                } // queue next transition


              if (settings.autoplay) {
                carousel.trigger('carousel-queue');
              }
            }); // queue next transition

            carousel.on('carousel-queue', function () {
              // set timer
              timer = setTimeout(function () {
                carousel.data('carousel-last-touch', false);
                carousel.trigger('carousel-advance');
              }, settings.delay);
            }); // de-queue transitions

            carousel.on('carousel-dequeue', function () {
              // unset timer
              clearTimeout(timer);
            }); // advance

            carousel.on('carousel-advance', function () {
              // advance one slide
              var p = carousel.data('carousel-position');
              var slidewidth = shaker.children('li:eq(0)').width() / shaker.width() * 100;
              p -= slidewidth;
              carousel.data('carousel-position', p); // contain

              carousel.trigger('carousel-contain'); // slide

              carousel.trigger('carousel-slide'); // autoplay?

              if (settings.autoplay) {
                carousel.trigger('carousel-dequeue');
                carousel.trigger('carousel-queue');
              }
            }); // retreat

            carousel.on('carousel-retreat', function () {
              // retreat one slide
              var p = carousel.data('carousel-position');
              var slidewidth = shaker.children('li:eq(0)').width() / shaker.width() * 100;
              p += slidewidth;
              carousel.data('carousel-position', p); // contain

              carousel.trigger('carousel-contain'); // slide

              carousel.trigger('carousel-slide'); // autoplay?

              if (settings.autoplay) {
                carousel.trigger('carousel-dequeue');
                carousel.trigger('carousel-queue');
              }
            }); // contain

            carousel.on('carousel-contain', function () {
              // get slide width
              var slidewidth = shaker.children('li:eq(0)').width() / shaker.width() * 100;
              var slidesinview = Math.round(100 / slidewidth);
              var slides = carousel.data('carousel-item-count'); // contain

              var p = carousel.data('carousel-position');
              p = Math.round(p / slidewidth) * slidewidth;

              if (p > 0) {
                if (settings.loop && !carousel.data('carousel-last-touch')) {
                  p = slidewidth * (slides - slidesinview) * -1;
                } else {
                  p = 0;
                }
              } else if (p < slidewidth * (slides - slidesinview) * -1) {
                if (settings.loop && !carousel.data('carousel-last-touch')) {
                  p = 0;
                } else {
                  p = slidewidth * (slides - slidesinview) * -1;
                }
              } // disable paging


              if (!settings.loop && settings.paging && p >= 0) {
                carousel.children('button.previous').prop('disabled', true);
              } else if (!settings.loop && settings.paging) {
                carousel.children('button.previous[disabled]').prop('disabled', false);
              }

              if (!settings.loop && settings.paging && p <= slidewidth * (slides - slidesinview) * -1) {
                carousel.children('button.next').prop('disabled', true);
              } else if (!settings.loop && settings.paging) {
                carousel.children('button.next[disabled]').prop('disabled', false);
              } // update


              carousel.data('carousel-position', p); // update navigation?

              if (settings.navigation) {
                var i = Math.round(Math.abs(p) / slidewidth);
                var navlist = carousel.children('ul.ui-carousel-nav');
                navlist.children().removeClass('ui-active');
                navlist.children().eq(i).addClass('ui-active');
              }
            }); // slide

            carousel.on('carousel-slide', function () {
              // shake it
              var p = carousel.data('carousel-position');

              if (window.optimusPrime) {
                shaker.css({
                  WebkitTransform: 'translateX(' + p + '%)',
                  MozTransform: 'translateX(' + p + '%)',
                  transform: 'translateX(' + p + '%)'
                });
              } else {
                shaker.animate({
                  left: p + '%'
                }, 300);
              } // onupdate?


              if (typeof settings.onupdate == 'function') {
                settings.onupdate(p);
              }
            }); // destroy

            carousel.on('carousel-destroy', function () {
              // remove data
              carousel.removeData('carousel-position');
              carousel.removeData('carousel-item-count'); // remove events

              carousel.off('carousel-init carousel-advance carousel-retreat carousel-slide'); // remove paging

              carousel.children('button.previous,button.next').remove(); // remove classes

              carousel.removeClass('ui-carousel');
              shaker.removeClass('ui-carousel-shaker');

              if (window.optimusPrime) {
                shaker.css({
                  WebkitTransform: 'translateX(0%)',
                  MozTransform: 'translateX(0%)',
                  transform: 'translateX(0%)'
                });
              } else {
                shaker.css('left', '0%');
              } // cancel events?


              if ($('.ui-carousel').size() === 0) {
                $(window).off('resize');
                $(document).off('mousedown touchstart mousemove touchmove mouseup touchend touchleave touchcancel');
                $('body').removeClass('ui-draggables-listen');
              }
            }); // init

            carousel.trigger('carousel-init');
          }
      }); // listen?

      if (!$('body').hasClass('ui-draggables-listen')) {
        // add classes
        $('body').addClass('ui-draggables-listen'); // resize / orientation

        $(window).on('resize orientationchange', function (e) {
          $('.ui-carousel').trigger('carousel-slide');
          $('.ui-carousel').trigger('carousel-contain');
        }); // touch down

        $(document).on('mousedown touchstart', function (e) {
          if (e.pageX || e.originalEvent.touches) {
            // dragging carousel?
            if ($(e.target).is('.ui-carousel,.ui-carousel *:not(.slider-handle,.slider-handle *)') && e.which != 3) {
              // touchdown!
              var carousel = $(e.target).closest('.ui-carousel');
              $(carousel).trigger('carousel-touch-down', [{
                x: e.pageX ? e.pageX : e.originalEvent.touches[0].pageX,
                y: e.pageY ? e.pageY : e.originalEvent.touches[0].pageY
              }]); // prevent cancel in android

              if (navigator.userAgent.match(/Android/i)) {//e.preventDefault();
              }
            }
          }
        }); // touch move

        $(document).on('mousemove touchmove', function (e) {
          if (e.pageX || e.originalEvent.touches) {
            if ($('body').hasClass('ui-swiping')) {
              e.preventDefault();
            } // update threshold/swiping carousel


            $('.ui-carousel.ui-touch-threshold,.ui-carousel.ui-touch-swiping').each(function () {
              $(this).trigger('carousel-touch-move', [{
                x: e.pageX ? e.pageX : e.originalEvent.touches[0].pageX,
                y: e.pageY ? e.pageY : e.originalEvent.touches[0].pageY
              }]);
            });
          }
        }); // touch up

        $(document).on('mouseup touchend touchleave touchcancel', function (e) {
          // end threshold/swiping carousel
          $('.ui-carousel.ui-touch-threshold,.ui-carousel.ui-touch-swiping').each(function () {
            $(this).trigger('carousel-touch-up');
          });
        });
      } // done


      return this;
    };
  }(jQuery)
};
"use strict";

var lists = window.lists = require('./lists');

var utilities = window.utilities = require('./utilities');

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
  load: function load() {
    eandsuplans.resetWebPart();
    eandsuplans.buildWebPart();
    var checkExist = setInterval(function () {
      if ($('.learningplan-item').size() != 0) {
        eandsuplans.buildRefinement();
        eandsuplans.filterResultsByAlphabet();
        eandsuplans.filterResultsByRefinement(); // save desc original heights for animation

        $('.trimmed').each(function () {
          var thisHeight = $(this).height();
          $(this).attr('data-height', thisHeight);
          $(this).css('height', '90px');
        }); // show more or less fellow description

        $('.description-toggle-link').click(function (e) {
          e.preventDefault();

          if ($(this).hasClass('description-more-link')) {
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
        }); // hash change

        $(window).on('hashchange', function (e) {
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

          if (hash.length === 0 || hash === 'all') {
            _refinements.removeClass('active');

            $('[data-filter="all"]').addClass('active');
            $('.course-info, .service-info').remove();

            _alphabets.removeClass('active');

            $('[data-alpha="all"]').addClass('active');

            _contentRows.fadeIn(400);

            _count = _contentRows.size();
          } else {
            if (hash.length === 1) {
              _refinements.removeClass('active');

              $('[data-filter="all"]').addClass('active');
              $('.course-info, .service-info').remove();

              _alphabets.removeClass('active');

              $('[data-alpha="all"]').removeClass('active');
              $('[data-alpha-filter="' + hash + '"]').fadeIn(400);
              $('[data-alpha="' + hash + '"]').addClass('active');
              _count = $('[data-alpha-filter="' + hash + '"]').size();
            } else {
              _alphabets.removeClass('active');

              $('[data-alpha="all"]').addClass('active');

              _refinements.removeClass('active');

              $('.course-info, .service-info').remove(); // store filters in array

              var activeFilters = hash.split(','); // show results based on active filter array

              _contentRows.each(function (i) {
                var theseTags = [];
                $(this).find('.tags span').each(function () {
                  theseTags.push(this);
                });

                var _cellText = theseTags.map(function (item) {
                  return item.textContent;
                });

                var thisContains = activeFilters.every(function (val) {
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

                if (thisContains) {
                  _count += 1;
                  $(this).fadeIn(400);
                }
              });
            }
          }

          $('.no-results').remove();

          if (_count === 0) {
            $('<div class="no-results">There are no results. <a href="#">VIEW ALL</a></div>').appendTo('.results');
            $('.course-info, .service-info').remove();
            $('.no-results a').click(function (e) {
              e.preventDefault();

              _contentRows.hide();

              _alphabets.removeClass('active');

              _refinements.removeClass('active');

              $('[data-alpha="all"]').addClass('active');
              $('[data-filter="all"]').addClass('active');

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
  buildWebPart: function buildWebPart() {
    // Render filtering column
    thiscontainer.append('<div class="filter-toggle"><i class="fa fa-filter" aria-hidden="true"></i><span class="text">Filter</span></div><div class="filter-column col-md-3"></div>'); // Render results column

    thiscontainer.append('<div class="learningplans-results-column col-md-9">'); // Render alphabet navigation

    $(resultsParentContainer).append('<div class="alpha-filter">');
    eandsuplans.buildAlphabet();
    $(resultsParentContainer).append('</div><div class="row no-gutter info-container"></div>'); // Render results panel

    $(resultsParentContainer).append('<div class="results">'); // Render results

    lists.getListItems({
      listname: 'EandSU Plans',
      //listname,
      fields: 'Title,Desc,Enabled,LinkURL,OpenLinkInNewWindow,JobFamily,FunctionalCommunity,CareerTrack',
      orderby: 'Title'
    }, function (items) {
      var itemsdata = items.d.results;

      for (var i = 0; i < itemsdata.length; i++) {
        var thisTitle = itemsdata[i].Title;
        var thisDesc = itemsdata[i].Desc;
        var thisEnabled = itemsdata[i].Enabled;
        var newWindow = itemsdata[i].OpenLinkInNewWindow;
        var courseID = '';
        var letter = thisTitle.toLowerCase().substring(0, 1);
        var finalDescription = '';
        var thisTitleBuild = '<div class="title">' + thisTitle + '</div>';

        if (thisDesc != undefined || thisDesc != null) {
          finalDescription = '<div class="description">' + thisDesc + '</div>';
        }

        if (thisEnabled) {
          if (itemsdata[i].LinkURL != null && itemsdata[i].LinkURL != undefined) {
            var thisUrl = itemsdata[i].LinkURL;

            if (newWindow) {
              thisTitleBuild = '<div class="title"><a href="' + thisUrl + '" class="learningplan-title" target="_blank">' + thisTitle + '</a></div>';
            } else {
              thisTitleBuild = '<div class="title"><a href="' + thisUrl + '" class="learningplan-title">' + thisTitle + '</a></div>';
            }
          }

          var sParent = '<div class="learningplan-item" data-alpha-filter="' + letter + '">' + thisTitleBuild + courseID + finalDescription + '<div class="tags">';
          var items = ''; //filter data

          if (itemsdata[i].JobFamily && itemsdata[i].JobFamily.length) {
            items += '<span class="JobFamily">' + itemsdata[i].JobFamily + '</span>';
            resourceJobFamily.push(itemsdata[i].JobFamily);
          }

          if (itemsdata[i].FunctionalCommunity && itemsdata[i].FunctionalCommunity.length) {
            items += '<span class="FunctionalCommunity">' + itemsdata[i].FunctionalCommunity + '</span>';
            resourceFunctionalCommunity.push(itemsdata[i].FunctionalCommunity);
          }

          if (itemsdata[i].CareerTrack && itemsdata[i].CareerTrack.length) {
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
  buildAlphabet: function buildAlphabet() {
    $(resultsNavigationContainer).append('<div class="alphabet">' + '<ul>' + '<li><a href="#" data-alpha="all" class="active">All</a></li>' + '<li><a href="#" data-alpha="a">A</a></li>' + '<li><a href="#" data-alpha="b">B</a></li>' + '<li><a href="#" data-alpha="c">C</a></li>' + '<li><a href="#" data-alpha="d">D</a></li>' + '<li><a href="#" data-alpha="e">E</a></li>' + '<li><a href="#" data-alpha="f">F</a></li>' + '<li><a href="#" data-alpha="g">G</a></li>' + '<li><a href="#" data-alpha="h">H</a></li>' + '<li><a href="#" data-alpha="i">I</a></li>' + '<li><a href="#" data-alpha="j">J</a></li>' + '<li><a href="#" data-alpha="k">K</a></li>' + '<li><a href="#" data-alpha="l">L</a></li>' + '<li><a href="#" data-alpha="m">M</a></li>' + '<li><a href="#" data-alpha="n">N</a></li>' + '<li><a href="#" data-alpha="o">O</a></li>' + '<li><a href="#" data-alpha="p">P</a></li>' + '<li><a href="#" data-alpha="q">Q</a></li>' + '<li><a href="#" data-alpha="r">R</a></li>' + '<li><a href="#" data-alpha="s">S</a></li>' + '<li><a href="#" data-alpha="t">T</a></li>' + '<li><a href="#" data-alpha="u">U</a></li>' + '<li><a href="#" data-alpha="v">V</a></li>' + '<li><a href="#" data-alpha="w">W</a></li>' + '<li><a href="#" data-alpha="x">X</a></li>' + '<li><a href="#" data-alpha="y">Y</a></li>' + '<li><a href="#" data-alpha="z">Z</a></li>' + '</ul>' + '</div>');
    $('#learningplans-container').prepend('<div class="alpha-filter"><div class="alphabet mobile-alphabet"><div class="mobile-alpha-trigger"><span class="arrow"><i class="fa fa-angle-down" aria-hidden="true"></i></span></div>' + '<ul class="mobile-alpha-list">' + '<li><a href="#" data-alpha="all" class="active">All</a></li>' + '<li><a href="#" data-alpha="a">A</a></li>' + '<li><a href="#" data-alpha="b">B</a></li>' + '<li><a href="#" data-alpha="c">C</a></li>' + '<li><a href="#" data-alpha="d">D</a></li>' + '<li><a href="#" data-alpha="e">E</a></li>' + '<li><a href="#" data-alpha="f">F</a></li>' + '<li><a href="#" data-alpha="g">G</a></li>' + '<li><a href="#" data-alpha="h">H</a></li>' + '<li><a href="#" data-alpha="i">I</a></li>' + '<li><a href="#" data-alpha="j">J</a></li>' + '<li><a href="#" data-alpha="k">K</a></li>' + '<li><a href="#" data-alpha="l">L</a></li>' + '<li><a href="#" data-alpha="m">M</a></li>' + '<li><a href="#" data-alpha="n">N</a></li>' + '<li><a href="#" data-alpha="o">O</a></li>' + '<li><a href="#" data-alpha="p">P</a></li>' + '<li><a href="#" data-alpha="q">Q</a></li>' + '<li><a href="#" data-alpha="r">R</a></li>' + '<li><a href="#" data-alpha="s">S</a></li>' + '<li><a href="#" data-alpha="t">T</a></li>' + '<li><a href="#" data-alpha="u">U</a></li>' + '<li><a href="#" data-alpha="v">V</a></li>' + '<li><a href="#" data-alpha="w">W</a></li>' + '<li><a href="#" data-alpha="x">X</a></li>' + '<li><a href="#" data-alpha="y">Y</a></li>' + '<li><a href="#" data-alpha="z">Z</a></li>' + '</ul>' + '</div></div>');
  },
  buildRefinement: function buildRefinement() {
    resourceJobFamily.sort();
    resourceFunctionalCommunity.sort();
    resourceCareerTrack.sort();
    $(filterParentContainer).append('<div id="all-filter" class="filter-group" class="opened">' + '<ul class="filter-group-options"><li data-filter="all" class="active"><div class="filter-checkbox"></div><div class="filter-title">VIEW ALL</div></li></ul></div>');
    $(filterParentContainer).append('<div id="job-family" class="filter-group" class="opened">' + '<h3 class="filter-group-title">Job Family</h3>' + '<ul class="filter-group-options">');
    eandsuplans.getUniqueResults(resourceJobFamily).forEach(function (JobFamily) {
      eandsuplans.addRefinementItem(JobFamily, 'job-family');
    });
    $(filterParentContainer).append('</ul></div>');
    $(filterParentContainer).append('<div id="functional-community" class="filter-group" class="opened">' + '<h3 class="filter-group-title">Functional Community</h3>' + '<ul class="filter-group-options">');
    eandsuplans.getUniqueResults(resourceFunctionalCommunity).forEach(function (FunctionalCommunity) {
      eandsuplans.addRefinementItem(FunctionalCommunity, 'functional-community');
    });
    $(filterParentContainer).append('</ul></div>');
    $(filterParentContainer).append('<div id="career-track" class="filter-group" class="opened">' + '<h3 class="filter-group-title">Career Track</h3>' + '<ul class="filter-group-options">');
    eandsuplans.getUniqueResults(resourceCareerTrack).forEach(function (CareerTrack) {
      eandsuplans.addRefinementItem(CareerTrack, 'career-track');
    });
    $(filterParentContainer).append('</ul></div>');
  },
  addRefinementItem: function addRefinementItem(tag, id) {
    $('#' + id + '> ul').append('<li data-filter="' + tag + '">' + '<div class="filter-checkbox"></div>' + '<div class="filter-title">' + tag + '</div>' + '</li>');
  },
  filterResultsByAlphabet: function filterResultsByAlphabet() {
    $('.mobile-alpha-trigger').click(function () {
      $('.mobile-alpha-list').addClass('active');
      $(this).next().find('a').addClass('mobile-active');
    });

    var _alphabets = $('.alphabet > ul > li > a');

    _alphabets.click(function (e) {
      e.preventDefault();
      var value = $(this).attr('data-alpha').toLowerCase();
      var hash = '#' + value;
      window.location.hash = hash;
    });
  },
  filterResultsByRefinement: function filterResultsByRefinement() {
    $('.filter-toggle').click(function () {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $('.filter-column').slideUp(400);
      } else {
        $(this).addClass('active');
        $('.filter-column').slideDown(400);
      }
    });

    var _refinements = $('.filter-group > ul > li');

    _refinements.click(function () {
      var value = $(this).attr('data-filter').toLowerCase();
      var activeFilters = 'all';

      if (value != 'all') {
        this.classList.toggle('active');
        $('[data-filter="all"]').removeClass('active');
        activeFilters = ''; // store any remaining active filters in array

        $('[data-filter].active').each(function (i) {
          var thisActiveFilter = $(this).attr('data-filter');

          if (i > 0) {
            activeFilters = activeFilters.concat("," + thisActiveFilter);
          } else {
            activeFilters = activeFilters.concat(thisActiveFilter);
          }
        }); // es6 method activeFilters = Array.from(document.querySelectorAll('[data-filter].active')).map(item => item.dataset.filter);
      }

      var hash = '#' + activeFilters;
      window.location.hash = hash;
    });
  },
  getUniqueResults: function getUniqueResults(arr) {
    var uniqueArray = arr.filter(function (elem, pos, arr) {
      return arr.indexOf(elem) == pos;
    });
    return uniqueArray;
  },
  resetWebPart: function resetWebPart() {
    var container = '#learningplans-container';
    var thiscontainer = $(container);
    thiscontainer.empty();
  }
};
"use strict";

module.exports = {
  // skeleton code for web part
  load: function load(options) {
    var settings = $.extend(true, {}, {
      container: '',
      originalwidth: 1600
    }, options);

    (function ($) {
      var thisMap = $(settings.container).find('map');
      var thisArea = $(settings.container).find('area');
      var thisImage = $(settings.container).find('img');
      var originalCoords = [];
      $(thisArea).each(function (i) {
        originalCoords[i] = $(this).attr('coords');
        originalCoords[i] = originalCoords[i].split(',');
      });
      var newWidth = parseInt($(thisImage).width());
      var percentDifference = newWidth / settings.originalwidth;
      $(thisArea).each(function (i) {
        var newCoords = [];
        $.each(originalCoords[i], function (e) {
          newCoords.push(originalCoords[i][e] * percentDifference);
        });
        var newCoords = newCoords.join(',');
        $(this).attr('coords', newCoords);
      }); // resize window

      $(window).resize(function () {
        var newWidth = parseInt($(thisImage).width());
        var percentDifference = newWidth / settings.originalwidth;
        $(thisArea).each(function (i) {
          var newCoords = [];
          $.each(originalCoords[i], function (e) {
            newCoords.push(originalCoords[i][e] * percentDifference);
          });
          var newCoords = newCoords.join(',');
          $(this).attr('coords', newCoords);
        });
      });
    })(jQuery);
  }
};
"use strict";

var lists = window.lists = require('./lists');

var utilities = window.utilities = require('./utilities');

var resourceTypeTags = [];
var resourceConcentrationTags = [];
var container = '#learningplans-container';
var thiscontainer = $(container);
var resultsParentContainer = '.learningplans-results-column';
var resultsNavigationContainer = '.alpha-filter';
var resultsContainer = '.results';
var filterParentContainer = '.filter-column';
var filterContainer = '.filter-group-options';
module.exports = {
  // skeleton code for web part
  load: function load() {
    learningplans.resetWebPart();
    learningplans.buildWebPart();
    var checkExist = setInterval(function () {
      if ($('.learningplan-item').size() != 0) {
        learningplans.buildRefinement();
        learningplans.filterResultsByAlphabet();
        learningplans.filterResultsByRefinement(); // save desc original heights for animation

        $('.trimmed').each(function () {
          var thisHeight = $(this).height();
          $(this).attr('data-height', thisHeight);
          $(this).css('height', '90px');
        }); // show more or less fellow description

        $('.description-toggle-link').click(function (e) {
          e.preventDefault();

          if ($(this).hasClass('description-more-link')) {
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
        }); // hash change

        $(window).on('hashchange', function (e) {
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

          if (hash.length === 0 || hash === 'all') {
            _refinements.removeClass('active');

            $('[data-filter="all"]').addClass('active');
            $('.course-info, .service-info').remove();

            _alphabets.removeClass('active');

            $('[data-alpha="all"]').addClass('active');

            _contentRows.fadeIn(400);

            _count = _contentRows.size();
          } else {
            if (hash.length === 1) {
              _refinements.removeClass('active');

              $('[data-filter="all"]').addClass('active');
              $('.course-info, .service-info').remove();

              _alphabets.removeClass('active');

              $('[data-alpha="all"]').removeClass('active');
              $('[data-alpha-filter="' + hash + '"]').fadeIn(400);
              $('[data-alpha="' + hash + '"]').addClass('active');
              _count = $('[data-alpha-filter="' + hash + '"]').size();
            } else {
              _alphabets.removeClass('active');

              $('[data-alpha="all"]').addClass('active');

              _refinements.removeClass('active');

              $('.course-info, .service-info').remove(); // store filters in array

              var activeFilters = hash.split(','); // show results based on active filter array

              _contentRows.each(function (i) {
                var theseTags = [];
                $(this).find('.tags span').each(function () {
                  theseTags.push(this);
                });

                var _cellText = theseTags.map(function (item) {
                  return item.textContent;
                });

                var thisContains = activeFilters.every(function (val) {
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

                if (thisContains) {
                  _count += 1;
                  $(this).fadeIn(400);
                }
              });

              if (activeFilters.includes('Course')) {
                $('<div class="course-info col-sm-6">To enroll in a course:<br/><ol><li>Go to <a href="http://learn.bah.com" target="_blank">Learn</a> (http://learn.bah.com)</li><li>Search for the course by code or title in the <strong>Search for Learning</strong> field</li><li>Click on the course title and follow prompts</li></ol><br/><br/></div>').prependTo('.info-container');
              }

              if (activeFilters.includes('Service Based Learning Plan')) {
                $('<div class="service-info col-sm-6">To enroll in a Service-based Learning Plan:<br/><ol><li>Go to <a href="http://learn.bah.com" target="_blank">Learn</a> (http://learn.bah.com)</li><li>Click on the <strong>Learning Plans</strong> box</li><li>Click the <strong>Service Based Learning Plans</strong> option</li><li>Click on the <strong>+Add Plan</strong> box to register</li></ol><br/><br/></div>').appendTo('.info-container');
              }
            }
          }

          $('.no-results').remove();

          if (_count === 0) {
            $('<div class="no-results">There are no results. <a href="#">VIEW ALL</a></div>').appendTo('.results');
            $('.course-info, .service-info').remove();
            $('.no-results a').click(function (e) {
              e.preventDefault();

              _contentRows.hide();

              _alphabets.removeClass('active');

              _refinements.removeClass('active');

              $('[data-alpha="all"]').addClass('active');
              $('[data-filter="all"]').addClass('active');

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
  buildWebPart: function buildWebPart() {
    // Render filtering column
    thiscontainer.append('<div class="filter-toggle"><i class="fa fa-filter" aria-hidden="true"></i><span class="text">Filter</span></div><div class="filter-column col-md-3"></div>'); // Render results column

    thiscontainer.append('<div class="learningplans-results-column col-md-9">'); // Render alphabet navigation

    $(resultsParentContainer).append('<div class="alpha-filter">');
    learningplans.buildAlphabet();
    $(resultsParentContainer).append('</div><div class="row no-gutter info-container"></div>'); // Render results panel

    $(resultsParentContainer).append('<div class="results">'); // Render results

    lists.getListItems({
      listname: 'Learning Plans and Courses',
      //listname,
      fields: 'Title,Desc,HTMLDescription,Enabled,LinkURL,Id,OpenLinkInNewWindow,CourseID,ResourceType,ResourceConcentration',
      orderby: 'Title'
    }, function (items) {
      var itemsdata = items.d.results;

      for (var i = 0; i < itemsdata.length; i++) {
        var thisTitle = itemsdata[i].Title;
        var thisDesc = itemsdata[i].Desc;
        var thisHTML = itemsdata[i].HTMLDescription;
        var thisEnabled = itemsdata[i].Enabled;
        var thisID = itemsdata[i].Id;
        var newWindow = itemsdata[i].OpenLinkInNewWindow;
        var thisCourseID = itemsdata[i].CourseID;
        var courseID = '';

        if (thisCourseID != undefined || thisCourseID != null) {
          courseID = '<div class="course-id">' + thisCourseID + '</div>';
        }

        var letter = thisTitle.toLowerCase().substring(0, 1);
        var finalDescription = '';
        var thisTitleBuild = '<div class="title">' + thisTitle + '</div>';

        if (thisDesc != undefined || thisDesc != null) {
          finalDescription = '<div class="description">' + thisDesc + '</div>';
        } else {
          if (thisHTML != undefined || thisHTML != null) {
            var thisHTMLtext = $('<div>' + thisHTML + '</div>').text().trim().replace(/\u200B/g, '').replace(/ /g, '').length;

            if (thisHTMLtext != 0) {
              if (thisHTMLtext > 300) {
                finalDescription = '<div class="description"><div class="desc-inner trimmed">' + thisHTML + '<br/><a href="#" class="description-less-link description-toggle-link">View Less</a></div><div class="description-overlay"></div><a href="#" class="description-more-link description-toggle-link">View More</a></div>';
              } else {
                finalDescription = '<div class="description">' + thisHTML + '</div>';
              }
            }
          }
        }

        if (thisEnabled) {
          if (itemsdata[i].LinkURL != null && itemsdata[i].LinkURL != undefined) {
            var thisUrl = itemsdata[i].LinkURL.Url;

            if (newWindow) {
              thisTitleBuild = '<div class="title"><a href="' + thisUrl + '" class="learningplan-title" target="_blank">' + thisTitle + '</a></div>';
            } else {
              thisTitleBuild = '<div class="title"><a href="' + thisUrl + '" class="learningplan-title">' + thisTitle + '</a></div>';
            }
          }

          var sParent = '<div class="learningplan-item" data-alpha-filter="' + letter + '">' + thisTitleBuild + courseID + finalDescription + '<div class="tags">';
          var items = '';

          if (itemsdata[i].ResourceType.results.length >= 1 && itemsdata[i].ResourceType.results != undefined) {
            var thisTypeArr = itemsdata[i].ResourceType.results;

            for (var j = 0; j < thisTypeArr.length; j++) {
              var thisType = thisTypeArr[j].Label;
              items += '<span class="type">' + thisType + '</span>';
              resourceTypeTags.push(thisType);
            }
          }

          if (itemsdata[i].ResourceConcentration.results.length >= 1 && itemsdata[i].ResourceConcentration.results != undefined) {
            var thisConcentrationArr = itemsdata[i].ResourceConcentration.results;

            for (var j = 0; j < thisConcentrationArr.length; j++) {
              var thisConcentration = thisConcentrationArr[j].Label;
              items += '<span class="concentration">' + thisConcentration + '</span>';
              resourceConcentrationTags.push(thisConcentration);
            }
          }

          var cParent = '</div></div>';
          $(resultsContainer).append(sParent + items + cParent);
        }
      }
    });
    $(resultsParentContainer).append('</div>');
    thiscontainer.append('</div>');
  },
  buildAlphabet: function buildAlphabet() {
    $(resultsNavigationContainer).append('<div class="alphabet">' + '<ul>' + '<li><a href="#" data-alpha="all" class="active">All</a></li>' + '<li><a href="#" data-alpha="a">A</a></li>' + '<li><a href="#" data-alpha="b">B</a></li>' + '<li><a href="#" data-alpha="c">C</a></li>' + '<li><a href="#" data-alpha="d">D</a></li>' + '<li><a href="#" data-alpha="e">E</a></li>' + '<li><a href="#" data-alpha="f">F</a></li>' + '<li><a href="#" data-alpha="g">G</a></li>' + '<li><a href="#" data-alpha="h">H</a></li>' + '<li><a href="#" data-alpha="i">I</a></li>' + '<li><a href="#" data-alpha="j">J</a></li>' + '<li><a href="#" data-alpha="k">K</a></li>' + '<li><a href="#" data-alpha="l">L</a></li>' + '<li><a href="#" data-alpha="m">M</a></li>' + '<li><a href="#" data-alpha="n">N</a></li>' + '<li><a href="#" data-alpha="o">O</a></li>' + '<li><a href="#" data-alpha="p">P</a></li>' + '<li><a href="#" data-alpha="q">Q</a></li>' + '<li><a href="#" data-alpha="r">R</a></li>' + '<li><a href="#" data-alpha="s">S</a></li>' + '<li><a href="#" data-alpha="t">T</a></li>' + '<li><a href="#" data-alpha="u">U</a></li>' + '<li><a href="#" data-alpha="v">V</a></li>' + '<li><a href="#" data-alpha="w">W</a></li>' + '<li><a href="#" data-alpha="x">X</a></li>' + '<li><a href="#" data-alpha="y">Y</a></li>' + '<li><a href="#" data-alpha="z">Z</a></li>' + '</ul>' + '</div>');
    $('#learningplans-container').prepend('<div class="alpha-filter"><div class="alphabet mobile-alphabet"><div class="mobile-alpha-trigger"><span class="arrow"><i class="fa fa-angle-down" aria-hidden="true"></i></span></div>' + '<ul class="mobile-alpha-list">' + '<li><a href="#" data-alpha="all" class="active">All</a></li>' + '<li><a href="#" data-alpha="a">A</a></li>' + '<li><a href="#" data-alpha="b">B</a></li>' + '<li><a href="#" data-alpha="c">C</a></li>' + '<li><a href="#" data-alpha="d">D</a></li>' + '<li><a href="#" data-alpha="e">E</a></li>' + '<li><a href="#" data-alpha="f">F</a></li>' + '<li><a href="#" data-alpha="g">G</a></li>' + '<li><a href="#" data-alpha="h">H</a></li>' + '<li><a href="#" data-alpha="i">I</a></li>' + '<li><a href="#" data-alpha="j">J</a></li>' + '<li><a href="#" data-alpha="k">K</a></li>' + '<li><a href="#" data-alpha="l">L</a></li>' + '<li><a href="#" data-alpha="m">M</a></li>' + '<li><a href="#" data-alpha="n">N</a></li>' + '<li><a href="#" data-alpha="o">O</a></li>' + '<li><a href="#" data-alpha="p">P</a></li>' + '<li><a href="#" data-alpha="q">Q</a></li>' + '<li><a href="#" data-alpha="r">R</a></li>' + '<li><a href="#" data-alpha="s">S</a></li>' + '<li><a href="#" data-alpha="t">T</a></li>' + '<li><a href="#" data-alpha="u">U</a></li>' + '<li><a href="#" data-alpha="v">V</a></li>' + '<li><a href="#" data-alpha="w">W</a></li>' + '<li><a href="#" data-alpha="x">X</a></li>' + '<li><a href="#" data-alpha="y">Y</a></li>' + '<li><a href="#" data-alpha="z">Z</a></li>' + '</ul>' + '</div></div>');
  },
  buildRefinement: function buildRefinement() {
    resourceTypeTags.sort();
    resourceConcentrationTags.sort();
    $(filterParentContainer).append('<div id="all-filter" class="filter-group" class="opened">' + '<ul class="filter-group-options"><li data-filter="all" class="active"><div class="filter-checkbox"></div><div class="filter-title">VIEW ALL</div></li></ul></div>');
    $(filterParentContainer).append('<div id="resource-type" class="filter-group" class="opened">' + '<h3 class="filter-group-title">Resource Type</h3>' + '<ul class="filter-group-options">');
    learningplans.getUniqueResults(resourceTypeTags).forEach(function (resourceType) {
      learningplans.addRefinementItem(resourceType, 'resource-type');
    });
    $(filterParentContainer).append('</ul></div>');
    $(filterParentContainer).append('<div id="concentration" class="filter-group" class="opened">' + '<h3 class="filter-group-title">Department</h3>' + '<ul class="filter-group-options">');
    learningplans.getUniqueResults(resourceConcentrationTags).forEach(function (resourceConcentration) {
      learningplans.addRefinementItem(resourceConcentration, 'concentration');
    });
    $(filterParentContainer).append('</ul></div>');
  },
  addRefinementItem: function addRefinementItem(tag, id) {
    $('#' + id + '> ul').append('<li data-filter="' + tag + '">' + '<div class="filter-checkbox"></div>' + '<div class="filter-title">' + tag + '</div>' + '</li>');
  },
  filterResultsByAlphabet: function filterResultsByAlphabet() {
    $('.mobile-alpha-trigger').click(function () {
      $('.mobile-alpha-list').addClass('active');
      $(this).next().find('a').addClass('mobile-active');
    });

    var _alphabets = $('.alphabet > ul > li > a');

    _alphabets.click(function (e) {
      e.preventDefault();
      var value = $(this).attr('data-alpha').toLowerCase();
      var hash = '#' + value;
      window.location.hash = hash;
    });
  },
  filterResultsByRefinement: function filterResultsByRefinement() {
    $('.filter-toggle').click(function () {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $('.filter-column').slideUp(400);
      } else {
        $(this).addClass('active');
        $('.filter-column').slideDown(400);
      }
    });

    var _refinements = $('.filter-group > ul > li');

    _refinements.click(function () {
      var value = $(this).attr('data-filter').toLowerCase();
      var activeFilters = 'all';

      if (value != 'all') {
        this.classList.toggle('active');
        $('[data-filter="all"]').removeClass('active');
        activeFilters = ''; // store any remaining active filters in array

        $('[data-filter].active').each(function (i) {
          var thisActiveFilter = $(this).attr('data-filter');

          if (i > 0) {
            activeFilters = activeFilters.concat("," + thisActiveFilter);
          } else {
            activeFilters = activeFilters.concat(thisActiveFilter);
          }
        }); // es6 method activeFilters = Array.from(document.querySelectorAll('[data-filter].active')).map(item => item.dataset.filter);
      }

      var hash = '#' + activeFilters;
      window.location.hash = hash;
    });
  },
  getUniqueResults: function getUniqueResults(arr) {
    var uniqueArray = arr.filter(function (elem, pos, arr) {
      return arr.indexOf(elem) == pos;
    });
    return uniqueArray;
  },
  resetWebPart: function resetWebPart() {
    var container = '#learningplans-container';
    var thiscontainer = $(container);
    thiscontainer.empty();
  }
};
"use strict";

// required
var utilities = window.utilities = require('./utilities'); // add any list functions here


module.exports = {
  getListItems: function getListItems(options, _success, error) {
    var settings = $.extend(true, {}, {
      listname: '',
      siteurl: bones.web.url,
      fields: '',
      orderby: 'Title',
      orderdirection: 'asc',
      expand: '',
      limit: 500
    }, options);
    $.ajax({
      type: 'GET',
      headers: {
        'accept': 'application/json;odata=verbose',
        "X-RequestDigest": bones.digest
      },
      url: settings.siteurl + '/_api/web/lists/getbytitle(\'' + settings.listname + '\')/Items?$top=' + settings.limit + '&$orderby=' + settings.orderby + ' ' + settings.orderdirection + '&$select=' + settings.fields + '&$expand=' + settings.expand,
      success: function success(items) {
        _success(items);
      },
      error: function error(items) {}
    });
  },
  getListFieldValuesHTML: function getListFieldValuesHTML(options, _success2, error) {
    var settings = $.extend(true, {}, {
      listname: '',
      siteurl: bones.web.url,
      id: '',
      fields: ''
    }, options);
    return $.ajax({
      type: 'GET',
      headers: {
        'accept': 'application/json;odata=verbose',
        "X-RequestDigest": bones.digest
      },
      url: settings.siteurl + '/_api/web/lists/getbytitle(\'' + settings.listname + '\')/Items(' + settings.id + ')/FieldValuesAsHTML?$select=' + settings.fields,
      success: function success(fields, id) {
        _success2(fields, settings.id);
      },
      error: function error(fields) {}
    });
  },
  createLists: function createLists(options) {
    var settings = $.extend(true, {}, {
      listName: '',
      siteUrl: bones.web.url,
      description: ''
    }, options);
    var executor;
    executor = new SP.RequestExecutor(settings.siteUrl);
    executor.executeAsync({
      url: settings.siteUrl + "/_api/web/Lists",
      method: "POST",
      body: "{ '__metadata': { 'type': 'SP.List' }, 'AllowContentTypes': true, 'ContentTypesEnabled': true, 'BaseTemplate': 100, 'Description': '" + settings.listName + "', 'Title':'" + settings.listName + "'}",
      headers: {
        "content-type": "application/json; odata=verbose"
      },
      success: function success(data) {},
      error: function error(s, a, errMsg) {}
    });
  },
  addContentTypeToList: function addContentTypeToList(options) {
    var settings = $.extend(true, {}, {
      listName: '',
      siteUrl: bones.web.url,
      contentTypeId: ''
    }, options);
    var executor;
    executor = new SP.RequestExecutor(settings.siteUrl);
    executor.executeAsync({
      url: settings.siteUrl + "/_api/web/lists/getbytitle('" + settings.listName + "')/ContentTypes/AddAvailableContentType",
      method: "POST",
      body: JSON.stringify({
        'contentTypeId': settings.contentTypeId
      }),
      headers: {
        "content-type": "application/json; odata=verbose"
      },
      success: function success(data) {},
      error: function error(s, a, errMsg) {}
    });
  },
  getITEMContentType: function getITEMContentType(options, _success3) {
    var settings = $.extend(true, {}, {
      listname: '',
      siteurl: bones.web.url
    }, options);
    $.ajax({
      type: 'GET',
      headers: {
        'accept': 'application/json;odata=verbose',
        "X-RequestDigest": bones.digest
      },
      url: settings.siteurl + '/_api/web/lists/getbytitle(\'' + settings.listname + '\')/ContentTypes?$select=Name,id&$filter=Name eq %27Item%27',
      success: function success(item) {
        _success3(item);
      },
      error: function error(item) {}
    });
  },
  removeContentTypeFromList: function removeContentTypeFromList(options) {
    var settings = $.extend(true, {}, {
      listName: '',
      siteUrl: bones.web.url,
      contentTypeId: ''
    }, options);
    var executor;
    executor = new SP.RequestExecutor(settings.siteUrl);
    executor.executeAsync({
      url: settings.siteUrl + "/_api/web/lists/getbytitle('" + settings.listName + "')/ContentTypes('" + settings.contentTypeId + "')/deleteObject()",
      method: "POST",
      headers: {
        "content-type": "application/json; odata=verbose"
      },
      success: function success(data) {},
      error: function error(s, a, errMsg) {}
    });
  },
  createListWithContentType: function createListWithContentType(options, btn, form, input) {
    var settings = $.extend(true, {}, {
      listName: '',
      siteUrl: bones.web.url,
      description: '',
      contentTypeId: ''
    }, options); // Create the list

    var listexecutor;
    listexecutor = new SP.RequestExecutor(settings.siteUrl);
    listexecutor.executeAsync({
      url: settings.siteUrl + "/_api/web/Lists",
      method: "POST",
      body: "{ '__metadata': { 'type': 'SP.List' }, 'AllowContentTypes': true, 'ContentTypesEnabled': true, 'BaseTemplate': 100, 'Description': '" + settings.description + "', 'Title':'" + settings.listName + "'}",
      headers: {
        "content-type": "application/json; odata=verbose"
      },
      success: function success(data) {
        if (data.statusText == "Created") {
          btn.text('Configuring content type...');
        } // timeout to allow list to be created ready to update


        setTimeout(function () {
          var contenttypeexecutor;
          contenttypeexecutor = new SP.RequestExecutor(settings.siteUrl);
          contenttypeexecutor.executeAsync({
            url: settings.siteUrl + "/_api/web/lists/getbytitle('" + settings.listName + "')/ContentTypes/AddAvailableContentType",
            method: "POST",
            body: JSON.stringify({
              'contentTypeId': settings.contentTypeId
            }),
            headers: {
              "content-type": "application/json; odata=verbose"
            },
            success: function success(data) {
              // timeout to allow content type(s) to be added ready to update
              setTimeout(function () {
                lists.getITEMContentType({
                  listname: settings.listName
                }, function (item) {
                  var thisCT = item.d.results;
                  var removecontenttypeexecutor;
                  removecontenttypeexecutor = new SP.RequestExecutor(settings.siteUrl);
                  removecontenttypeexecutor.executeAsync({
                    url: settings.siteUrl + "/_api/web/lists/getbytitle('" + settings.listName + "')/ContentTypes('" + thisCT[0].Id.StringValue + "')/deleteObject()",
                    method: "POST",
                    headers: {
                      "content-type": "application/json; odata=verbose"
                    },
                    success: function success(data) {},
                    error: function error(s, a, errMsg) {}
                  });
                });
              }, 2000);
            },
            error: function error(s, a, errMsg) {}
          });

          if (status == 'error') {
            form.remove();
            return;
          } // update input


          input.val(settings.listName);
          input.trigger('change'); // close new form

          form.remove();
        }, 5000);
      },
      error: function error(s, a, errMsg) {}
    });
  },
  addColumnToList: function addColumnToList(options) {
    // fieldtype can be any of the following values:
    // Integer = 0
    // Text = 1
    // Note = 3
    // DateTime = 4
    // Counter = 5
    // Choice = 6
    // Lookup = 7
    // Boolean = 8
    // Number = 9
    // Currency = 10
    // URL = 11
    // User = 20
    var settings = $.extend(true, {}, {
      listName: '',
      siteUrl: bones.web.url,
      fieldType: '',
      fieldTitle: '',
      fieldDisplayName: ''
    }, options);
    var executor;
    executor = new SP.RequestExecutor(settings.siteUrl);
    executor.executeAsync({
      url: settings.siteUrl + "/_api/web/lists/getbytitle('" + settings.listName + "')/fields",
      method: 'POST',
      body: "{'__metadata': { 'type': 'SP.Field' }, 'FieldTypeKind': " + settings.fieldType + ", 'Title': '" + settings.fieldTitle + "', 'Description': '" + settings.fieldDisplayName + "'}",
      headers: {
        'content-type': 'application/json;odata=verbose'
      },
      success: function success(data) {},
      error: function error(s, a, errMsg) {}
    });
  },
  buildwebpart: function buildwebpart(options) {
    var settings = $.extend(true, {}, {
      trigger: '',
      container: ''
    }, options);

    var loadview = function loadview() {
      $(settings.trigger).each(function (j) {
        // get data
        var webpart = $(this);
        var body = webpart.parent(); // get existing container

        var container = body.next(settings.container); // create container

        if (!container.size()) {
          var containerclass = settings.container.substring(settings.container.indexOf('.') + 1);
          container = $('<div class="' + containerclass + '"></div>');
          body.after(container);
        } // hide the body


        body.hide(); // get list

        var list = '';
        if (webpart.is('[data-list]')) list = webpart.attr('data-list'); // edit mode controls (first time setup only)

        if (bones.page.editmode && !container.children('.edit-mode-panel').size()) {
          // disable content editor
          body.removeAttr('contenteditable').removeAttr('contenteditor');
          body.parent().removeAttr('rteredirect'); // add edit panel

          container.append('<div class="edit-mode-panel"><div class="ms-formfieldlabelcontainer">List</div><div class="ms-formfieldvaluecontainer"><input class="webpart-list" type="text" value="' + list + '"/></div></div>');
        } // remove edit buttons


        container.find('.list-edit').remove(); // no list?

        if (!list.length) {
          return;
        } // edit list button


        if (bones.page.editmode) {
          var editBtn = $('<button class="btn btn-sm list-edit" title="Add and edit links in this list"><i class="fa fa-pencil" aria-hidden="true"></i></button>');
          editBtn.on('click', function (e) {
            e.preventDefault();

            var openDialog = function openDialog() {
              SP.UI.ModalDialog.showModalDialog({
                url: bones.web.url + '/Lists/' + list,
                autoSize: true,
                dialogReturnValueCallback: function dialogReturnValueCallback(result, data) {
                  if (result == SP.UI.DialogResult.OK) {
                    openDialog();
                  }

                  if (result == SP.UI.DialogResult.cancel) {}
                }
              });
            };

            openDialog();
          });
          container.find('input.webpart-list').after(editBtn);
        }
      });
    };

    loadview();
  },
  editwebpart: function editwebpart(options) {
    var settings = $.extend(true, {}, {
      trigger: '',
      container: '',
      contenttypeid: '',
      removecontenttypeid: ''
    }, options); // editor

    var loadeditor = function loadeditor() {
      $(settings.container).find('input.webpart-list').each(function () {
        var input = $(this);
        var list = input.val().trim(); // change

        input.on('change', function () {
          input.closest(settings.container).prev('div').find(settings.trigger).attr('data-list', $(this).val());
          lists.buildwebpart({
            trigger: settings.trigger,
            container: settings.container
          });
        }); // create btn

        var createBtn = $('<button class="btn btn-sm webpart-list-create" title="Create a new list"><i class="fa fa-plus" aria-hidden="true"></i></button>');
        input.parent().append(createBtn); // create

        createBtn.on('click', function (e) {
          e.preventDefault(); // close form

          if ($(this).next('.webpart-form').size() > 0) {
            $(this).next('.webpart-form').remove();
          } // new form
          else {
              // create form
              var form = $('<div class="webpart-form"><input type="text" placeholder="New List Name"><button class="btn btn-sm">Create</button></div>');
              $(this).after(form); // submit

              form.children('button').on('click', function (e) {
                e.preventDefault(); // disabled?

                if ($(this).is('[disabled]')) {
                  return;
                } // disable button


                var btn = $(this);
                btn.attr('disabled', 'disabled').text('Creating list...'); // get new list name

                var listName = $(this).prev('input').val().trim(); // sanitize list name

                listName = listName.replace(/[^A-Z|a-z|\d|\s]/g, ''); // no list?

                if (!listName.length) {
                  form.remove();
                  return;
                } // create list


                lists.createListWithContentType({
                  listName: listName,
                  description: listName,
                  contentTypeId: settings.contenttypeid,
                  removeContentTypeId: settings.removecontenttypeid
                }, btn, form, input);
              });
            }
        });
      });
    };

    loadeditor();
  }
};
"use strict";

var lists = window.lists = require('./lists');

var utilities = window.utilities = require('./utilities');

module.exports = {
  // skeleton code for web part
  load: function load(options) {
    var settings = $.extend(true, {}, {
      trigger: '.wp-news',
      container: '.news-container',
      contenttypeid: '0x0100AEA90137ECD81349B17DB7219FE344CD' // newswebpart

    }, options);

    (function ($) {
      lists.buildwebpart({
        trigger: settings.trigger,
        container: settings.container
      });
      $(settings.container).each(function () {
        var thisContainer = $(this); // remove any previously-fetched items

        thisContainer.find('ul').remove(); // get list name

        var listname = thisContainer.closest('.ms-webpartzone-cell').find(settings.trigger).attr('data-list'); // get list items

        if (!bones.page.editmode) {
          lists.getListItems({
            listname: listname,
            fields: 'Title,Enabled,CallToAction,SortOrder,Excerpt,Id,OpenLinkInNewWindow',
            orderby: 'SortOrder'
          }, function (items) {
            var itemsdata = items.d.results;
            thisContainer.append('<ul/>');
            var thiscontainer = thisContainer.find('ul');

            for (var i = 0; i < itemsdata.length; i++) {
              var thisTitle = itemsdata[i].Title;
              var thisEnabled = itemsdata[i].Enabled;
              var thisExcerpt = itemsdata[i].Excerpt;
              var thisID = itemsdata[i].Id;
              var newWindow = itemsdata[i].OpenLinkInNewWindow;

              if (itemsdata[i].Excerpt === null) {
                thisExcerpt = '';
              }

              if (thisEnabled) {
                if (itemsdata[i].CallToAction != null && itemsdata[i].CallToAction != undefined) {
                  var thisButtonText = itemsdata[i].CallToAction.Description;
                  var thisButtonUrl = itemsdata[i].CallToAction.Url;

                  if (newWindow) {
                    thiscontainer.append('<li class="news-slide row no-gutter"><div class="news-slide-image news-image-' + thisID + ' col-sm-7"></div><div class="news-slide-content col-sm-5"><h1>News & Announcements</h1><div class="news-slide-title">' + thisTitle + '</div><div class="news-slide-excerpt">' + thisExcerpt + '</div><div class="news-slide-btn"><a href="' + thisButtonUrl + '" class="bah-cta" target="_blank">' + thisButtonText + '</a></div></div></li>');
                  } else {
                    thiscontainer.append('<li class="news-slide row no-gutter"><div class="news-slide-image news-image-' + thisID + ' col-sm-7"></div><div class="news-slide-content col-sm-5"><h1>News & Announcements</h1><div class="news-slide-title">' + thisTitle + '</div><div class="news-slide-excerpt">' + thisExcerpt + '</div><div class="news-slide-btn"><a href="' + thisButtonUrl + '" class="bah-cta">' + thisButtonText + '</a></div></div></li>');
                  }
                } else {
                  thiscontainer.append('<li class="news-slide row no-gutter"><div class="news-slide-image news-image-' + thisID + ' col-sm-7"></div><div class="news-slide-content col-sm-5"><h1>News & Announcements</h1><div class="news-slide-title">' + thisTitle + '</div><div class="news-slide-excerpt">' + thisExcerpt + '</div></div></li>');
                }
              }

              lists.getListFieldValuesHTML({
                listname: listname,
                fields: 'BAHImage',
                id: thisID
              }, function (fields, id) {
                var thisImage = fields.d.BAHImage;
                var checkExist = setInterval(function () {
                  if (thisImage && $(thisImage) && $(thisImage)[0] && $(thisImage)[0].width != 0) {
                    var imageRatio = $(thisImage)[0].width / $(thisImage)[0].height;
                    var containerRatio = thisContainer.find('.news-image-' + id).width() / thisContainer.find('.news-image-' + id).height();
                    thisContainer.find('.news-image-' + id).append(thisImage);

                    if (imageRatio > containerRatio) {
                      thisContainer.find('.news-image-' + id + ' img').width('auto').height('100%');
                    } else {
                      thisContainer.find('.news-image-' + id + ' img').width('100%').height('auto');
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
        }

        ;
      }); // load editor

      lists.editwebpart({
        trigger: settings.trigger,
        container: settings.container,
        contenttypeid: settings.contenttypeid
      });
    })(jQuery);
  }
};
"use strict";

var lists = window.lists = require('./lists');

var utilities = window.utilities = require('./utilities');

var partnershipTags = [];
var concentrationTags = [];
var technologyTags = [];
var certificationTags = [];
var degreeTags = [];
var container = '#partnership-container';
var thiscontainer = $(container);
var resultsParentContainer = '.partnership-results-column';
var resultsNavigationContainer = '.alpha-filter';
var resultsContainer = '.results';
var filterParentContainer = '.filter-column';
var filterContainer = '.filter-group-options';
module.exports = {
  // skeleton code for web part
  load: function load() {
    partnerships.resetWebPart();
    partnerships.buildWebPart();
    var checkExist = setInterval(function () {
      if ($('.partnership-item').size() != 0) {
        partnerships.buildRefinement();
        partnerships.filterResultsByAlphabet();
        partnerships.filterResultsByRefinement(); // save desc original heights for animation

        $('.trimmed').each(function () {
          var thisHeight = $(this).height();
          $(this).attr('data-height', thisHeight);
          $(this).css('height', '90px');
        }); // show more or less fellow description

        $('.description-toggle-link').click(function (e) {
          e.preventDefault();

          if ($(this).hasClass('description-more-link')) {
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
        }); // hash change

        $(window).on('hashchange', function (e) {
          // get hash
          var hash = window.location.hash.replace('#', '');
          hash = decodeURIComponent(hash);

          var _alphabets = $('.alphabet > ul > li > a');

          var _refinements = $('.filter-group > ul > li');

          var _contentRows = $('.partnership-item');

          var _count = 0;

          _contentRows.hide();

          $('.mobile-alpha-list').removeClass('active');
          $('.alphabet > ul > li > a').removeClass('mobile-active');

          if (hash.length === 0 || hash === 'all') {
            _refinements.removeClass('active');

            $('[data-filter="all"]').addClass('active');

            _alphabets.removeClass('active');

            $('[data-alpha="all"]').addClass('active');

            _contentRows.fadeIn(400);

            _count = _contentRows.size();
          } else {
            if (hash.length === 1) {
              _refinements.removeClass('active');

              $('[data-filter="all"]').addClass('active');

              _alphabets.removeClass('active');

              $('[data-alpha="all"]').removeClass('active');
              $('[data-alpha-filter="' + hash + '"]').fadeIn(400);
              $('[data-alpha="' + hash + '"]').addClass('active');
              _count = $('[data-alpha-filter="' + hash + '"]').size();
            } else {
              _alphabets.removeClass('active');

              $('[data-alpha="all"]').addClass('active');

              _refinements.removeClass('active'); // store filters in array


              var activeFilters = hash.split(','); // show results based on active filter array

              _contentRows.each(function (i) {
                var theseTags = [];
                $(this).find('.tags span').each(function () {
                  theseTags.push(this);
                });

                var _cellText = theseTags.map(function (item) {
                  return item.textContent;
                });

                var thisContains = activeFilters.every(function (val) {
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

                if (thisContains) {
                  _count += 1;
                  $(this).fadeIn(400);
                }
              });
            }
          }

          $('.no-results').remove();

          if (_count === 0) {
            $('<div class="no-results">There are no results. <a href="#">VIEW ALL</a></div>').appendTo('.results');
            $('.no-results a').click(function (e) {
              e.preventDefault();

              _contentRows.hide();

              _alphabets.removeClass('active');

              _refinements.removeClass('active');

              $('[data-alpha="all"]').addClass('active');
              $('[data-filter="all"]').addClass('active');

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
  buildWebPart: function buildWebPart() {
    // Render filtering column
    thiscontainer.append('<div class="filter-toggle"><i class="fa fa-filter" aria-hidden="true"></i><span class="text">Filter</span></div><div class="filter-column col-md-3"></div>'); // Render results column

    thiscontainer.append('<div class="partnership-results-column col-md-9">'); // Render alphabet navigation

    $(resultsParentContainer).append('<div class="alpha-filter">');
    partnerships.buildAlphabet();
    $(resultsParentContainer).append('</div>'); // Render results panel

    $(resultsParentContainer).append('<div class="results">'); // Render results

    lists.getListItems({
      listname: 'Partnerships',
      //listname,
      fields: 'Title,Desc,HTMLDescription,Enabled,LinkURL,Certification,Concentration,Degree,PartnershipType,Technology,Id,OpenLinkInNewWindow',
      orderby: 'Title'
    }, function (items) {
      var itemsdata = items.d.results;

      for (var i = 0; i < itemsdata.length; i++) {
        var thisTitle = itemsdata[i].Title;
        var thisDesc = itemsdata[i].Desc;
        var thisHTML = itemsdata[i].HTMLDescription;
        var thisEnabled = itemsdata[i].Enabled;
        var thisID = itemsdata[i].Id;
        var newWindow = itemsdata[i].OpenLinkInNewWindow;
        var letter = thisTitle.toLowerCase().substring(0, 1);
        var finalDescription = '';
        var thisTitleBuild = '<div class="title">' + thisTitle + '</div>';

        if (thisDesc != undefined || thisDesc != null) {
          finalDescription = '<div class="description">' + thisDesc + '</div>';
        } else {
          if (thisHTML != undefined || thisHTML != null) {
            var thisHTMLtext = $('<div>' + thisHTML + '</div>').text().trim().replace(/\u200B/g, '').replace(/ /g, '').length;

            if (thisHTMLtext != 0) {
              if (thisHTMLtext > 300) {
                finalDescription = '<div class="description"><div class="desc-inner trimmed">' + thisHTML + '<br/><a href="#" class="description-less-link description-toggle-link">View Less</a></div><div class="description-overlay"></div><a href="#" class="description-more-link description-toggle-link">View More</a></div>';
              } else {
                finalDescription = '<div class="description">' + thisHTML + '</div>';
              }
            }
          }
        }

        if (thisEnabled) {
          if (itemsdata[i].LinkURL != null && itemsdata[i].LinkURL != undefined) {
            var thisUrl = itemsdata[i].LinkURL.Url;

            if (newWindow) {
              thisTitleBuild = '<div class="title"><a href="' + thisUrl + '" class="partnership-title" target="_blank">' + thisTitle + '</a></div>';
            } else {
              thisTitleBuild = '<div class="title"><a href="' + thisUrl + '" class="partnership-title">' + thisTitle + '</a></div>';
            }
          }

          var sParent = '<div class="partnership-item" data-alpha-filter="' + letter + '">' + thisTitleBuild + finalDescription + '<div class="tags">';
          var items = '';

          if (itemsdata[i].PartnershipType.results.length >= 1 && itemsdata[i].PartnershipType.results != undefined) {
            var partnershipTypeArr = itemsdata[i].PartnershipType.results;

            for (var j = 0; j < partnershipTypeArr.length; j++) {
              var thisPartnershipType = partnershipTypeArr[j].Label;
              items += '<span>' + thisPartnershipType + '</span>';
              partnershipTags.push(thisPartnershipType);
            }
          }

          if (itemsdata[i].Concentration.results.length >= 1 && itemsdata[i].Concentration.results != undefined) {
            for (var j = 0; j < itemsdata[i].Concentration.results.length; j++) {
              var thisConcentration = itemsdata[i].Concentration.results[j].Label;
              items += '<span>' + thisConcentration + '</span>';
              concentrationTags.push(thisConcentration);
            }
          }

          if (itemsdata[i].Technology.results.length >= 1 && itemsdata[i].Technology.results != undefined) {
            for (var j = 0; j < itemsdata[i].Technology.results.length; j++) {
              var thisTechnology = itemsdata[i].Technology.results[j].Label;
              items += '<span>' + thisTechnology + '</span>';
              technologyTags.push(thisTechnology);
            }
          }

          if (itemsdata[i].Certification.results.length >= 1 && itemsdata[i].Certification.results != undefined) {
            for (var j = 0; j < itemsdata[i].Certification.results.length; j++) {
              var thisCertification = itemsdata[i].Certification.results[j].Label;
              items += '<span>' + thisCertification + '</span>';
              certificationTags.push(thisCertification);
            }
          }

          if (itemsdata[i].Degree.results.length >= 1 && itemsdata[i].Degree.results != undefined) {
            for (var j = 0; j < itemsdata[i].Degree.results.length; j++) {
              var thisDegree = itemsdata[i].Degree.results[j].Label;
              items += '<span>' + thisDegree + '</span>';
              degreeTags.push(thisDegree);
            }
          }

          var cParent = '</div></div>';
          $(resultsContainer).append(sParent + items + cParent);
        }
      }
    });
    $(resultsParentContainer).append('</div>');
    thiscontainer.append('</div>');
  },
  buildAlphabet: function buildAlphabet() {
    $(resultsNavigationContainer).append('<div class="alphabet">' + '<ul>' + '<li><a href="#" data-alpha="all" class="active">All</a></li>' + '<li><a href="#" data-alpha="a">A</a></li>' + '<li><a href="#" data-alpha="b">B</a></li>' + '<li><a href="#" data-alpha="c">C</a></li>' + '<li><a href="#" data-alpha="d">D</a></li>' + '<li><a href="#" data-alpha="e">E</a></li>' + '<li><a href="#" data-alpha="f">F</a></li>' + '<li><a href="#" data-alpha="g">G</a></li>' + '<li><a href="#" data-alpha="h">H</a></li>' + '<li><a href="#" data-alpha="i">I</a></li>' + '<li><a href="#" data-alpha="j">J</a></li>' + '<li><a href="#" data-alpha="k">K</a></li>' + '<li><a href="#" data-alpha="l">L</a></li>' + '<li><a href="#" data-alpha="m">M</a></li>' + '<li><a href="#" data-alpha="n">N</a></li>' + '<li><a href="#" data-alpha="o">O</a></li>' + '<li><a href="#" data-alpha="p">P</a></li>' + '<li><a href="#" data-alpha="q">Q</a></li>' + '<li><a href="#" data-alpha="r">R</a></li>' + '<li><a href="#" data-alpha="s">S</a></li>' + '<li><a href="#" data-alpha="t">T</a></li>' + '<li><a href="#" data-alpha="u">U</a></li>' + '<li><a href="#" data-alpha="v">V</a></li>' + '<li><a href="#" data-alpha="w">W</a></li>' + '<li><a href="#" data-alpha="x">X</a></li>' + '<li><a href="#" data-alpha="y">Y</a></li>' + '<li><a href="#" data-alpha="z">Z</a></li>' + '</ul>' + '</div>');
    $('#partnership-container').prepend('<div class="alpha-filter"><div class="alphabet mobile-alphabet"><div class="mobile-alpha-trigger"><span class="arrow"><i class="fa fa-angle-down" aria-hidden="true"></i></span></div>' + '<ul class="mobile-alpha-list">' + '<li><a href="#" data-alpha="all" class="active">All</a></li>' + '<li><a href="#" data-alpha="a">A</a></li>' + '<li><a href="#" data-alpha="b">B</a></li>' + '<li><a href="#" data-alpha="c">C</a></li>' + '<li><a href="#" data-alpha="d">D</a></li>' + '<li><a href="#" data-alpha="e">E</a></li>' + '<li><a href="#" data-alpha="f">F</a></li>' + '<li><a href="#" data-alpha="g">G</a></li>' + '<li><a href="#" data-alpha="h">H</a></li>' + '<li><a href="#" data-alpha="i">I</a></li>' + '<li><a href="#" data-alpha="j">J</a></li>' + '<li><a href="#" data-alpha="k">K</a></li>' + '<li><a href="#" data-alpha="l">L</a></li>' + '<li><a href="#" data-alpha="m">M</a></li>' + '<li><a href="#" data-alpha="n">N</a></li>' + '<li><a href="#" data-alpha="o">O</a></li>' + '<li><a href="#" data-alpha="p">P</a></li>' + '<li><a href="#" data-alpha="q">Q</a></li>' + '<li><a href="#" data-alpha="r">R</a></li>' + '<li><a href="#" data-alpha="s">S</a></li>' + '<li><a href="#" data-alpha="t">T</a></li>' + '<li><a href="#" data-alpha="u">U</a></li>' + '<li><a href="#" data-alpha="v">V</a></li>' + '<li><a href="#" data-alpha="w">W</a></li>' + '<li><a href="#" data-alpha="x">X</a></li>' + '<li><a href="#" data-alpha="y">Y</a></li>' + '<li><a href="#" data-alpha="z">Z</a></li>' + '</ul>' + '</div></div>');
  },
  buildRefinement: function buildRefinement() {
    partnershipTags.sort();
    concentrationTags.sort();
    technologyTags.sort();
    certificationTags.sort();
    degreeTags.sort();
    $(filterParentContainer).append('<div id="all-filter" class="filter-group" class="opened">' + '<ul class="filter-group-options"><li data-filter="all" class="active"><div class="filter-checkbox"></div><div class="filter-title">VIEW ALL</div></li></ul></div>');
    $(filterParentContainer).append('<div id="partnership-type" class="filter-group" class="opened">' + '<h3 class="filter-group-title">Partnership Type</h3>' + '<ul class="filter-group-options">');
    partnerships.getUniqueResults(partnershipTags).forEach(function (partnership) {
      partnerships.addRefinementItem(partnership, 'partnership-type');
    });
    $(filterParentContainer).append('</ul></div>');
    $(filterParentContainer).append('<div id="concentration" class="filter-group" class="opened">' + '<h3 class="filter-group-title">Concentration</h3>' + '<ul class="filter-group-options">');
    partnerships.getUniqueResults(concentrationTags).forEach(function (concentration) {
      partnerships.addRefinementItem(concentration, 'concentration');
    });
    $(filterParentContainer).append('</ul></div>');
    $(filterParentContainer).append('<div id="technology" class="filter-group" class="opened">' + '<h3 class="filter-group-title">Technology</h3>' + '<ul class="filter-group-options">');
    partnerships.getUniqueResults(technologyTags).forEach(function (technology) {
      partnerships.addRefinementItem(technology, 'technology');
    });
    $(filterParentContainer).append('</ul></div>');
    $(filterParentContainer).append('<div id="certification" class="filter-group" class="opened">' + '<h3 class="filter-group-title">Certification</h3>' + '<ul class="filter-group-options">');
    partnerships.getUniqueResults(certificationTags).forEach(function (certification) {
      partnerships.addRefinementItem(certification, 'certification');
    });
    $(filterParentContainer).append('</ul></div>');
    $(filterParentContainer).append('<div id="degree" class="filter-group" class="opened">' + '<h3 class="filter-group-title">Degree</h3>' + '<ul class="filter-group-options">');
    partnerships.getUniqueResults(degreeTags).forEach(function (degree) {
      partnerships.addRefinementItem(degree, 'degree');
    });
    $(filterParentContainer).append('</ul></div>');
  },
  addRefinementItem: function addRefinementItem(tag, id) {
    $('#' + id + '> ul').append('<li data-filter="' + tag + '">' + '<div class="filter-checkbox"></div>' + '<div class="filter-title">' + tag + '</div>' + '</li>');
  },
  filterResultsByAlphabet: function filterResultsByAlphabet() {
    $('.mobile-alpha-trigger').click(function () {
      $('.mobile-alpha-list').addClass('active');
      $(this).next().find('a').addClass('mobile-active');
    });

    var _alphabets = $('.alphabet > ul > li > a');

    _alphabets.click(function (e) {
      e.preventDefault();
      var value = $(this).attr('data-alpha').toLowerCase();
      var hash = '#' + value;
      window.location.hash = hash;
    });
  },
  filterResultsByRefinement: function filterResultsByRefinement() {
    $('.filter-toggle').click(function () {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $('.filter-column').slideUp(400);
      } else {
        $(this).addClass('active');
        $('.filter-column').slideDown(400);
      }
    });

    var _refinements = $('.filter-group > ul > li');

    _refinements.click(function () {
      var value = $(this).attr('data-filter').toLowerCase();
      var activeFilters = 'all';

      if (value != 'all') {
        this.classList.toggle('active');
        $('[data-filter="all"]').removeClass('active');
        activeFilters = ''; // store any remaining active filters in array

        $('[data-filter].active').each(function (i) {
          var thisActiveFilter = $(this).attr('data-filter');

          if (i > 0) {
            activeFilters = activeFilters.concat("," + thisActiveFilter);
          } else {
            activeFilters = activeFilters.concat(thisActiveFilter);
          }
        }); // es6 method activeFilters = Array.from(document.querySelectorAll('[data-filter].active')).map(item => item.dataset.filter);
      }

      var hash = '#' + activeFilters;
      window.location.hash = hash;
    });
  },
  getUniqueResults: function getUniqueResults(arr) {
    var uniqueArray = arr.filter(function (elem, pos, arr) {
      return arr.indexOf(elem) == pos;
    });
    return uniqueArray;
  },
  resetWebPart: function resetWebPart() {
    var container = '#partnership-container';
    var thiscontainer = $(container);
    thiscontainer.empty();
  }
};
"use strict";

var lists = window.lists = require('./lists');

var utilities = window.utilities = require('./utilities');

module.exports = {
  // skeleton code for web part
  load: function load(options) {
    var settings = $.extend(true, {}, {
      trigger: '.wp-resources',
      container: '.resources-container',
      contenttypeid: '0x0100B038C6A9EF4F10468708A64AC9289D8F' // resourceswebpart

    }, options);

    (function ($) {
      lists.buildwebpart({
        trigger: settings.trigger,
        container: settings.container
      });
      $(settings.container).each(function () {
        var thisContainer = $(this); // remove any previously-fetched items

        thisContainer.children('.resource-items').remove();

        if (thisContainer.closest('.ms-webpartzone-cell').find('.ms-webpart-chrome-title').size() > 0) {
          var webpartDescription = thisContainer.closest('.ms-webpartzone-cell').find('.js-webpart-titleCell').attr('title').split(' - ')[1];

          if (webpartDescription.length > 0) {
            thisContainer.closest('.ms-webpartzone-cell').find('h2.ms-webpart-titleText').append('<div class="webpart-description">' + webpartDescription) + '</div>';
          }
        } // get list name


        var listname = thisContainer.closest('.ms-webpartzone-cell').find(settings.trigger).attr('data-list'); // get list items

        if (!bones.page.editmode) {
          lists.getListItems({
            listname: listname,
            fields: 'Title,Desc,Enabled,LinkURL,SortOrder,Id,OpenLinkInNewWindow',
            orderby: 'SortOrder'
          }, function (items) {
            var itemsdata = items.d.results;
            var thiscontainer = thisContainer;

            for (var i = 0; i < itemsdata.length; i++) {
              var thisTitle = itemsdata[i].Title;
              var thisDesc = itemsdata[i].Desc;
              var thisEnabled = itemsdata[i].Enabled;
              var thisID = itemsdata[i].Id;
              var newWindow = itemsdata[i].OpenLinkInNewWindow;

              if (itemsdata[i].Desc === null) {
                thisDesc = '';
              }

              if (thisEnabled) {
                if (itemsdata[i].LinkURL != null && itemsdata[i].LinkURL != undefined) {
                  var thisUrl = itemsdata[i].LinkURL.Url;

                  if (newWindow) {
                    thiscontainer.append('<a href="' + thisUrl + '" class="resource-item" target="_blank"><div class="resource-image resource-image-' + thisID + '"></div><div class="resource-content"><h2 class="resource-title">' + thisTitle + '</h2><div class="resource-desc">' + thisDesc + '</div></div></a>');
                  } else {
                    thiscontainer.append('<a href="' + thisUrl + '" class="resource-item"><div class="resource-image resource-image-' + thisID + '"></div><div class="resource-content"><h2 class="resource-title">' + thisTitle + '</h2><div class="resource-desc">' + thisDesc + '</div></div></a>');
                  }
                } else {
                  thiscontainer.append('<div class="resource-item"><div class="resource-image resource-image-' + thisID + '"></div><div class="resource-content"><h2 class="resource-title">' + thisTitle + '</h2><div class="resource-desc">' + thisDesc + '</div></div></div>');
                }
              }

              lists.getListFieldValuesHTML({
                listname: listname,
                fields: 'ThumbnailImage',
                id: thisID
              }, function (fields, id) {
                var thisImage = fields.d.ThumbnailImage;

                if (thisImage != null) {
                  thisContainer.find('.resource-image-' + id).append(thisImage);
                }
              });
            }
          });
        }

        ;
      }); // load editor

      lists.editwebpart({
        trigger: settings.trigger,
        container: settings.container,
        contenttypeid: settings.contenttypeid
      });
    })(jQuery);
  }
};
"use strict";

/*! tabify.js v1.0 | MIT License | https://github.com/oldrivercreative/tabify.js */
(function ($) {
  $.fn.tabify = function (options) {
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
    }, options); // tabify

    this.each(function () {
      // get objects
      var trigger = $(this).closest(settings.panel);
      var container = trigger.closest(settings.container); // destroy?

      if (settings.destroy) {
        container.trigger('tabify-destroy');
      } // create
      else {
          // init
          container.on('tabify-init', function () {
            // add classes
            container.addClass(settings.cssclass); // <ul>

            var ul = $('<ul class="' + settings.cssclass + '-nav" />'); // panels

            var tabContainers = 0;
            container.find(settings.panel).each(function (i) {
              // get panel
              var panel = $(this); // not trigger?

              if (!panel.is(trigger)) {
                // add classes
                panel.addClass(settings.cssclass + '-panel'); // id

                var id = 'panel' + (i + 1);
                panel.attr('id', id); // title

                var label = 'No title';
                var title = panel.find(settings.title); // found title?

                if (title.size() > 0) {
                  // title text?
                  var titletext = title.text();

                  if (titletext.length > 0) {
                    label = titletext;
                  } // hide title?


                  if (settings.hidetitles) {
                    title.addClass(settings.cssclass + '-hidden');
                  }
                } // <li>


                var li = $('<li><a href="#' + id + '"><span>' + label + '</span></a></li>'); // <a>

                li.children('a').on('click', function (e) {
                  // prevent hash in url
                  e.preventDefault(); // target

                  var target = $(this).attr('href'); // change

                  container.trigger('tabify-change', [target]);
                }); // active panel?

                if (tabContainers == 0) {
                  panel.addClass('active');
                  li.addClass('active');
                  tabContainers++;
                } // add to <ul>


                ul.append(li);
              } // trigger
              else {
                  panel.addClass(settings.cssclass + '-hidden');
                }
            }); // reverse z-index?

            if (settings.reversez) {
              // get <li>'s
              var items = ul.children('li'); // z-index

              items.each(function (i) {
                $(this).css('z-index', items.size() - i);
              });
            } // add tabs


            container.prepend(ul); // oninit?

            if (typeof settings.oninit == 'function') {
              settings.oninit();
            }
          }); // change

          container.on('tabify-change', function (e, target) {
            // deactivate links
            container.children('ul:eq(0)').children('li').removeClass('active'); // deactivate panels

            container.find(settings.panel).removeClass('active'); // activate link

            container.find('a[href="' + target + '"]').parent('li').addClass('active'); // activate panel

            $(target).addClass('active');
          }); // destroy

          container.on('tabify-destroy', function () {
            // remove classes
            container.removeClass(settings.cssclass); // remove panels

            container.find(settings.panel).removeAttr('id').removeClass(settings.cssclass + '-panel active'); // remove <ul>

            container.children('ul:eq(0)').remove();
          }); // enabled?

          if (settings.enabled) {
            // init
            container.trigger('tabify-init');
          }
        }
    }); // done

    return this;
  };
})(jQuery);
"use strict";

var lists = window.lists = require('./lists');

var utilities = window.utilities = require('./utilities');

module.exports = {
  // skeleton code for web part
  load: function load(options) {
    var settings = $.extend(true, {}, {
      trigger: '.wp-tiles',
      container: '.tiles-container',
      contenttypeid: '0x01006EE6A902D00DD140999A126BFDF9EEEA' // tileswebpart

    }, options);

    (function ($) {
      lists.buildwebpart({
        trigger: settings.trigger,
        container: settings.container
      });
      $(settings.container).each(function () {
        var thisContainer = $(this);

        if (thisContainer.closest('.ms-webpartzone-cell').find('.ms-webpart-chrome-title').size() > 0) {
          var webpartDescription = thisContainer.closest('.ms-webpartzone-cell').find('.js-webpart-titleCell').attr('title').split(' - ')[1];

          if (webpartDescription.length > 0) {
            thisContainer.closest('.ms-webpartzone-cell').find('h2.ms-webpart-titleText').append('<div class="webpart-description">' + webpartDescription) + '</div>';
          }
        } // remove any previously-fetched items


        thisContainer.children('a.tiles-link').remove(); // get list name

        var listname = thisContainer.closest('.ms-webpartzone-cell').find(settings.trigger).attr('data-list'); // get list items

        if (!bones.page.editmode) {
          lists.getListItems({
            listname: listname,
            fields: 'Title,Enabled,LinkURL,SortOrder,Desc,OpenLinkInNewWindow',
            orderby: 'SortOrder'
          }, function (items) {
            var itemsdata = items.d.results;
            var thiscontainer = thisContainer;

            for (var i = 0; i < itemsdata.length; i++) {
              var thisTitle = itemsdata[i].Title;
              var thisDesc = itemsdata[i].Desc;
              var thisEnabled = itemsdata[i].Enabled;
              var thisLinkURL = itemsdata[i].LinkURL;
              var newWindow = itemsdata[i].OpenLinkInNewWindow;

              if (itemsdata[i].Desc === null) {
                thisDesc = '';
              }

              if (thisEnabled) {
                if (newWindow) {
                  thiscontainer.append('<a href="' + thisLinkURL.Url + '" alt="' + thisTitle + '" class="tiles-link tiles-link-' + i % 6 + '" target="_blank"><span class="tiles-link-text"><span class="tiles-link-title">' + thisTitle + '</span><span class="tiles-link-desc">' + thisDesc + '</span></span></a>');
                } else {
                  thiscontainer.append('<a href="' + thisLinkURL.Url + '" alt="' + thisTitle + '" class="tiles-link tiles-link-' + i % 6 + '"><span class="tiles-link-text"><span class="tiles-link-title">' + thisTitle + '</span><span class="tiles-link-desc">' + thisDesc + '</span></span></a>');
                }
              }
            }
          });
        }

        ;
      }); // load editor

      lists.editwebpart({
        trigger: settings.trigger,
        container: settings.container,
        contenttypeid: settings.contenttypeid
      });
    })(jQuery);
  }
};
"use strict";

var lists = window.lists = require('./lists');

var utilities = window.utilities = require('./utilities');

module.exports = {
  // skeleton code for web part
  load: function load(options) {
    var settings = $.extend(true, {}, {
      trigger: '.wp-universities',
      container: '.universities-container',
      contenttypeid: '0x01009E2AB436042E524F87C729D9C0C55549' //universitywebpart

    }, options);

    (function ($) {
      lists.buildwebpart({
        trigger: settings.trigger,
        container: settings.container
      });
      $(settings.container).each(function () {
        var thisContainer = $(this); // remove any previously-fetched items

        thisContainer.find('.container').remove(); // get list name

        var listname = thisContainer.closest('.ms-webpartzone-cell').find(settings.trigger).attr('data-list'); // get list items

        if (!bones.page.editmode) {
          lists.getListItems({
            listname: listname,
            fields: 'Title,Enabled,LinkURL,SortOrder,ComingSoon,OpenLinkInNewWindow',
            orderby: 'SortOrder'
          }, function (items) {
            if (thisContainer.closest('.ms-webpartzone-cell').find('.ms-webpart-chrome-title').size() > 0) {
              thisContainer.closest('.ms-webpartzone-cell').find('.ms-webpart-chrome-title').hide();
              var webpartTitle = thisContainer.closest('.ms-webpartzone-cell').find('.js-webpart-titleCell').attr('title').split(' - ')[0];
              var webpartDescription = thisContainer.closest('.ms-webpartzone-cell').find('.js-webpart-titleCell').attr('title').split(' - ')[1];

              if (webpartTitle.toLowerCase() != 'untitled') {
                if (webpartDescription != undefined) {
                  var webpartHeading = '<h1>' + webpartTitle + '</h1><div class="university-description">' + webpartDescription + '</div>';
                } else {
                  var webpartHeading = '<h1>' + webpartTitle + '</h1>';
                }
              } else {
                var webpartHeading = '';
              }
            } else {
              var webpartHeading = '<h1>Functional Universities</h1>';
            }

            var itemsdata = items.d.results;
            thisContainer.append('<div class="container">' + webpartHeading + '<ul/></div>');
            var thiscontainer = thisContainer.find('ul');

            for (var i = 0; i < itemsdata.length; i++) {
              var thisTitle = itemsdata[i].Title;
              var thisEnabled = itemsdata[i].Enabled;
              var thisLinkURL = itemsdata[i].LinkURL;
              var thisComingSoon = itemsdata[i].ComingSoon;
              var newWindow = itemsdata[i].OpenLinkInNewWindow;

              if (thisEnabled) {
                if (thisComingSoon) {
                  thiscontainer.append('<li class="university-link"><span class="disabled"><span class="university-link-text">' + thisTitle + '<span class="coming-soon-text">Coming Soon</span></span></span></li>');
                } else {
                  if (newWindow) {
                    thiscontainer.append('<li class="university-link"><a href="' + thisLinkURL.Url + '" alt="' + thisTitle + '" target="_blank"><span class="university-link-text">' + thisTitle + '</span></a></li>');
                  } else {
                    thiscontainer.append('<li class="university-link"><a href="' + thisLinkURL.Url + '" alt="' + thisTitle + '"><span class="university-link-text">' + thisTitle + '</span></a></li>');
                  }
                }
              }
            }
          });
        }

        ;
      }); // load editor

      lists.editwebpart({
        trigger: settings.trigger,
        container: settings.container,
        contenttypeid: settings.contenttypeid
      });
    })(jQuery);
  }
};
"use strict";

module.exports = {
  // add any utility classes here
  loadExecuteRequestor: function loadExecuteRequestor() {
    ExecuteOrDelayUntilScriptLoaded(function () {
      var scriptbase = _spPageContextInfo.siteAbsoluteUrl + "/_layouts/15/";
      $.getScript(scriptbase + "SP.RequestExecutor.js", function () {
        utilities.logToConsole({
          message: "request executor is now loaded"
        });
      });
    }, "sp.js");
  },
  logToConsole: function logToConsole(options) {
    var settings = $.extend(true, {}, {
      message: ''
    });
    return console.log(settings.message);
  },
  responsiveImages: function responsiveImages(options) {
    var settings = $.extend(true, {}, {
      image: '.responsive-image'
    }, options);
    $(settings.image).each(function () {
      var thisParent = $(this).parent();
      var thisImage = $(this);
      var checkExist = setInterval(function () {
        if ($(thisImage).width() != 0 && thisParent.length != 0) {
          thisParent.addClass('responsive-image-container');
          var imageRatio = $(thisImage).width() / $(thisImage).height();
          var containerRatio = $(thisParent).width() / $(thisParent).height();

          if (imageRatio > containerRatio) {
            $(thisImage).width('auto').height('100%');
          } else {
            $(thisImage).width('100%').height('auto');
          }

          clearInterval(checkExist);
        }
      }, 100);
    });
  },
  showIfNotEmpty: function showIfNotEmpty(options) {
    var settings = $.extend(true, {}, {
      element: '',
      showElement: ''
    }, options);
    $(settings.element).each(function () {
      var thistext = $(this).text().trim();

      if (settings.showElement) {
        if (thistext.length > 0) {
          $(settings.showElement).show();
        }
      } else {
        if (thistext.length > 0) {
          $(this).show();
        }
      }
    });
  },
  siteBreadcrumb: function siteBreadcrumb() {
    var rootAbsolute = _spPageContextInfo.siteAbsoluteUrl;
    var rootRelative = _spPageContextInfo.siteServerRelativeUrl;
    var thisSite = _spPageContextInfo.webServerRelativeUrl;
    var thisSiteTitle = _spPageContextInfo.webTitle;
    var websArray = thisSite.replace(rootRelative + '/', '').split('/');
    websArray.pop();

    if (thisSite != rootRelative) {
      $('header h2.brand').addClass('university-brand');
      $('header .breadcrumb-title').append('<span class="breadcrumb-separator last-separator">&nbsp;/&nbsp;</span><span class="last-breadcrumb"><a href="' + thisSite + '">' + thisSiteTitle + '</a></span>');

      var _loop = function _loop() {
        var thisURL = rootAbsolute + '/' + websArray[i];
        $.ajax({
          type: 'GET',
          headers: {
            'accept': 'application/json;odata=verbose',
            "X-RequestDigest": bones.digest
          },
          url: thisURL + '/_api/web/title',
          success: function success(data) {
            var parentSiteTitle = data.d.Title;
            $('<span class="breadcrumb-separator">&nbsp;/&nbsp;</span><span class="breadcrumb-item"><a href="' + thisURL + '">' + parentSiteTitle + '</a></span>').insertBefore('.last-separator');
          }
        });
      };

      for (var i = 0; i < websArray.length; i++) {
        _loop();
      }
    }
  },
  scrollAction: function scrollAction() {
    var viewport = $(window);
    var body = $('body');
    var scrollbody = $('#s4-workspace');
    var wh = viewport.height();
    var st = wh / 4; // scroll

    scrollbody.on('scroll', function () {
      var t = $(this).scrollTop();

      if (t > st) {
        body.addClass('scroll-down');
      } else {
        body.removeClass('scroll-down');
      }
    });
    scrollbody.trigger('scroll');
    $('[data-scroll]').on('click', function (e) {
      e.preventDefault();
      var ribbonHeight = $('#suiteBarDelta').outerHeight() + $('#s4-ribbonrow').outerHeight();
      var contentOffset = $('#s4-bodyContainer').offset().top;
      var thisElement = $(this).attr('data-scroll');
      var scrolltolocation = $('.' + thisElement).offset().top - contentOffset - 73;
      $("#s4-workspace").stop().animate({
        scrollTop: scrolltolocation
      });
    });
  }
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuYWx5dGljc3UuanMiLCJhcHAuanMiLCJiYWhjYXJvdXNlbC5qcyIsImJvbmVzLmpzIiwiY2Fyb3VzZWwuanMiLCJlYW5kc3VwbGFucy5qcyIsImltYWdlbWFwLmpzIiwibGVhcm5pbmdwbGFucy5qcyIsImxpc3RzLmpzIiwibmV3cy5qcyIsInBhcnRuZXJzaGlwcy5qcyIsInJlc291cmNlcy5qcyIsInRhYmlmeS5qcyIsInRpbGVzLmpzIiwidW5pdmVyc2l0aWVzLmpzIiwidXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbImxpc3RzIiwid2luZG93IiwicmVxdWlyZSIsInV0aWxpdGllcyIsInJlc291cmNlSm9iRmFtaWx5IiwicmVzb3VyY2VGdW5jdGlvbmFsQ29tbXVuaXR5IiwiY29udGFpbmVyIiwidGhpc2NvbnRhaW5lciIsIiQiLCJyZXN1bHRzUGFyZW50Q29udGFpbmVyIiwicmVzdWx0c05hdmlnYXRpb25Db250YWluZXIiLCJyZXN1bHRzQ29udGFpbmVyIiwiZmlsdGVyUGFyZW50Q29udGFpbmVyIiwiZmlsdGVyQ29udGFpbmVyIiwibW9kdWxlIiwiZXhwb3J0cyIsImxvYWQiLCJhbmFseXRpY3N1IiwicmVzZXRXZWJQYXJ0IiwiYnVpbGRXZWJQYXJ0IiwiY2hlY2tFeGlzdCIsInNldEludGVydmFsIiwic2l6ZSIsImJ1aWxkUmVmaW5lbWVudCIsImZpbHRlclJlc3VsdHNCeUFscGhhYmV0IiwiZmlsdGVyUmVzdWx0c0J5UmVmaW5lbWVudCIsImVhY2giLCJ0aGlzSGVpZ2h0IiwiaGVpZ2h0IiwiYXR0ciIsImNzcyIsImNsaWNrIiwiZSIsInByZXZlbnREZWZhdWx0IiwiaGFzQ2xhc3MiLCJ0aGlzT3JpZ0hlaWdodCIsInBhcmVudCIsImZpbmQiLCJhbmltYXRlIiwicHJldiIsImhpZGUiLCJjbG9zZXN0Iiwic2hvdyIsIm9uIiwiaGFzaCIsImxvY2F0aW9uIiwicmVwbGFjZSIsImRlY29kZVVSSUNvbXBvbmVudCIsIl9hbHBoYWJldHMiLCJfcmVmaW5lbWVudHMiLCJfY29udGVudFJvd3MiLCJfY291bnQiLCJyZW1vdmVDbGFzcyIsImxlbmd0aCIsImFkZENsYXNzIiwicmVtb3ZlIiwiZmFkZUluIiwiYWN0aXZlRmlsdGVycyIsInNwbGl0IiwiaSIsInRoZXNlVGFncyIsInB1c2giLCJfY2VsbFRleHQiLCJtYXAiLCJpdGVtIiwidGV4dENvbnRlbnQiLCJ0aGlzQ29udGFpbnMiLCJldmVyeSIsInZhbCIsImluZGV4T2YiLCJhcnJheUxlbmd0aCIsImZpbHRlcml0ZW0iLCJhcHBlbmRUbyIsImNsZWFySW50ZXJ2YWwiLCJ0cmlnZ2VyIiwiYXBwZW5kIiwiYnVpbGRBbHBoYWJldCIsImdldExpc3RJdGVtcyIsImxpc3RuYW1lIiwiZmllbGRzIiwib3JkZXJieSIsIml0ZW1zIiwiaXRlbXNkYXRhIiwiZCIsInJlc3VsdHMiLCJ0aGlzVGl0bGUiLCJUaXRsZSIsInRoaXNEZXNjIiwiRGVzYyIsInRoaXNFbmFibGVkIiwiRW5hYmxlZCIsIm5ld1dpbmRvdyIsIk9wZW5MaW5rSW5OZXdXaW5kb3ciLCJjb3Vyc2VJRCIsImxldHRlciIsInRvTG93ZXJDYXNlIiwic3Vic3RyaW5nIiwiZmluYWxEZXNjcmlwdGlvbiIsInRoaXNUaXRsZUJ1aWxkIiwidW5kZWZpbmVkIiwiTGlua1VSTCIsInRoaXNVcmwiLCJzUGFyZW50IiwiSm9iRmFtaWx5IiwiRnVuY3Rpb25hbENvbW11bml0eSIsImNQYXJlbnQiLCJwcmVwZW5kIiwic29ydCIsImdldFVuaXF1ZVJlc3VsdHMiLCJmb3JFYWNoIiwiYWRkUmVmaW5lbWVudEl0ZW0iLCJ0YWciLCJpZCIsIm5leHQiLCJ2YWx1ZSIsInNsaWRlVXAiLCJzbGlkZURvd24iLCJjbGFzc0xpc3QiLCJ0b2dnbGUiLCJ0aGlzQWN0aXZlRmlsdGVyIiwiY29uY2F0IiwiYXJyIiwidW5pcXVlQXJyYXkiLCJmaWx0ZXIiLCJlbGVtIiwicG9zIiwiZW1wdHkiLCJib25lcyIsImNhcm91c2VsIiwicmVzb3VyY2VzIiwidW5pdmVyc2l0aWVzIiwibmV3cyIsImJhaGNhcm91c2VsIiwidGlsZXMiLCJwYXJ0bmVyc2hpcHMiLCJsZWFybmluZ3BsYW5zIiwidGFiaWZ5IiwiZWFuZHN1cGxhbnMiLCJpbWFnZW1hcCIsInNjcm9sbEFjdGlvbiIsImxvYWRFeGVjdXRlUmVxdWVzdG9yIiwibm90Iiwib3JpZ2luYWx3aWR0aCIsInJlc3BvbnNpdmVJbWFnZXMiLCJpbWFnZSIsInNob3dJZk5vdEVtcHR5IiwiZWxlbWVudCIsInNob3dFbGVtZW50Iiwic2l0ZUJyZWFkY3J1bWIiLCJzaXRldXJsIiwic2l0ZWNvbGxlY3Rpb24iLCJ1cmwiLCJyZWxhdGVkY29udGFpbmVyIiwidGhpc0xpbmtVUkwiLCJVcmwiLCJmb290ZXJjb250YWluZXIiLCJ0aGlzRGVzY3JpcHRpb24iLCJIVE1MRGVzY3JpcHRpb24iLCJ3aWR0aCIsInJlc2l6ZSIsImh0bWwiLCJ0ZXh0Iiwid2ViIiwicGFnZSIsImVkaXRtb2RlIiwiYWNjb3JkaW9uIiwiaGVpZ2h0U3R5bGUiLCJjb2xsYXBzaWJsZSIsImFjdGl2ZSIsIm9wdGlvbnMiLCJzZXR0aW5ncyIsImV4dGVuZCIsImNvbnRlbnR0eXBlaWQiLCJidWlsZHdlYnBhcnQiLCJ0aGlzQ29udGFpbmVyIiwidGhpc0lEIiwiSWQiLCJnZXRMaXN0RmllbGRWYWx1ZXNIVE1MIiwidGhpc0ltYWdlIiwiSGVyb0ltYWdlIiwidGhpc0ltYWdlU3JjIiwibG9vcCIsIm5hdmlnYXRpb24iLCJhdXRvcGxheSIsImVkaXR3ZWJwYXJ0IiwialF1ZXJ5IiwiZGlnZXN0IiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImhvc3QiLCJlbnYiLCJfc3BQYWdlQ29udGV4dEluZm8iLCJmYXJtIiwiZmFybUxhYmVsIiwibmFtZSIsInByb3RvY29sIiwibGlzdCIsImxpc3RJZCIsInRpdGxlIiwibGlzdFRpdGxlIiwibGlzdFVybCIsInBhZ2VJdGVtSWQiLCJsYW5ndWFnZSIsImN1cnJlbnRMYW5ndWFnZSIsInBoeXNpY2FsIiwic2VydmVyUmVxdWVzdFBhdGgiLCJzaXRlSWQiLCJyZWxhdGl2ZSIsInNpdGVTZXJ2ZXJSZWxhdGl2ZVVybCIsInNpdGVBYnNvbHV0ZVVybCIsInVzZXIiLCJ1c2VySWQiLCJrZXkiLCJzeXN0ZW1Vc2VyS2V5IiwidXNlckRpc3BsYXlOYW1lIiwid2ViSWQiLCJsb2dvIiwid2ViTG9nb1VybCIsIndlYlNlcnZlclJlbGF0aXZlVXJsIiwid2ViVGl0bGUiLCJ3ZWJBYnNvbHV0ZVVybCIsImZuIiwicGFnaW5nIiwiZGVsYXkiLCJidXR0b25zIiwicHJldmlvdXMiLCJtb3ZldGhyZXNob2xkIiwic3dpcGV0aHJlc2hvbGQiLCJvbmluaXQiLCJvbnVwZGF0ZSIsImRlc3Ryb3kiLCJ0aW1lciIsIm9wdGltdXNQcmltZSIsImJvZHkiLCJzdHlsZSIsInNoYWtlciIsImRhdGEiLCJjaGlsZHJlbiIsInVsIiwibmF2bGFiZWwiLCJidXR0b24iLCJwIiwic2xpZGV3aWR0aCIsImxpIiwicG9zaXRpb24iLCJ4IiwieSIsInNjcm9sbFRvcCIsInN0YXJ0IiwiTWF0aCIsImFicyIsImRpc3RhbmNlIiwiY2hhbmdlIiwiV2Via2l0VHJhbnNmb3JtIiwiTW96VHJhbnNmb3JtIiwidHJhbnNmb3JtIiwic2V0VGltZW91dCIsImNsZWFyVGltZW91dCIsInNsaWRlc2ludmlldyIsInJvdW5kIiwic2xpZGVzIiwicHJvcCIsIm5hdmxpc3QiLCJlcSIsImxlZnQiLCJyZW1vdmVEYXRhIiwib2ZmIiwicGFnZVgiLCJvcmlnaW5hbEV2ZW50IiwidG91Y2hlcyIsInRhcmdldCIsImlzIiwid2hpY2giLCJwYWdlWSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsIm1hdGNoIiwicmVzb3VyY2VDYXJlZXJUcmFjayIsIkNhcmVlclRyYWNrIiwidGhpc01hcCIsInRoaXNBcmVhIiwib3JpZ2luYWxDb29yZHMiLCJuZXdXaWR0aCIsInBhcnNlSW50IiwicGVyY2VudERpZmZlcmVuY2UiLCJuZXdDb29yZHMiLCJqb2luIiwicmVzb3VyY2VUeXBlVGFncyIsInJlc291cmNlQ29uY2VudHJhdGlvblRhZ3MiLCJpbmNsdWRlcyIsInByZXBlbmRUbyIsInRoaXNIVE1MIiwidGhpc0NvdXJzZUlEIiwiQ291cnNlSUQiLCJ0aGlzSFRNTHRleHQiLCJ0cmltIiwiUmVzb3VyY2VUeXBlIiwidGhpc1R5cGVBcnIiLCJqIiwidGhpc1R5cGUiLCJMYWJlbCIsIlJlc291cmNlQ29uY2VudHJhdGlvbiIsInRoaXNDb25jZW50cmF0aW9uQXJyIiwidGhpc0NvbmNlbnRyYXRpb24iLCJyZXNvdXJjZVR5cGUiLCJyZXNvdXJjZUNvbmNlbnRyYXRpb24iLCJzdWNjZXNzIiwiZXJyb3IiLCJvcmRlcmRpcmVjdGlvbiIsImV4cGFuZCIsImxpbWl0IiwiYWpheCIsInR5cGUiLCJoZWFkZXJzIiwiY3JlYXRlTGlzdHMiLCJsaXN0TmFtZSIsInNpdGVVcmwiLCJkZXNjcmlwdGlvbiIsImV4ZWN1dG9yIiwiU1AiLCJSZXF1ZXN0RXhlY3V0b3IiLCJleGVjdXRlQXN5bmMiLCJtZXRob2QiLCJzIiwiYSIsImVyck1zZyIsImFkZENvbnRlbnRUeXBlVG9MaXN0IiwiY29udGVudFR5cGVJZCIsIkpTT04iLCJzdHJpbmdpZnkiLCJnZXRJVEVNQ29udGVudFR5cGUiLCJyZW1vdmVDb250ZW50VHlwZUZyb21MaXN0IiwiY3JlYXRlTGlzdFdpdGhDb250ZW50VHlwZSIsImJ0biIsImZvcm0iLCJpbnB1dCIsImxpc3RleGVjdXRvciIsInN0YXR1c1RleHQiLCJjb250ZW50dHlwZWV4ZWN1dG9yIiwidGhpc0NUIiwicmVtb3ZlY29udGVudHR5cGVleGVjdXRvciIsIlN0cmluZ1ZhbHVlIiwic3RhdHVzIiwiYWRkQ29sdW1uVG9MaXN0IiwiZmllbGRUeXBlIiwiZmllbGRUaXRsZSIsImZpZWxkRGlzcGxheU5hbWUiLCJsb2FkdmlldyIsIndlYnBhcnQiLCJjb250YWluZXJjbGFzcyIsImFmdGVyIiwicmVtb3ZlQXR0ciIsImVkaXRCdG4iLCJvcGVuRGlhbG9nIiwiVUkiLCJNb2RhbERpYWxvZyIsInNob3dNb2RhbERpYWxvZyIsImF1dG9TaXplIiwiZGlhbG9nUmV0dXJuVmFsdWVDYWxsYmFjayIsInJlc3VsdCIsIkRpYWxvZ1Jlc3VsdCIsIk9LIiwiY2FuY2VsIiwicmVtb3ZlY29udGVudHR5cGVpZCIsImxvYWRlZGl0b3IiLCJjcmVhdGVCdG4iLCJyZW1vdmVDb250ZW50VHlwZUlkIiwidGhpc0V4Y2VycHQiLCJFeGNlcnB0IiwiQ2FsbFRvQWN0aW9uIiwidGhpc0J1dHRvblRleHQiLCJEZXNjcmlwdGlvbiIsInRoaXNCdXR0b25VcmwiLCJCQUhJbWFnZSIsImltYWdlUmF0aW8iLCJjb250YWluZXJSYXRpbyIsInBhcnRuZXJzaGlwVGFncyIsImNvbmNlbnRyYXRpb25UYWdzIiwidGVjaG5vbG9neVRhZ3MiLCJjZXJ0aWZpY2F0aW9uVGFncyIsImRlZ3JlZVRhZ3MiLCJQYXJ0bmVyc2hpcFR5cGUiLCJwYXJ0bmVyc2hpcFR5cGVBcnIiLCJ0aGlzUGFydG5lcnNoaXBUeXBlIiwiQ29uY2VudHJhdGlvbiIsIlRlY2hub2xvZ3kiLCJ0aGlzVGVjaG5vbG9neSIsIkNlcnRpZmljYXRpb24iLCJ0aGlzQ2VydGlmaWNhdGlvbiIsIkRlZ3JlZSIsInRoaXNEZWdyZWUiLCJwYXJ0bmVyc2hpcCIsImNvbmNlbnRyYXRpb24iLCJ0ZWNobm9sb2d5IiwiY2VydGlmaWNhdGlvbiIsImRlZ3JlZSIsIndlYnBhcnREZXNjcmlwdGlvbiIsIlRodW1ibmFpbEltYWdlIiwic2VsZWN0b3IiLCJlbmFibGVkIiwicGFuZWwiLCJoaWRldGl0bGVzIiwiY3NzY2xhc3MiLCJyZXZlcnNleiIsIm9uY2hhbmdlIiwidGFiQ29udGFpbmVycyIsImxhYmVsIiwidGl0bGV0ZXh0Iiwid2VicGFydFRpdGxlIiwid2VicGFydEhlYWRpbmciLCJ0aGlzQ29taW5nU29vbiIsIkNvbWluZ1Nvb24iLCJFeGVjdXRlT3JEZWxheVVudGlsU2NyaXB0TG9hZGVkIiwic2NyaXB0YmFzZSIsImdldFNjcmlwdCIsImxvZ1RvQ29uc29sZSIsIm1lc3NhZ2UiLCJjb25zb2xlIiwibG9nIiwidGhpc1BhcmVudCIsInRoaXN0ZXh0Iiwicm9vdEFic29sdXRlIiwicm9vdFJlbGF0aXZlIiwidGhpc1NpdGUiLCJ0aGlzU2l0ZVRpdGxlIiwid2Vic0FycmF5IiwicG9wIiwidGhpc1VSTCIsInBhcmVudFNpdGVUaXRsZSIsImluc2VydEJlZm9yZSIsInZpZXdwb3J0Iiwic2Nyb2xsYm9keSIsIndoIiwic3QiLCJ0IiwicmliYm9uSGVpZ2h0Iiwib3V0ZXJIZWlnaHQiLCJjb250ZW50T2Zmc2V0Iiwib2Zmc2V0IiwidG9wIiwidGhpc0VsZW1lbnQiLCJzY3JvbGx0b2xvY2F0aW9uIiwic3RvcCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFNQSxLQUFLLEdBQUdDLE1BQU0sQ0FBQ0QsS0FBUCxHQUFlRSxPQUFPLENBQUMsU0FBRCxDQUFwQzs7QUFDQSxJQUFNQyxTQUFTLEdBQUdGLE1BQU0sQ0FBQ0UsU0FBUCxHQUFtQkQsT0FBTyxDQUFDLGFBQUQsQ0FBNUM7O0FBRUEsSUFBSUUsaUJBQWlCLEdBQUcsRUFBeEI7QUFDQSxJQUFJQywyQkFBMkIsR0FBRyxFQUFsQztBQUVBLElBQUlDLFNBQVMsR0FBRywwQkFBaEI7QUFDQSxJQUFJQyxhQUFhLEdBQUdDLENBQUMsQ0FBQ0YsU0FBRCxDQUFyQjtBQUVBLElBQUlHLHNCQUFzQixHQUFHLCtCQUE3QjtBQUNBLElBQUlDLDBCQUEwQixHQUFHLGVBQWpDO0FBQ0EsSUFBSUMsZ0JBQWdCLEdBQUcsVUFBdkI7QUFDQSxJQUFJQyxxQkFBcUIsR0FBRyxnQkFBNUI7QUFDQSxJQUFJQyxlQUFlLEdBQUcsdUJBQXRCO0FBRUFDLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQjtBQUVmO0FBQ0FDLEVBQUFBLElBQUksRUFBRSxnQkFBVTtBQUVkQyxJQUFBQSxVQUFVLENBQUNDLFlBQVg7QUFDQUQsSUFBQUEsVUFBVSxDQUFDRSxZQUFYO0FBRUMsUUFBSUMsVUFBVSxHQUFHQyxXQUFXLENBQUMsWUFBVztBQUNyQyxVQUFHYixDQUFDLENBQUMsb0JB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Ujs7QUFDQSxVQUFHMkwsQ0FBQyxHQUFHRCxFQUFQLEVBQVU7QUFDVHhNLFFBQUFBLElBQUksQ0FBQ25MLFFBQUwsQ0FBYyxhQUFkO0FBQ0EsT0FGRCxNQUdJO0FBQ0htTCxRQUFBQSxJQUFJLENBQUNyTCxXQUFMLENBQWlCLGFBQWpCO0FBQ0E7QUFDRCxLQVJEO0FBU0EyWCxJQUFBQSxVQUFVLENBQUNyVyxPQUFYLENBQW1CLFFBQW5CO0FBRUFsRSxJQUFBQSxDQUFDLENBQUMsZUFBRCxDQUFELENBQW1CbUMsRUFBbkIsQ0FBc0IsT0FBdEIsRUFBOEIsVUFBU1gsQ0FBVCxFQUFXO0FBQ3ZDQSxNQUFBQSxDQUFDLENBQUNDLGNBQUY7QUFDQSxVQUFJa1osWUFBWSxHQUFHM2EsQ0FBQyxDQUFDLGdCQUFELENBQUQsQ0FBb0I0YSxXQUFwQixLQUFvQzVhLENBQUMsQ0FBQyxlQUFELENBQUQsQ0FBbUI0YSxXQUFuQixFQUF2RDtBQUNBLFVBQUlDLGFBQWEsR0FBRzdhLENBQUMsQ0FBQyxtQkFBRCxDQUFELENBQXVCOGEsTUFBdkIsR0FBZ0NDLEdBQXBEO0FBQ0EsVUFBSUMsV0FBVyxHQUFHaGIsQ0FBQyxDQUFDLElBQUQsQ0FBRCxDQUFRcUIsSUFBUixDQUFhLGFBQWIsQ0FBbEI7QUFDQSxVQUFJNFosZ0JBQWdCLEdBQUdqYixDQUFDLENBQUMsTUFBSWdiLFdBQUwsQ0FBRCxDQUFtQkYsTUFBbkIsR0FBNEJDLEdBQTVCLEdBQWtDRixhQUFsQyxHQUFrRCxFQUF6RTtBQUVBN2EsTUFBQUEsQ0FBQyxDQUFDLGVBQUQsQ0FBRCxDQUFtQmtiLElBQW5CLEdBQTBCcFosT0FBMUIsQ0FBa0M7QUFDOUJpTixRQUFBQSxTQUFTLEVBQUVrTTtBQURtQixPQUFsQztBQUlELEtBWEQ7QUFhRDtBQWpJYyxDQUFqQiIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBsaXN0cyA9IHdpbmRvdy5saXN0cyA9IHJlcXVpcmUoJy4vbGlzdHMnKTtcbmNvbnN0IHV0aWxpdGllcyA9IHdpbmRvdy51dGlsaXRpZXMgPSByZXF1aXJlKCcuL3V0aWxpdGllcycpO1xuXG52YXIgcmVzb3VyY2VKb2JGYW1pbHkgPSBbXTtcbnZhciByZXNvdXJjZUZ1bmN0aW9uYWxDb21tdW5pdHkgPSBbXTtcblxudmFyIGNvbnRhaW5lciA9ICcjbGVhcm5pbmdwbGFucy1jb250YWluZXInO1xudmFyIHRoaXNjb250YWluZXIgPSAkKGNvbnRhaW5lcik7XG5cbnZhciByZXN1bHRzUGFyZW50Q29udGFpbmVyID0gJy5sZWFybmluZ3BsYW5zLXJlc3VsdHMtY29sdW1uJztcbnZhciByZXN1bHRzTmF2aWdhdGlvbkNvbnRhaW5lciA9ICcuYWxwaGEtZmlsdGVyJztcbnZhciByZXN1bHRzQ29udGFpbmVyID0gJy5yZXN1bHRzJztcbnZhciBmaWx0ZXJQYXJlbnRDb250YWluZXIgPSAnLmZpbHRlci1jb2x1bW4nO1xudmFyIGZpbHRlckNvbnRhaW5lciA9ICcuZmlsdGVyLWdyb3VwLW9wdGlvbnMnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvLyBza2VsZXRvbiBjb2RlIGZvciB3ZWIgcGFydFxuICBsb2FkOiBmdW5jdGlvbigpe1xuXG4gICAgYW5hbHl0aWNzdS5yZXNldFdlYlBhcnQoKTtcbiAgICBhbmFseXRpY3N1LmJ1aWxkV2ViUGFydCgpO1xuXG4gICAgIHZhciBjaGVja0V4aXN0ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmKCQoJy5sZWFybmluZ3BsYW4taXRlbScpLnNpemUoKSAhPSAwKSB7XG4gICAgICAgICAgYW5hbHl0aWNzdS5idWlsZFJlZmluZW1lbnQoKTtcbiAgICAgICAgICBhbmFseXRpY3N1LmZpbHRlclJlc3VsdHNCeUFscGhhYmV0KCk7XG4gICAgICAgICAgYW5hbHl0aWNzdS5maWx0ZXJSZXN1bHRzQnlSZWZpbmVtZW50KCk7XG5cbiAgICAgICAgICAvLyBzYXZlIGRlc2Mgb3JpZ2luYWwgaGVpZ2h0cyBmb3IgYW5pbWF0aW9uXG4gICAgICAgICAgJCgnLnRyaW1tZWQnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgdGhpc0hlaWdodCA9ICQodGhpcykuaGVpZ2h0KCk7XG4gICAgICAgICAgICAkKHRoaXMpLmF0dHIoJ2RhdGEtaGVpZ2h0Jyx0aGlzSGVpZ2h0KTtcbiAgICAgICAgICAgICQodGhpcykuY3NzKCdoZWlnaHQnLCc5MHB4Jyk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBzaG93IG1vcmUgb3IgbGVzcyBmZWxsb3cgZGVzY3JpcHRpb25cbiAgICAgICAgICAkKCcuZGVzY3JpcHRpb24tdG9nZ2xlLWxpbmsnKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGlmKCQodGhpcykuaGFzQ2xhc3MoJ2Rlc2NyaXB0aW9uLW1vcmUtbGluaycpKXtcbiAgICAgICAgICAgICAgdmFyIHRoaXNPcmlnSGVpZ2h0ID0gJCh0aGlzKS5wYXJlbnQoKS5maW5kKCcudHJpbW1lZCcpLmF0dHIoJ2RhdGEtaGVpZ2h0Jyk7XG4gICAgICAgICAgICAgICQodGhpcykucGFyZW50KCkuZmluZCgnLnRyaW1tZWQnKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHRoaXNPcmlnSGVpZ2h0XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAkKHRoaXMpLnByZXYoKS5oaWRlKCk7XG4gICAgICAgICAgICAgICQodGhpcykuY3NzKCdvcGFjaXR5JywgJzAnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICQodGhpcykucGFyZW50KCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiA5MFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuZGVzY3JpcHRpb24nKS5maW5kKCcuZGVzY3JpcHRpb24tbW9yZS1saW5rJykuY3NzKCdvcGFjaXR5JywgJzEnKTtcbiAgICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuZGVzY3JpcHRpb24nKS5maW5kKCcuZGVzY3JpcHRpb24tb3ZlcmxheScpLnNob3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgLy8gaGFzaCBjaGFuZ2VcbiAgICAgICAgICAkKHdpbmRvdykub24oJ2hhc2hjaGFuZ2UnLCBmdW5jdGlvbihlKXtcblxuICAgICAgICAgICAgLy8gZ2V0IGhhc2hcbiAgICAgICAgICAgIHZhciBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcnKTtcbiAgICAgICAgICAgIGhhc2ggPSBkZWNvZGVVUklDb21wb25lbnQoaGFzaCk7XG5cbiAgICAgICAgICAgIHZhciBfYWxwaGFiZXRzID0gJCgnLmFscGhhYmV0ID4gdWwgPiBsaSA+IGEnKTtcbiAgICAgICAgICAgIHZhciBfcmVmaW5lbWVudHMgPSAkKCcuZmlsdGVyLWdyb3VwID4gdWwgPiBsaScpO1xuICAgICAgICAgICAgdmFyIF9jb250ZW50Um93cyA9ICQoJy5sZWFybmluZ3BsYW4taXRlbScpO1xuICAgICAgICAgICAgdmFyIF9jb3VudCA9IDA7XG5cbiAgICAgICAgICAgIF9jb250ZW50Um93cy5oaWRlKCk7XG5cbiAgICAgICAgICAgICQoJy5tb2JpbGUtYWxwaGEtbGlzdCcpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICQoJy5hbHBoYWJldCA+IHVsID4gbGkgPiBhJykucmVtb3ZlQ2xhc3MoJ21vYmlsZS1hY3RpdmUnKTtcblxuICAgICAgICAgICAgaWYoaGFzaC5sZW5ndGggPT09IDAgfHwgaGFzaCA9PT0gJ2FsbCcpIHtcbiAgICAgICAgICAgICAgX3JlZmluZW1lbnRzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgJCgnW2RhdGEtZmlsdGVyPVwiYWxsXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAkKCcuY291cnNlLWluZm8sIC5zZXJ2aWNlLWluZm8nKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgX2FscGhhYmV0cy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICQoJ1tkYXRhLWFscGhhPVwiYWxsXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICBfY29udGVudFJvd3MuZmFkZUluKDQwMCk7XG4gICAgICAgICAgICAgIF9jb3VudCA9IF9jb250ZW50Um93cy5zaXplKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZihoYXNoLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgICAgICAgICAgX3JlZmluZW1lbnRzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS1maWx0ZXI9XCJhbGxcIl0nKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgJCgnLmNvdXJzZS1pbmZvLCAuc2VydmljZS1pbmZvJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgX2FscGhhYmV0cy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtYWxwaGE9XCJhbGxcIl0nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtYWxwaGEtZmlsdGVyPVwiJytoYXNoKydcIl0nKS5mYWRlSW4oNDAwKTtcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS1hbHBoYT1cIicraGFzaCsnXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgIF9jb3VudCA9ICQoJ1tkYXRhLWFscGhhLWZpbHRlcj1cIicraGFzaCsnXCJdJykuc2l6ZSgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9hbHBoYWJldHMucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICQoJ1tkYXRhLWFscGhhPVwiYWxsXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgIF9yZWZpbmVtZW50cy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgJCgnLmNvdXJzZS1pbmZvLCAuc2VydmljZS1pbmZvJykucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBzdG9yZSBmaWx0ZXJzIGluIGFycmF5XG4gICAgICAgICAgICAgICAgdmFyIGFjdGl2ZUZpbHRlcnMgPSBoYXNoLnNwbGl0KCcsJyk7XG5cbiAgICAgICAgICAgICAgICAvLyBzaG93IHJlc3VsdHMgYmFzZWQgb24gYWN0aXZlIGZpbHRlciBhcnJheVxuICAgICAgICAgICAgICAgIF9jb250ZW50Um93cy5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICAgICAgICAgIHZhciB0aGVzZVRhZ3MgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcudGFncyBzcGFuJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICB0aGVzZVRhZ3MucHVzaCh0aGlzKTtcbiAgICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAgIHZhciBfY2VsbFRleHQgPSB0aGVzZVRhZ3MubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0udGV4dENvbnRlbnQ7XG4gICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICB2YXIgdGhpc0NvbnRhaW5zID0gYWN0aXZlRmlsdGVycy5ldmVyeShmdW5jdGlvbih2YWwpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2NlbGxUZXh0LmluZGV4T2YodmFsKSA+PSAwO1xuICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgIC8qZm9yICh2YXIgZmlsdGVyaXRlbSBvZiBhY3RpdmVGaWx0ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLWZpbHRlcj1cIicrZmlsdGVyaXRlbSsnXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgfSovXG5cbiAgICAgICAgICAgICAgICAgIHZhciBhcnJheUxlbmd0aCA9IGFjdGl2ZUZpbHRlcnMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheUxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmaWx0ZXJpdGVtID0gYWN0aXZlRmlsdGVyc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtZmlsdGVyPVwiJyArIGZpbHRlcml0ZW0gKyAnXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBpZih0aGlzQ29udGFpbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgX2NvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuZmFkZUluKDQwMCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJCgnLm5vLXJlc3VsdHMnKS5yZW1vdmUoKTtcblxuICAgICAgICAgICAgaWYoX2NvdW50ID09PSAwKXtcbiAgICAgICAgICAgICAgJCgnPGRpdiBjbGFzcz1cIm5vLXJlc3VsdHNcIj5UaGVyZSBhcmUgbm8gcmVzdWx0cy4gPGEgaHJlZj1cIiNcIj5WSUVXIEFMTDwvYT48L2Rpdj4nKS5hcHBlbmRUbygnLnJlc3VsdHMnKTtcbiAgICAgICAgICAgICAgJCgnLmNvdXJzZS1pbmZvLCAuc2VydmljZS1pbmZvJykucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgICAgJCgnLm5vLXJlc3VsdHMgYScpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBfY29udGVudFJvd3MuaGlkZSgpO1xuICAgICAgICAgICAgICAgIF9hbHBoYWJldHMucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgIF9yZWZpbmVtZW50cy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtYWxwaGE9XCJhbGxcIl0nKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtZmlsdGVyPVwiYWxsXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICAgICAgICAgX2NvbnRlbnRSb3dzLmZhZGVJbig0MDApO1xuICAgICAgICAgICAgICAgICQoJy5uby1yZXN1bHRzJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgdmFyIGhhc2ggPSAnI2FsbCc7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBoYXNoO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICBjbGVhckludGVydmFsKGNoZWNrRXhpc3QpO1xuXG4gICAgICAgICAkKHdpbmRvdykudHJpZ2dlcignaGFzaGNoYW5nZScpO1xuXG4gICAgICAgIH1cbiAgICAgfSwgMTAwKTtcblxuICB9LFxuICBidWlsZFdlYlBhcnQ6IGZ1bmN0aW9uIGJ1aWxkV2ViUGFydCgpXG4gIHtcbiAgICAgIC8vIFJlbmRlciBmaWx0ZXJpbmcgY29sdW1uXG4gICAgICB0aGlzY29udGFpbmVyLmFwcGVuZCgnPGRpdiBjbGFzcz1cImZpbHRlci10b2dnbGVcIj48aSBjbGFzcz1cImZhIGZhLWZpbHRlclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48c3BhbiBjbGFzcz1cInRleHRcIj5GaWx0ZXI8L3NwYW4+PC9kaXY+PGRpdiBjbGFzcz1cImZpbHRlci1jb2x1bW4gY29sLW1kLTNcIj48L2Rpdj4nKTtcblxuICAgICAgLy8gUmVuZGVyIHJlc3VsdHMgY29sdW1uXG4gICAgICB0aGlzY29udGFpbmVyLmFwcGVuZCgnPGRpdiBjbGFzcz1cImxlYXJuaW5ncGxhbnMtcmVzdWx0cy1jb2x1bW4gY29sLW1kLTlcIj4nKTtcbiAgICAgICAgICAvLyBSZW5kZXIgYWxwaGFiZXQgbmF2aWdhdGlvblxuICAgICAgICAgICQocmVzdWx0c1BhcmVudENvbnRhaW5lcikuYXBwZW5kKCc8ZGl2IGNsYXNzPVwiYWxwaGEtZmlsdGVyXCI+Jyk7XG5cbiAgICAgICAgICAgIGFuYWx5dGljc3UuYnVpbGRBbHBoYWJldCgpO1xuXG4gICAgICAgICAgJChyZXN1bHRzUGFyZW50Q29udGFpbmVyKS5hcHBlbmQoJzwvZGl2PjxkaXYgY2xhc3M9XCJyb3cgbm8tZ3V0dGVyIGluZm8tY29udGFpbmVyXCI+PC9kaXY+Jyk7XG4gICAgICAgICAgLy8gUmVuZGVyIHJlc3VsdHMgcGFuZWxcbiAgICAgICAgICAkKHJlc3VsdHNQYXJlbnRDb250YWluZXIpLmFwcGVuZCgnPGRpdiBjbGFzcz1cInJlc3VsdHNcIj4nKTtcblxuICAgICAgICAgICAgLy8gUmVuZGVyIHJlc3VsdHNcbiAgICAgICAgICAgIGxpc3RzLmdldExpc3RJdGVtcyh7XG4gICAgICAgICAgICAgIGxpc3RuYW1lOiAnQW5hbHl0aWNzVSBQbGFucycsIC8vbGlzdG5hbWUsXG4gICAgICAgICAgICAgIGZpZWxkczogJ1RpdGxlLERlc2MsRW5hYmxlZCxMaW5rVVJMLE9wZW5MaW5rSW5OZXdXaW5kb3csSm9iRmFtaWx5LEZ1bmN0aW9uYWxDb21tdW5pdHknLFxuICAgICAgICAgICAgICBvcmRlcmJ5OiAnVGl0bGUnXG4gICAgICAgICAgICB9LGZ1bmN0aW9uKGl0ZW1zKXtcbiAgICAgICAgICAgICAgdmFyIGl0ZW1zZGF0YSA9IGl0ZW1zLmQucmVzdWx0cztcbiAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtc2RhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgdGhpc1RpdGxlID0gaXRlbXNkYXRhW2ldLlRpdGxlO1xuICAgICAgICAgICAgICAgIHZhciB0aGlzRGVzYyA9IGl0ZW1zZGF0YVtpXS5EZXNjO1xuICAgICAgICAgICAgICAgIHZhciB0aGlzRW5hYmxlZCA9IGl0ZW1zZGF0YVtpXS5FbmFibGVkO1xuICAgICAgICAgICAgICAgIHZhciBuZXdXaW5kb3cgPSBpdGVtc2RhdGFbaV0uT3BlbkxpbmtJbk5ld1dpbmRvdztcbiAgICAgICAgICAgICAgICB2YXIgY291cnNlSUQgPSAnJztcblxuICAgICAgICAgICAgICAgIHZhciBsZXR0ZXIgPSB0aGlzVGl0bGUudG9Mb3dlckNhc2UoKS5zdWJzdHJpbmcoMCwxKTtcbiAgICAgICAgICAgICAgICB2YXIgZmluYWxEZXNjcmlwdGlvbiA9ICcnO1xuICAgICAgICAgICAgICAgIHZhciB0aGlzVGl0bGVCdWlsZCA9ICc8ZGl2IGNsYXNzPVwidGl0bGVcIj4nK3RoaXNUaXRsZSsnPC9kaXY+JztcblxuICAgICAgICAgICAgICAgIGlmKHRoaXNEZXNjICE9IHVuZGVmaW5lZCB8fCB0aGlzRGVzYyAhPSBudWxsKXtcbiAgICAgICAgICAgICAgICAgIGZpbmFsRGVzY3JpcHRpb24gPSAnPGRpdiBjbGFzcz1cImRlc2NyaXB0aW9uXCI+Jyt0aGlzRGVzYysnPC9kaXY+JztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzRW5hYmxlZCl7XG5cbiAgICAgICAgICAgICAgICAgIGlmKGl0ZW1zZGF0YVtpXS5MaW5rVVJMICE9IG51bGwgJiYgaXRlbXNkYXRhW2ldLkxpbmtVUkwgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGlzVXJsID0gaXRlbXNkYXRhW2ldLkxpbmtVUkw7XG4gICAgICAgICAgICAgICAgICAgIGlmKG5ld1dpbmRvdyl7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpc1RpdGxlQnVpbGQgPSAnPGRpdiBjbGFzcz1cInRpdGxlXCI+PGEgaHJlZj1cIicgKyB0aGlzVXJsICsgJ1wiIGNsYXNzPVwibGVhcm5pbmdwbGFuLXRpdGxlXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JyArIHRoaXNUaXRsZSArICc8L2E+PC9kaXY+J1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXNUaXRsZUJ1aWxkID0gJzxkaXYgY2xhc3M9XCJ0aXRsZVwiPjxhIGhyZWY9XCInICsgdGhpc1VybCArICdcIiBjbGFzcz1cImxlYXJuaW5ncGxhbi10aXRsZVwiPicgKyB0aGlzVGl0bGUgKyAnPC9hPjwvZGl2PidcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICB2YXIgc1BhcmVudCA9ICc8ZGl2IGNsYXNzPVwibGVhcm5pbmdwbGFuLWl0ZW1cIiBkYXRhLWFscGhhLWZpbHRlcj1cIicrbGV0dGVyKydcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgdGhpc1RpdGxlQnVpbGQgK1xuICAgICAgICAgICAgICAgICAgICBjb3Vyc2VJRCArXG4gICAgICAgICAgICAgICAgICAgIGZpbmFsRGVzY3JpcHRpb24gK1xuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInRhZ3NcIj4nO1xuICAgICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gJyc7XG5cbiAgICAgICAgICAgICAgICAgIC8vZmlsdGVyIGRhdGFcblxuICAgICAgICAgICAgICAgICAgaWYoaXRlbXNkYXRhW2ldLkpvYkZhbWlseSAmJiBpdGVtc2RhdGFbaV0uSm9iRmFtaWx5Lmxlbmd0aClcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbXMgKz0gJzxzcGFuIGNsYXNzPVwiSm9iRmFtaWx5XCI+JyArIGl0ZW1zZGF0YVtpXS5Kb2JGYW1pbHkgKyAnPC9zcGFuPic7XG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlSm9iRmFtaWx5LnB1c2goaXRlbXNkYXRhW2ldLkpvYkZhbWlseSk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGlmKGl0ZW1zZGF0YVtpXS5GdW5jdGlvbmFsQ29tbXVuaXR5ICYmIGl0ZW1zZGF0YVtpXS5GdW5jdGlvbmFsQ29tbXVuaXR5Lmxlbmd0aClcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbXMgKz0gJzxzcGFuIGNsYXNzPVwiRnVuY3Rpb25hbENvbW11bml0eVwiPicgKyBpdGVtc2RhdGFbaV0uRnVuY3Rpb25hbENvbW11bml0eSArICc8L3NwYW4+JztcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VGdW5jdGlvbmFsQ29tbXVuaXR5LnB1c2goaXRlbXNkYXRhW2ldLkZ1bmN0aW9uYWxDb21tdW5pdHkpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICB2YXIgY1BhcmVudCA9ICc8L2Rpdj48L2Rpdj4nO1xuXG4gICAgICAgICAgICAgICAgICAkKHJlc3VsdHNDb250YWluZXIpLmFwcGVuZChzUGFyZW50ICsgaXRlbXMgKyBjUGFyZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgJChyZXN1bHRzUGFyZW50Q29udGFpbmVyKS5hcHBlbmQoJzwvZGl2PicpO1xuICAgICAgdGhpc2NvbnRhaW5lci5hcHBlbmQoJzwvZGl2PicpO1xuICB9LFxuICBidWlsZEFscGhhYmV0OiBmdW5jdGlvbiBidWlsZEFscGhhYmV0KClcbiAge1xuICAgICQocmVzdWx0c05hdmlnYXRpb25Db250YWluZXIpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImFscGhhYmV0XCI+JyArXG4gICAgICAnPHVsPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImFsbFwiIGNsYXNzPVwiYWN0aXZlXCI+QWxsPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiYVwiPkE8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJiXCI+QjwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImNcIj5DPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiZFwiPkQ8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJlXCI+RTwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImZcIj5GPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiZ1wiPkc8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJoXCI+SDwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImlcIj5JPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwialwiPko8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJrXCI+SzwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImxcIj5MPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwibVwiPk08L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJuXCI+TjwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cIm9cIj5PPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwicFwiPlA8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJxXCI+UTwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInJcIj5SPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwic1wiPlM8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ0XCI+VDwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInVcIj5VPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwidlwiPlY8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ3XCI+VzwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInhcIj5YPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwieVwiPlk8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ6XCI+WjwvYT48L2xpPicgK1xuICAgICAgJzwvdWw+JyArXG4gICAgICAnPC9kaXY+Jyk7XG4gICAgICAkKCcjbGVhcm5pbmdwbGFucy1jb250YWluZXInKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiYWxwaGEtZmlsdGVyXCI+PGRpdiBjbGFzcz1cImFscGhhYmV0IG1vYmlsZS1hbHBoYWJldFwiPjxkaXYgY2xhc3M9XCJtb2JpbGUtYWxwaGEtdHJpZ2dlclwiPjxzcGFuIGNsYXNzPVwiYXJyb3dcIj48aSBjbGFzcz1cImZhIGZhLWFuZ2xlLWRvd25cIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+PC9zcGFuPjwvZGl2PicgK1xuICAgICAgICAnPHVsIGNsYXNzPVwibW9iaWxlLWFscGhhLWxpc3RcIj4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImFsbFwiIGNsYXNzPVwiYWN0aXZlXCI+QWxsPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJhXCI+QTwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiYlwiPkI8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImNcIj5DPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJkXCI+RDwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiZVwiPkU8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImZcIj5GPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJnXCI+RzwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiaFwiPkg8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImlcIj5JPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJqXCI+SjwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwia1wiPks8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImxcIj5MPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJtXCI+TTwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiblwiPk48L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cIm9cIj5PPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJwXCI+UDwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwicVwiPlE8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInJcIj5SPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJzXCI+UzwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwidFwiPlQ8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInVcIj5VPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ2XCI+VjwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwid1wiPlc8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInhcIj5YPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ5XCI+WTwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwielwiPlo8L2E+PC9saT4nICtcbiAgICAgICAgJzwvdWw+JyArXG4gICAgICAgICc8L2Rpdj48L2Rpdj4nKTtcbiAgfSxcbiAgYnVpbGRSZWZpbmVtZW50OiBmdW5jdGlvbiBidWlsZFJlZmluZW1lbnQoKVxuICB7XG5cbiAgICByZXNvdXJjZUpvYkZhbWlseS5zb3J0KCk7XG4gICAgcmVzb3VyY2VGdW5jdGlvbmFsQ29tbXVuaXR5LnNvcnQoKTtcblxuICAgICQoZmlsdGVyUGFyZW50Q29udGFpbmVyKS5hcHBlbmQoJzxkaXYgaWQ9XCJhbGwtZmlsdGVyXCIgY2xhc3M9XCJmaWx0ZXItZ3JvdXBcIiBjbGFzcz1cIm9wZW5lZFwiPicgK1xuICAgICAgJzx1bCBjbGFzcz1cImZpbHRlci1ncm91cC1vcHRpb25zXCI+PGxpIGRhdGEtZmlsdGVyPVwiYWxsXCIgY2xhc3M9XCJhY3RpdmVcIj48ZGl2IGNsYXNzPVwiZmlsdGVyLWNoZWNrYm94XCI+PC9kaXY+PGRpdiBjbGFzcz1cImZpbHRlci10aXRsZVwiPlZJRVcgQUxMPC9kaXY+PC9saT48L3VsPjwvZGl2PicpO1xuXG4gICAgJChmaWx0ZXJQYXJlbnRDb250YWluZXIpLmFwcGVuZCgnPGRpdiBpZD1cImpvYi1mYW1pbHlcIiBjbGFzcz1cImZpbHRlci1ncm91cFwiIGNsYXNzPVwib3BlbmVkXCI+JyArXG4gICAgICAnPGgzIGNsYXNzPVwiZmlsdGVyLWdyb3VwLXRpdGxlXCI+Sm9iIEZhbWlseTwvaDM+JyArXG4gICAgICAgICc8dWwgY2xhc3M9XCJmaWx0ZXItZ3JvdXAtb3B0aW9uc1wiPicpO1xuICAgICAgICBhbmFseXRpY3N1LmdldFVuaXF1ZVJlc3VsdHMocmVzb3VyY2VKb2JGYW1pbHkpLmZvckVhY2goZnVuY3Rpb24oSm9iRmFtaWx5KSB7XG4gICAgICAgICAgYW5hbHl0aWNzdS5hZGRSZWZpbmVtZW50SXRlbShKb2JGYW1pbHksICdqb2ItZmFtaWx5Jyk7XG4gICAgICAgIH0pO1xuICAgICQoZmlsdGVyUGFyZW50Q29udGFpbmVyKS5hcHBlbmQoJzwvdWw+PC9kaXY+Jyk7XG5cbiAgICAgICQoZmlsdGVyUGFyZW50Q29udGFpbmVyKS5hcHBlbmQoJzxkaXYgaWQ9XCJmdW5jdGlvbmFsLWNvbW11bml0eVwiIGNsYXNzPVwiZmlsdGVyLWdyb3VwXCIgY2xhc3M9XCJvcGVuZWRcIj4nICtcbiAgICAgICAgJzxoMyBjbGFzcz1cImZpbHRlci1ncm91cC10aXRsZVwiPkZ1bmN0aW9uYWwgQ29tbXVuaXR5PC9oMz4nICtcbiAgICAgICAgICAnPHVsIGNsYXNzPVwiZmlsdGVyLWdyb3VwLW9wdGlvbnNcIj4nKTtcbiAgICAgICAgICBhbmFseXRpY3N1LmdldFVuaXF1ZVJlc3VsdHMocmVzb3VyY2VGdW5jdGlvbmFsQ29tbXVuaXR5KS5mb3JFYWNoKGZ1bmN0aW9uKEZ1bmN0aW9uYWxDb21tdW5pdHkpIHtcbiAgICAgICAgICAgIGFuYWx5dGljc3UuYWRkUmVmaW5lbWVudEl0ZW0oRnVuY3Rpb25hbENvbW11bml0eSwgJ2Z1bmN0aW9uYWwtY29tbXVuaXR5Jyk7XG4gICAgICAgICAgfSk7XG4gICAgICAkKGZpbHRlclBhcmVudENvbnRhaW5lcikuYXBwZW5kKCc8L3VsPjwvZGl2PicpO1xuXG4gIH0sXG4gIGFkZFJlZmluZW1lbnRJdGVtOiBmdW5jdGlvbiBhZGRSZWZpbmVtZW50SXRlbSh0YWcsIGlkKVxuICB7XG4gICAgJCgnIycgKyBpZCArICc+IHVsJykuYXBwZW5kKCc8bGkgZGF0YS1maWx0ZXI9XCInICsgdGFnICsgJ1wiPicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJmaWx0ZXItY2hlY2tib3hcIj48L2Rpdj4nICtcbiAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJmaWx0ZXItdGl0bGVcIj4nICsgdGFnICsgJzwvZGl2PicgK1xuICAgICAgICAgICc8L2xpPicpO1xuICB9LFxuICBmaWx0ZXJSZXN1bHRzQnlBbHBoYWJldDogZnVuY3Rpb24gZmlsdGVyUmVzdWx0c0J5QWxwaGFiZXQoKSB7XG5cbiAgICAkKCcubW9iaWxlLWFscGhhLXRyaWdnZXInKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgJCgnLm1vYmlsZS1hbHBoYS1saXN0JykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgJCh0aGlzKS5uZXh0KCkuZmluZCgnYScpLmFkZENsYXNzKCdtb2JpbGUtYWN0aXZlJyk7XG4gICAgfSlcblxuICAgIHZhciBfYWxwaGFiZXRzID0gJCgnLmFscGhhYmV0ID4gdWwgPiBsaSA+IGEnKTtcblxuICAgIF9hbHBoYWJldHMuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgdmFsdWUgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtYWxwaGEnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgdmFyIGhhc2ggPSAnIycgKyB2YWx1ZTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gaGFzaDtcbiAgICB9KTtcbiAgfSxcbiAgZmlsdGVyUmVzdWx0c0J5UmVmaW5lbWVudDogZnVuY3Rpb24gZmlsdGVyUmVzdWx0c0J5UmVmaW5lbWVudCgpIHtcblxuICAgICQoJy5maWx0ZXItdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oKXtcbiAgICAgIGlmKCQodGhpcykuaGFzQ2xhc3MoJ2FjdGl2ZScpKSB7XG4gICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAkKCcuZmlsdGVyLWNvbHVtbicpLnNsaWRlVXAoNDAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAkKCcuZmlsdGVyLWNvbHVtbicpLnNsaWRlRG93big0MDApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIF9yZWZpbmVtZW50cyA9ICQoJy5maWx0ZXItZ3JvdXAgPiB1bCA+IGxpJyk7XG5cbiAgICBfcmVmaW5lbWVudHMuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdmFsdWUgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtZmlsdGVyJykudG9Mb3dlckNhc2UoKTtcbiAgICAgIHZhciBhY3RpdmVGaWx0ZXJzID0gJ2FsbCc7XG5cbiAgICAgIGlmKHZhbHVlICE9ICdhbGwnKSB7XG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJyk7XG4gICAgICAgICQoJ1tkYXRhLWZpbHRlcj1cImFsbFwiXScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgYWN0aXZlRmlsdGVycyA9ICcnO1xuXG4gICAgICAgIC8vIHN0b3JlIGFueSByZW1haW5pbmcgYWN0aXZlIGZpbHRlcnMgaW4gYXJyYXlcbiAgICAgICAgICAgICQoJ1tkYXRhLWZpbHRlcl0uYWN0aXZlJykuZWFjaChmdW5jdGlvbihpKXtcbiAgICAgICAgICAgICAgdmFyIHRoaXNBY3RpdmVGaWx0ZXIgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtZmlsdGVyJyk7XG4gICAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICBhY3RpdmVGaWx0ZXJzID0gYWN0aXZlRmlsdGVycy5jb25jYXQoXCIsXCIgKyB0aGlzQWN0aXZlRmlsdGVyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhY3RpdmVGaWx0ZXJzID0gYWN0aXZlRmlsdGVycy5jb25jYXQodGhpc0FjdGl2ZUZpbHRlcik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAvLyBlczYgbWV0aG9kIGFjdGl2ZUZpbHRlcnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWZpbHRlcl0uYWN0aXZlJykpLm1hcChpdGVtID0+IGl0ZW0uZGF0YXNldC5maWx0ZXIpO1xuICAgICAgICB9XG5cbiAgICAgIHZhciBoYXNoID0gJyMnICsgYWN0aXZlRmlsdGVycztcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gaGFzaDtcbiAgICB9KTtcbiAgfSxcbiAgZ2V0VW5pcXVlUmVzdWx0czogZnVuY3Rpb24gZ2V0VW5pcXVlUmVzdWx0cyhhcnIpXG4gIHtcbiAgICB2YXIgdW5pcXVlQXJyYXkgPSBhcnIuZmlsdGVyKGZ1bmN0aW9uKGVsZW0sIHBvcywgYXJyKSB7XG4gICAgICByZXR1cm4gYXJyLmluZGV4T2YoZWxlbSkgPT0gcG9zO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHVuaXF1ZUFycmF5O1xuICB9LFxuICByZXNldFdlYlBhcnQ6IGZ1bmN0aW9uIHJlc2V0V2ViUGFydCgpXG4gIHtcbiAgICB2YXIgY29udGFpbmVyID0gJyNsZWFybmluZ3BsYW5zLWNvbnRhaW5lcic7XG4gICAgdmFyIHRoaXNjb250YWluZXIgPSAkKGNvbnRhaW5lcik7XG4gICAgdGhpc2NvbnRhaW5lci5lbXB0eSgpO1xuICB9XG59XG4iLCIvKipcbiAqXG4gKiBQbGFjZSB5b3VyIGN1c3RvbSBKYXZhU2NyaXB0IGludG8gdGhpcyBmaWxlLlxuICpcbiAqIFNQQm9uZXMgdXNlcyBFUzYgSmF2YVNjcmlwdCwgd2hpY2ggaXMgY29tcGlsZWQgZG93biB0byBjbGllbnQtcmVhZHkgRVM1IGJ5XG4gKiBydW5uaW5nIHRoZSBpbmNsdWRlZCBHdWxwIFByb3BlbGxlciBzY3JpcHQuXG4gKlxuICovXG5cbi8vIGJvbmVzXG5jb25zdCBib25lcyA9IHdpbmRvdy5ib25lcyA9IHJlcXVpcmUoJy4vYm9uZXMnKVxuXG4vL2NvbnN0IGxpc3RzID0gd2luZG93Lmxpc3RzID0gcmVxdWlyZSgnLi9saXN0LWZ1bmN0aW9ucycpO1xuY29uc3QgbGlzdHMgPSB3aW5kb3cubGlzdHMgPSByZXF1aXJlKCcuL2xpc3RzJylcblxuLy91dGlsaXRpZXNcbmNvbnN0IHV0aWxpdGllcyA9IHdpbmRvdy51dGlsaXRpZXMgPSByZXF1aXJlKCcuL3V0aWxpdGllcycpXG5cbi8vY2Fyb3VzZWxcbiQuY2Fyb3VzZWwgPSByZXF1aXJlKCcuL2Nhcm91c2VsJykuY2Fyb3VzZWxcblxuLy8gbG9hZCB3ZWIgcGFydHNcbmNvbnN0IHJlc291cmNlcyA9IHdpbmRvdy5yZXNvdXJjZXMgPSByZXF1aXJlKCcuL3Jlc291cmNlcycpXG5jb25zdCB1bml2ZXJzaXRpZXMgPSB3aW5kb3cudW5pdmVyc2l0aWVzID0gcmVxdWlyZSgnLi91bml2ZXJzaXRpZXMnKVxuY29uc3QgbmV3cyA9IHdpbmRvdy5uZXdzID0gcmVxdWlyZSgnLi9uZXdzJylcbmNvbnN0IGJhaGNhcm91c2VsID0gd2luZG93LmJhaGNhcm91c2VsID0gcmVxdWlyZSgnLi9iYWhjYXJvdXNlbCcpXG5jb25zdCB0aWxlcyA9IHdpbmRvdy50aWxlcyA9IHJlcXVpcmUoJy4vdGlsZXMnKVxuY29uc3QgcGFydG5lcnNoaXBzID0gd2luZG93LnBhcnRuZXJzaGlwcyA9IHJlcXVpcmUoJy4vcGFydG5lcnNoaXBzJylcbmNvbnN0IGxlYXJuaW5ncGxhbnMgPSB3aW5kb3cubGVhcm5pbmdwbGFucyA9IHJlcXVpcmUoJy4vbGVhcm5pbmdwbGFucycpXG5jb25zdCB0YWJpZnkgPSB3aW5kb3cudGFiaWZ5ID0gcmVxdWlyZSgnLi90YWJpZnknKVxuY29uc3QgZWFuZHN1cGxhbnMgPSB3aW5kb3cuZWFuZHN1cGxhbnMgPSByZXF1aXJlKCcuL2VhbmRzdXBsYW5zJylcbmNvbnN0IGFuYWx5dGljc3UgPSB3aW5kb3cuYW5hbHl0aWNzdSA9IHJlcXVpcmUoJy4vYW5hbHl0aWNzdScpXG5cbi8vIHJlc3BvbnNpdmUgaW1hZ2UgbWFwXG5jb25zdCBpbWFnZW1hcCA9IHdpbmRvdy5pbWFnZW1hcCA9IHJlcXVpcmUoJy4vaW1hZ2VtYXAnKVxuXG4vLyBpcyBzY3JvbGxlZFxudXRpbGl0aWVzLnNjcm9sbEFjdGlvbigpXG5cbi8vIGxvYWQgU1AuZXhlY3V0b3JcbnV0aWxpdGllcy5sb2FkRXhlY3V0ZVJlcXVlc3RvcigpXG5cbi8vIHJlc291cmNlc1xuaWYoJCgnLndwLXJlc291cmNlcycpLnNpemUoKSA+IDApe1xuICByZXNvdXJjZXMubG9hZCgpXG59XG5cbi8vIHVuaXZlcnNpdGllc1xuaWYoJCgnLndwLXVuaXZlcnNpdGllcycpLnNpemUoKSA+IDApe1xuICB1bml2ZXJzaXRpZXMubG9hZCgpXG59XG5cbi8vIG5ld3MgY2Fyb3VzZWxcbmlmKCQoJy53cC1uZXdzJykuc2l6ZSgpID4gMCl7XG4gIG5ld3MubG9hZCgpXG59XG5cbi8vIGhlcm8gY2Fyb3VzZWxcbmlmKCQoJy53cC1jYXJvdXNlbCcpLnNpemUoKSA+IDApe1xuICBiYWhjYXJvdXNlbC5sb2FkKClcbn1cblxuLy8gdGlsZXNcbmlmKCQoJy53cC10aWxlcycpLnNpemUoKSA+IDApe1xuICB0aWxlcy5sb2FkKClcbn1cblxuLy8gcGFydG5lcnNoaXBzXG5pZigkKCcud3AtcGFydG5lcnNoaXBzJykuc2l6ZSgpID4gMCl7XG4gIHBhcnRuZXJzaGlwcy5sb2FkKClcbn1cblxuLy8gTGVhcm5pbmcgUGxhbnNcbmlmKCQoJy53cC1sZWFybmluZ3BsYW5zJykubm90KCcjd3AtZWFuZHN1cGxhbnMnKS5ub3QoJyN3cC1hbmFseXRpY3N1Jykuc2l6ZSgpID4gMCl7XG4gIGxlYXJuaW5ncGxhbnMubG9hZCgpXG59XG5cbi8vIEVhbmRTVSBQbGFuc1xuaWYoJCgnI3dwLWVhbmRzdXBsYW5zJykuc2l6ZSgpID4gMCl7XG4gIGVhbmRzdXBsYW5zLmxvYWQoKVxufVxuXG4vLyBBbmFseXRpY3NVIFBsYW5zXG5pZigkKCcjd3AtYW5hbHl0aWNzdScpLnNpemUoKSA+IDApe1xuICBhbmFseXRpY3N1LmxvYWQoKVxufVxuXG4vLyB0YWJpZnlcbiQoJy53cC10YWJzJykudGFiaWZ5KClcblxuXG4vLyBpbWFnZSBtYXBzXG5pZigkKCcudHJpYW5nbGUtY29udGFpbmVyJykuc2l6ZSgpID4gMCl7XG4gIGltYWdlbWFwLmxvYWQoe1xuICAgIGNvbnRhaW5lcjogJy50cmlhbmdsZS1jb250YWluZXInLFxuICAgIG9yaWdpbmFsd2lkdGg6IDE2MDBcbiAgfSlcbn1cblxuLy8gcmVzcG9uc2l2ZSBpbWFnZXNcbnV0aWxpdGllcy5yZXNwb25zaXZlSW1hZ2VzKClcbnV0aWxpdGllcy5yZXNwb25zaXZlSW1hZ2VzKHtcbiAgaW1hZ2U6ICcuaGVyby1pbWFnZSBpbWcnXG59KVxuXG4vLyBzaG93IGlmIG5vdCBlbXB0eVxudXRpbGl0aWVzLnNob3dJZk5vdEVtcHR5KHtcbiAgZWxlbWVudDogJy5ncmV5LWJhci10ZXh0IC5tcy1ydGVzdGF0ZS1maWVsZCcsXG4gIHNob3dFbGVtZW50OiAnLmdyZXktY29udGFpbmVyJ1xufSlcbnV0aWxpdGllcy5zaG93SWZOb3RFbXB0eSh7XG4gIGVsZW1lbnQ6ICcuZ3JleS1iYXItem9uZScsXG4gIHNob3dFbGVtZW50OiAnLmdyZXktY29udGFpbmVyJ1xufSlcbnV0aWxpdGllcy5zaG93SWZOb3RFbXB0eSh7XG4gIGVsZW1lbnQ6ICdhc2lkZScsXG4gIHNob3dFbGVtZW50OiAnYXNpZGUnXG59KVxuXG4vLyBibHVyIG1lbnVcbi8qXG4kKGRvY3VtZW50KS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgaWYoISQoZS50YXJnZXQpLmlzKCcjdG9nZ2xlbWVudScpKXtcbiAgICAkKCcjdG9nZ2xlbWVudScpLnRyaWdnZXIoJ2NsaWNrJyk7XG4gIH1cbn0pO1xuKi9cblxuLy8gYnJlYWRjcnVtYiBuYXZcbnV0aWxpdGllcy5zaXRlQnJlYWRjcnVtYigpXG5cbi8vcmVsYXRlZCBzaXRlc1xubGlzdHMuZ2V0TGlzdEl0ZW1zKHtcbiAgbGlzdG5hbWU6ICdSZWxhdGVkIFNpdGVzJyxcbiAgc2l0ZXVybDogYm9uZXMuc2l0ZWNvbGxlY3Rpb24udXJsLFxuICBmaWVsZHM6ICdUaXRsZSxFbmFibGVkLExpbmtVUkwsU29ydE9yZGVyLE9wZW5MaW5rSW5OZXdXaW5kb3cnLFxuICBvcmRlcmJ5OiAnU29ydE9yZGVyJ1xufSwgZnVuY3Rpb24oaXRlbXMpe1xuICB2YXIgaXRlbXNkYXRhID0gaXRlbXMuZC5yZXN1bHRzXG4gIHZhciByZWxhdGVkY29udGFpbmVyID0gJCgnI3JlbGF0ZWQtc2l0ZXMnKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIHZhciB0aGlzVGl0bGUgPSBpdGVtc2RhdGFbaV0uVGl0bGVcbiAgICB2YXIgdGhpc0VuYWJsZWQgPSBpdGVtc2RhdGFbaV0uRW5hYmxlZFxuICAgIHZhciB0aGlzTGlua1VSTCA9IGl0ZW1zZGF0YVtpXS5MaW5rVVJMXG4gICAgdmFyIG5ld1dpbmRvdyA9IGl0ZW1zZGF0YVtpXS5PcGVuTGlua0luTmV3V2luZG93XG5cbiAgICBpZih0aGlzRW5hYmxlZCl7XG4gICAgICBpZihuZXdXaW5kb3cpe1xuICAgICAgICByZWxhdGVkY29udGFpbmVyLmFwcGVuZCgnPGRpdiBjbGFzcz1cInJlbGF0ZWQtc2l0ZS1saW5rXCI+PGEgaHJlZj1cIicrdGhpc0xpbmtVUkwuVXJsKydcIiBhbHQ9XCInK3RoaXNUaXRsZSsnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+Jyt0aGlzVGl0bGUrJzwvYT48L2Rpdj4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVsYXRlZGNvbnRhaW5lci5hcHBlbmQoJzxkaXYgY2xhc3M9XCJyZWxhdGVkLXNpdGUtbGlua1wiPjxhIGhyZWY9XCInK3RoaXNMaW5rVVJMLlVybCsnXCIgYWx0PVwiJyt0aGlzVGl0bGUrJ1wiPicrdGhpc1RpdGxlKyc8L2E+PC9kaXY+JylcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG5cbi8vZm9vdGVyIGNvbnRhY3QgaW5mb1xubGlzdHMuZ2V0TGlzdEl0ZW1zKHtcbiAgbGlzdG5hbWU6ICdGb290ZXIgQ29udGFjdCBJbmZvJyxcbiAgc2l0ZXVybDogYm9uZXMuc2l0ZWNvbGxlY3Rpb24udXJsLFxuICBmaWVsZHM6ICdUaXRsZSxIVE1MRGVzY3JpcHRpb24sU29ydE9yZGVyJyxcbiAgb3JkZXJieTogJ1NvcnRPcmRlcidcbn0sIGZ1bmN0aW9uKGl0ZW1zKXtcbiAgdmFyIGl0ZW1zZGF0YSA9IGl0ZW1zLmQucmVzdWx0c1xuICB2YXIgZm9vdGVyY29udGFpbmVyID0gJCgnLmZvb3Rlci1jb250YWN0LWluZm8nKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIHZhciB0aGlzVGl0bGUgPSBpdGVtc2RhdGFbaV0uVGl0bGVcbiAgICB2YXIgdGhpc0Rlc2NyaXB0aW9uID0gaXRlbXNkYXRhW2ldLkhUTUxEZXNjcmlwdGlvblxuXG4gICAgZm9vdGVyY29udGFpbmVyLmFwcGVuZCgnPGRpdiBjbGFzcz1cImZvb3Rlci1jb250YWN0LWl0ZW1cIj48aDQgY2xhc3M9XCJmb290ZXItaW5mby1oZWFkaW5nXCI+Jyt0aGlzVGl0bGUrJzwvaDQ+PGRpdiBjbGFzcz1cImluZm9cIj4nK3RoaXNEZXNjcmlwdGlvbisnPC9kaXY+PC9kaXY+JylcbiAgfVxufSlcblxuLy9mb290ZXIgYm90dG9tIGxpbmtzXG5saXN0cy5nZXRMaXN0SXRlbXMoe1xuICBsaXN0bmFtZTogJ0Zvb3RlciBCb3R0b20gTGlua3MnLFxuICBzaXRldXJsOiBib25lcy5zaXRlY29sbGVjdGlvbi51cmwsXG4gIGZpZWxkczogJ1RpdGxlLEVuYWJsZWQsTGlua1VSTCxTb3J0T3JkZXInLFxuICBvcmRlcmJ5OiAnU29ydE9yZGVyJ1xufSwgZnVuY3Rpb24oaXRlbXMpe1xuICB2YXIgaXRlbXNkYXRhID0gaXRlbXMuZC5yZXN1bHRzXG4gIHZhciByZWxhdGVkY29udGFpbmVyID0gJCgnLmZvb3Rlci1ib3R0b20tY29udGFpbmVyJylcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtc2RhdGEubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdGhpc1RpdGxlID0gaXRlbXNkYXRhW2ldLlRpdGxlXG4gICAgdmFyIHRoaXNFbmFibGVkID0gaXRlbXNkYXRhW2ldLkVuYWJsZWRcbiAgICB2YXIgdGhpc0xpbmtVUkwgPSBpdGVtc2RhdGFbaV0uTGlua1VSTFxuXG4gICAgaWYodGhpc0VuYWJsZWQpe1xuICAgICAgcmVsYXRlZGNvbnRhaW5lci5hcHBlbmQoJzxhIGhyZWY9XCInK3RoaXNMaW5rVVJMLlVybCsnXCIgYWx0PVwiJyt0aGlzVGl0bGUrJ1wiPicrdGhpc1RpdGxlKyc8L2E+JylcbiAgICB9XG4gIH1cbn0pXG5cbi8vIHNjcm9sbGluZyBpc3N1ZSByZXNvbHZlZCAtIG5vIHJpYmJvbi9zdWl0ZWJhciBwcm9ibGVtc1xuJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKXtcbiAgaWYoJCgnI3M0LXJpYmJvbnJvdycpLnNpemUoKT09MCl7XG4gICAgJCgnI3M0LXdvcmtzcGFjZScpLmhlaWdodCgkKHdpbmRvdykuaGVpZ2h0KCkpLndpZHRoKCQod2luZG93KS53aWR0aCgpKS5hZGRDbGFzcygnbm8tcmliYm9uJylcbiAgfVxufSlcbiQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKXtcbiAgaWYoJCgnI3M0LXJpYmJvbnJvdycpLnNpemUoKT09MCl7XG4gICAgJCgnI3M0LXdvcmtzcGFjZScpLmhlaWdodCgkKHdpbmRvdykuaGVpZ2h0KCkpLndpZHRoKCQod2luZG93KS53aWR0aCgpKS5hZGRDbGFzcygnbm8tcmliYm9uJylcbiAgfVxufSlcblxuLy8gcGFnZSB0aXRsZSBodG1sXG4kKCcuaGVyby10ZXh0LWNvbnRlbnQnKS5odG1sKCQoJy5oZXJvLXRleHQtY29udGVudCcpLnRleHQoKSkuY3NzKCdkaXNwbGF5JywnYmxvY2snKVxuXG4vLyBnbG9iYWwgbmF2IGxpbmtzIG9wZW4gaW4gbmV3IHdpbmRvd1xuJCgnaGVhZGVyIG5hdiBhOm5vdChbaHJlZl49XCInK2JvbmVzLndlYi51cmwrJ1wiXSk6bm90KFtocmVmXj1cIi9cIl0pJykuYXR0cigndGFyZ2V0JywnX2JsYW5rJylcblxuLy8gYWNjb3JkaW9uc1xuaWYoIWJvbmVzLnBhZ2UuZWRpdG1vZGUpe1xuICAkKCcuYmFoLWFjY29yZGlvbicpLmFjY29yZGlvbih7XG4gICAgaGVpZ2h0U3R5bGU6ICdjb250ZW50JyxcbiAgICBjb2xsYXBzaWJsZTogdHJ1ZSxcbiAgICBhY3RpdmU6IGZhbHNlXG4gIH0pLmNsb3Nlc3QoJy5tcy13ZWJwYXJ0em9uZS1jZWxsJykuYWRkQ2xhc3MoJ3dwLWFjY29yZGlvbi1jZWxsJylcbn1cblxuLy8gU0FNUExFOiBjcmVhdGUgbGlzdCB0aGVuIGFkZCBjb250ZW50IHR5cGUgLSBUZXN0IENvZGVcbi8vIGxpc3RzLmNyZWF0ZUxpc3RXaXRoQ29udGVudFR5cGUoe1xuLy8gICBsaXN0bmFtZTogJ1NhbXBsZSBMaXN0Jyxcbi8vICAgc2l0ZXVybDogYm9uZXMuc2l0ZWNvbGxlY3Rpb24udXJsLFxuLy8gICBkZXNjcmlwdGlvbjogJ1NhbXBsZSBMaXN0IHVzaW5nIEpTT00nLFxuLy8gICBjb250ZW50VHlwZUlkOiAnMHgwMTAwMkUyRjA0RTREREVDMDc0Nzk1NDIwMzVGRTNFNzY1MTQnXG4vLyB9KTtcblxuLy8gU0FNUExFOiBjYWxsaW5nIGVhY2ggZnVuY3Rpb24gc2VwZXJhdGx5XG4vLyBsaXN0cy5jcmVhdGVMaXN0cyh7XG4vLyAgIGxpc3RuYW1lOiAnU2FtcGxlIExpc3QnLFxuLy8gICBzaXRldXJsOiBib25lcy5zaXRlY29sbGVjdGlvbi51cmwsXG4vLyAgIGRlc2NyaXB0aW9uOiAnU2FtcGxlIExpc3QgdXNpbmcgSlNPTSdcbi8vIH0pO1xuLy8gLy8gdGltZW91dCB0byBhbGxvdyBsaXN0IHRvIGJlIGNyZWF0ZWQgcmVhZHkgdG8gdXBkYXRlXG4vLyBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4vLyAgIGxpc3RzLmFkZENvbnRlbnRUeXBlVG9MaXN0KHtcbi8vICAgICBsaXN0bmFtZTogJ1NhbXBsZSBMaXN0Jyxcbi8vICAgICBzaXRldXJsOiBib25lcy5zaXRlY29sbGVjdGlvbi51cmwsXG4vLyAgICAgY29udGVudFR5cGVJZDogJzB4MDEwMDJFMkYwNEU0RERFQzA3NDc5NTQyMDM1RkUzRTc2NTE0J1xuLy8gICB9KTtcbi8vIH0sIDUwMDApO1xuIiwiY29uc3QgbGlzdHMgPSB3aW5kb3cubGlzdHMgPSByZXF1aXJlKCcuL2xpc3RzJylcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gc2tlbGV0b24gY29kZSBmb3Igd2ViIHBhcnRcbiAgbG9hZDogZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgbGV0IHNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sIHtcbiAgICAgIHRyaWdnZXI6ICcud3AtY2Fyb3VzZWwnLFxuICAgICAgY29udGFpbmVyOiAnLmNhcm91c2VsLWNvbnRhaW5lcicsXG4gICAgICBjb250ZW50dHlwZWlkOiAnMHgwMTAwMTVGOTUwQzI3NEIwN0U0MzgzRUMxM0I4NkVBRTUyRjQnIC8vIEJBSCBDYXJvdXNlbFxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgKGZ1bmN0aW9uKCQpe1xuXG4gICAgICBsaXN0cy5idWlsZHdlYnBhcnQoe1xuICAgICAgICB0cmlnZ2VyOiBzZXR0aW5ncy50cmlnZ2VyLFxuICAgICAgICBjb250YWluZXI6IHNldHRpbmdzLmNvbnRhaW5lclxuICAgICAgfSlcblxuICAgICAgJChzZXR0aW5ncy5jb250YWluZXIpLmVhY2goZnVuY3Rpb24oKXtcblxuICAgICAgICB2YXIgdGhpc0NvbnRhaW5lciA9ICQodGhpcylcblxuICAgICAgICAvLyByZW1vdmUgYW55IHByZXZpb3VzbHktZmV0Y2hlZCBpdGVtc1xuICAgICAgICB0aGlzQ29udGFpbmVyLmZpbmQoJ3VsJykucmVtb3ZlKClcblxuICAgICAgICAvLyBnZXQgbGlzdCBuYW1lXG4gICAgICAgIHZhciBsaXN0bmFtZSA9IHRoaXNDb250YWluZXIuY2xvc2VzdCgnLm1zLXdlYnBhcnR6b25lLWNlbGwnKS5maW5kKHNldHRpbmdzLnRyaWdnZXIpLmF0dHIoJ2RhdGEtbGlzdCcpXG5cbiAgICAgICAgLy8gZ2V0IGxpc3QgaXRlbXNcbiAgICAgICAgaWYoIWJvbmVzLnBhZ2UuZWRpdG1vZGUpe1xuICAgICAgICAgIGxpc3RzLmdldExpc3RJdGVtcyh7XG4gICAgICAgICAgICBsaXN0bmFtZTogbGlzdG5hbWUsXG4gICAgICAgICAgICBmaWVsZHM6ICdUaXRsZSxFbmFibGVkLFNvcnRPcmRlcixJZCcsXG4gICAgICAgICAgICBvcmRlcmJ5OiAnU29ydE9yZGVyJ1xuICAgICAgICAgIH0sZnVuY3Rpb24oaXRlbXMpe1xuICAgICAgICAgICAgdmFyIGl0ZW1zZGF0YSA9IGl0ZW1zLmQucmVzdWx0c1xuICAgICAgICAgICAgdGhpc0NvbnRhaW5lci5hcHBlbmQoJzx1bC8+JylcbiAgICAgICAgICAgIHZhciB0aGlzY29udGFpbmVyID0gdGhpc0NvbnRhaW5lci5maW5kKCd1bCcpXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICB2YXIgdGhpc1RpdGxlID0gaXRlbXNkYXRhW2ldLlRpdGxlXG4gICAgICAgICAgICAgIHZhciB0aGlzRW5hYmxlZCA9IGl0ZW1zZGF0YVtpXS5FbmFibGVkXG4gICAgICAgICAgICAgIHZhciB0aGlzSUQgPSBpdGVtc2RhdGFbaV0uSWRcblxuICAgICAgICAgICAgICBpZih0aGlzRW5hYmxlZCl7XG4gICAgICAgICAgICAgICAgdGhpc2NvbnRhaW5lci5hcHBlbmQoJzxsaSBjbGFzcz1cImNhcm91c2VsLXNsaWRlIHJvdyBuby1ndXR0ZXJcIj48ZGl2IGNsYXNzPVwiaGVyby1pbWFnZSBjYXJvdXNlbC1pbWFnZS0nK3RoaXNJRCsnXCI+PC9kaXY+PGRpdiBjbGFzcz1cImhlcm8tdGV4dFwiPjxzcGFuIGNsYXNzPVwiaGVyby10ZXh0LXBsdXNlc1wiPjxzcGFuIGNsYXNzPVwiaGVyby10ZXh0LWNvbnRlbnQgaGVyby10ZXh0LWNvbnRlbnQtJyt0aGlzSUQrJ1wiPicrdGhpc1RpdGxlKyc8L3NwYW4+PC9zcGFuPjwvZGl2PjwvbGk+JylcbiAgICAgICAgICAgICAgICAkKCcuaGVyby10ZXh0LWNvbnRlbnQtJyt0aGlzSUQpLmh0bWwoJCgnLmhlcm8tdGV4dC1jb250ZW50LScrdGhpc0lEKS50ZXh0KCkpLmNzcygnZGlzcGxheScsJ2Jsb2NrJylcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGxpc3RzLmdldExpc3RGaWVsZFZhbHVlc0hUTUwoe1xuICAgICAgICAgICAgICAgIGxpc3RuYW1lOiBsaXN0bmFtZSxcbiAgICAgICAgICAgICAgICBmaWVsZHM6ICdIZXJvSW1hZ2UnLFxuICAgICAgICAgICAgICAgIGlkOiB0aGlzSURcbiAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZmllbGRzLGlkKXtcbiAgICAgICAgICAgICAgICB2YXIgdGhpc0ltYWdlID0gZmllbGRzLmQuSGVyb0ltYWdlXG5cbiAgICAgICAgICAgICAgICB2YXIgY2hlY2tFeGlzdCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgaWYoJCh0aGlzSW1hZ2UpWzBdLndpZHRoICE9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNJbWFnZVNyYyA9ICQodGhpc0ltYWdlKS5hdHRyKCdzcmMnKVxuICAgICAgICAgICAgICAgICAgICB0aGlzQ29udGFpbmVyLmZpbmQoJy5jYXJvdXNlbC1pbWFnZS0nK2lkKS5jc3MoJ2Nzc1RleHQnLCdiYWNrZ3JvdW5kLWltYWdlOnVybCgnK3RoaXNJbWFnZVNyYysnKScpXG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoY2hlY2tFeGlzdClcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAxMDApXG5cbiAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkKHNldHRpbmdzLmNvbnRhaW5lcikuY2Fyb3VzZWwoe1xuICAgICAgICAgICAgICBsb29wOiB0cnVlLFxuICAgICAgICAgICAgICBuYXZpZ2F0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICBhdXRvcGxheTogdHJ1ZVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8vIGxvYWQgZWRpdG9yXG4gICAgICBsaXN0cy5lZGl0d2VicGFydCh7XG4gICAgICAgIHRyaWdnZXI6IHNldHRpbmdzLnRyaWdnZXIsXG4gICAgICAgIGNvbnRhaW5lcjogc2V0dGluZ3MuY29udGFpbmVyLFxuICAgICAgICBjb250ZW50dHlwZWlkOiBzZXR0aW5ncy5jb250ZW50dHlwZWlkXG4gICAgICB9KVxuXG4gICAgfShqUXVlcnkpKVxuICB9XG59XG4iLCIvKipcbiAqXG4gKiBTUEJvbmVzIHYyLjAgfCBNSVQgTGljZW5zZSB8IGh0dHBzOi8vZ2l0aHViLmNvbS9vbGRyaXZlcmNyZWF0aXZlL3NwYm9uZXNcbiAqIFxuICogQ3JlYXRlIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGltcG9ydGFudCBpbmZvcm1hdGlvbiByZWdhcmRpbmcgdGhlIGN1cnJlbnRcbiAqIFNoYXJlUG9pbnQgc2l0ZSwgd2ViLCBwYWdlLCBhbmQgdXNlci4gVGhpcyBvYmplY3QgaXMgZXNwZWNpYWxseSB1c2VmdWwgd2hlblxuICogYnVpbGRpbmcgUkVTVCBhcHBsaWNhdGlvbnMgYW5kIHdlYiBwYXJ0cy5cbiAqXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gZm9ybSBkaWdlc3RcbiAgZGlnZXN0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnX19SRVFVRVNURElHRVNUJykudmFsdWUsXG5cbiAgLy8gY3VycmVudCBob3N0XG4gIGhvc3Q6IHtcbiAgICBlbnY6IF9zcFBhZ2VDb250ZXh0SW5mby5lbnYsXG4gICAgZmFybTogX3NwUGFnZUNvbnRleHRJbmZvLmZhcm1MYWJlbCxcbiAgICBuYW1lOiB3aW5kb3cubG9jYXRpb24uaG9zdCxcbiAgICBwcm90b2NvbDogd2luZG93LmxvY2F0aW9uLnByb3RvY29sLFxuICAgIHVybDogd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0LFxuICB9LFxuXG4gIC8vIGN1cnJlbnQgbGlzdFxuICBsaXN0OiB7XG4gICAgaWQ6IF9zcFBhZ2VDb250ZXh0SW5mby5saXN0SWQsXG4gICAgdGl0bGU6IF9zcFBhZ2VDb250ZXh0SW5mby5saXN0VGl0bGUsXG4gICAgdXJsOiBfc3BQYWdlQ29udGV4dEluZm8ubGlzdFVybCxcbiAgfSxcblxuICAvLyBjdXJyZW50IHBhZ2VcbiAgcGFnZToge1xuICAgIGVkaXRtb2RlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnTVNPTGF5b3V0X0luRGVzaWduTW9kZScpLnZhbHVlID09ICcxJyxcbiAgICBpZDogX3NwUGFnZUNvbnRleHRJbmZvLnBhZ2VJdGVtSWQsXG4gICAgbGFuZ3VhZ2U6IF9zcFBhZ2VDb250ZXh0SW5mby5jdXJyZW50TGFuZ3VhZ2UsXG4gICAgcGh5c2ljYWw6IF9zcFBhZ2VDb250ZXh0SW5mby5zZXJ2ZXJSZXF1ZXN0UGF0aCxcbiAgICB0aXRsZTogZG9jdW1lbnQudGl0bGUsXG4gIH0sXG5cbiAgLy8gY3VycmVudCBzaXRlIGNvbGxlY3Rpb25cbiAgc2l0ZWNvbGxlY3Rpb246IHtcbiAgICBpZDogX3NwUGFnZUNvbnRleHRJbmZvLnNpdGVJZCxcbiAgICByZWxhdGl2ZTogX3NwUGFnZUNvbnRleHRJbmZvLnNpdGVTZXJ2ZXJSZWxhdGl2ZVVybC5yZXBsYWNlKC9eXFwvfFxcLyQvZywgJycpLFxuICAgIHVybDogX3NwUGFnZUNvbnRleHRJbmZvLnNpdGVBYnNvbHV0ZVVybC5yZXBsYWNlKC9eXFwvfFxcLyQvZywgJycpLFxuICB9LFxuXG4gIC8vIGN1cnJlbnQgdXNlclxuICB1c2VyOiB7XG4gICAgaWQ6IF9zcFBhZ2VDb250ZXh0SW5mby51c2VySWQsXG4gICAga2V5OiBfc3BQYWdlQ29udGV4dEluZm8uc3lzdGVtVXNlcktleSxcbiAgICBuYW1lOiBfc3BQYWdlQ29udGV4dEluZm8udXNlckRpc3BsYXlOYW1lLFxuICB9LFxuXG4gIC8vIGN1cnJlbnQgd2ViXG4gIHdlYjoge1xuICAgIGlkOiBfc3BQYWdlQ29udGV4dEluZm8ud2ViSWQsXG4gICAgbG9nbzogX3NwUGFnZUNvbnRleHRJbmZvLndlYkxvZ29VcmwsXG4gICAgcmVsYXRpdmU6IF9zcFBhZ2VDb250ZXh0SW5mby53ZWJTZXJ2ZXJSZWxhdGl2ZVVybC5yZXBsYWNlKC9eXFwvfFxcLyQvZywgJycpLFxuICAgIHRpdGxlOiBfc3BQYWdlQ29udGV4dEluZm8ud2ViVGl0bGUsXG4gICAgdXJsOiBfc3BQYWdlQ29udGV4dEluZm8ud2ViQWJzb2x1dGVVcmwucmVwbGFjZSgvXlxcL3xcXC8kL2csICcnKSxcbiAgfSxcblxufTtcbiIsIi8qISBjYXJvdXNlbC5qcyB2MS4wIHwgTUlUIExpY2Vuc2UgfCBodHRwczovL2dpdGh1Yi5jb20vb2xkcml2ZXJjcmVhdGl2ZS9jYXJvdXNlbCAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNhcm91c2VsOihmdW5jdGlvbigkKXtcbiAgICAkLmZuLmNhcm91c2VsID0gZnVuY3Rpb24ob3B0aW9ucyl7XG5cbiAgICAvLyBzZXR0aW5nc1xuICAgIHZhciBzZXR0aW5ncyA9ICQuZXh0ZW5kKHt9LCB7XG4gICAgICBwYWdpbmc6IGZhbHNlLFxuICAgICAgbmF2aWdhdGlvbjogZmFsc2UsXG4gICAgICBsb29wOiBmYWxzZSxcbiAgICAgIGF1dG9wbGF5OiBmYWxzZSxcbiAgICAgIGRlbGF5OiAxMjAwMCxcbiAgICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgcHJldmlvdXM6ICdQcmV2aW91cycsXG4gICAgICAgIG5leHQ6ICdOZXh0JyxcbiAgICAgICAgbmF2aWdhdGlvbjogJyVpJ1xuICAgICAgfSxcbiAgICAgIG1vdmV0aHJlc2hvbGQ6IDEwLFxuICAgICAgc3dpcGV0aHJlc2hvbGQ6IDEwLFxuICAgICAgb25pbml0OiBmYWxzZSxcbiAgICAgIG9udXBkYXRlOiBmYWxzZSxcbiAgICAgIGRlc3Ryb3k6IGZhbHNlXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICAvLyBhdXRvcGxheSB0aW1lclxuICAgIHZhciB0aW1lciA9IGZhbHNlO1xuXG4gICAgLy8gdHJhbnNmb3JtP1xuICAgIHdpbmRvdy5vcHRpbXVzUHJpbWUgPSBmYWxzZTtcbiAgICBpZignV2Via2l0VHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlIHx8ICdNb3pUcmFuc2Zvcm0nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUgfHwgJ3RyYW5zZm9ybScgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSl7XG4gICAgICB3aW5kb3cub3B0aW11c1ByaW1lID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBjYXJvdXNlbFxuICAgIHRoaXMuZWFjaChmdW5jdGlvbigpe1xuXG4gICAgICAvLyBnZXQgb2JqZWN0c1xuICAgICAgdmFyIGNhcm91c2VsID0gJCh0aGlzKTtcbiAgICAgIHZhciBzaGFrZXIgPSBjYXJvdXNlbC5maW5kKCd1bDplcSgwKScpO1xuXG4gICAgICAvLyBkZXN0cm95P1xuICAgICAgaWYoc2V0dGluZ3MuZGVzdHJveSl7XG4gICAgICAgIGNhcm91c2VsLnRyaWdnZXIoJ2Nhcm91c2VsLWRlc3Ryb3knKTtcbiAgICAgIH1cblxuICAgICAgLy8gY3JlYXRlXG4gICAgICBlbHNlIHtcblxuICAgICAgICAvLyBpbml0XG4gICAgICAgIGNhcm91c2VsLm9uKCdjYXJvdXNlbC1pbml0JywgZnVuY3Rpb24oKXtcblxuICAgICAgICAgIC8vIGRhdGFcbiAgICAgICAgICBjYXJvdXNlbC5kYXRhKCdjYXJvdXNlbC1wb3NpdGlvbicsIDApO1xuICAgICAgICAgIGNhcm91c2VsLmRhdGEoJ2Nhcm91c2VsLXRvdWNoLWNoYW5nZScsIDApO1xuICAgICAgICAgIGNhcm91c2VsLmRhdGEoJ2Nhcm91c2VsLWxhc3QtdG91Y2gnLCBmYWxzZSk7XG4gICAgICAgICAgY2Fyb3VzZWwuZGF0YSgnY2Fyb3VzZWwtaXRlbS1jb3VudCcsIHNoYWtlci5jaGlsZHJlbigpLnNpemUoKSk7XG5cbiAgICAgICAgICAvLyBhZGQgY2xhc3Nlc1xuICAgICAgICAgIGNhcm91c2VsLmFkZENsYXNzKCd1aS1jYXJvdXNlbCcpO1xuICAgICAgICAgIHNoYWtlci5hZGRDbGFzcygndWktY2Fyb3VzZWwtc2hha2VyJyk7XG5cbiAgICAgICAgICAvLyBwYWdpbmc/XG4gICAgICAgICAgaWYoc2V0dGluZ3MucGFnaW5nKXtcblxuICAgICAgICAgICAgLy8gcHJldmlvdXNcbiAgICAgICAgICAgIHZhciBwcmV2aW91cyA9ICQoJzxidXR0b24gY2xhc3M9XCJwcmV2aW91c1wiPjxzcGFuPicgKyBzZXR0aW5ncy5idXR0b25zLnByZXZpb3VzICsgJzwvc3Bhbj48L2J1dHRvbj4nKTtcbiAgICAgICAgICAgIHByZXZpb3VzLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgLy8gbm90IGEgdG91Y2ggZ2VzdHVyZVxuICAgICAgICAgICAgICBjYXJvdXNlbC5kYXRhKCdjYXJvdXNlbC1sYXN0LXRvdWNoJywgZmFsc2UpO1xuXG4gICAgICAgICAgICAgIC8vIHJldHJlYXRcbiAgICAgICAgICAgICAgY2Fyb3VzZWwudHJpZ2dlcignY2Fyb3VzZWwtcmV0cmVhdCcpO1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhcm91c2VsLmFwcGVuZChwcmV2aW91cyk7XG5cbiAgICAgICAgICAgIC8vIG5leHRcbiAgICAgICAgICAgIHZhciBuZXh0ID0gJCgnPGJ1dHRvbiBjbGFzcz1cIm5leHRcIj48c3Bhbj4nICsgc2V0dGluZ3MuYnV0dG9ucy5uZXh0ICsgJzwvc3Bhbj48L2J1dHRvbj4nKTtcbiAgICAgICAgICAgIG5leHQub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAvLyBub3QgYSB0b3VjaCBnZXN0dXJlXG4gICAgICAgICAgICAgIGNhcm91c2VsLmRhdGEoJ2Nhcm91c2VsLWxhc3QtdG91Y2gnLCBmYWxzZSk7XG5cbiAgICAgICAgICAgICAgLy8gYWR2YW5jZVxuICAgICAgICAgICAgICBjYXJvdXNlbC50cmlnZ2VyKCdjYXJvdXNlbC1hZHZhbmNlJyk7XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2Fyb3VzZWwuYXBwZW5kKG5leHQpO1xuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gbmF2aWdhdGlvbj9cbiAgICAgICAgICBpZihzZXR0aW5ncy5uYXZpZ2F0aW9uKXtcblxuICAgICAgICAgICAgLy8gbmF2IGxpc3RcbiAgICAgICAgICAgIHZhciB1bCA9ICQoJzx1bCBjbGFzcz1cInVpLWNhcm91c2VsLW5hdlwiLz4nKTtcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBjYXJvdXNlbC5kYXRhKCdjYXJvdXNlbC1pdGVtLWNvdW50Jyk7IGkrKyl7XG5cbiAgICAgICAgICAgICAgLy8gPGJ1dHRvbj5cbiAgICAgICAgICAgICAgdmFyIG5hdmxhYmVsID0gc2V0dGluZ3MuYnV0dG9ucy5uYXZpZ2F0aW9uLnJlcGxhY2UoJyVpJywgKGkrMSkpO1xuICAgICAgICAgICAgICB2YXIgYnV0dG9uID0gJCgnPGJ1dHRvbj48c3Bhbj4nICsgbmF2bGFiZWwgKyAnPC9zcGFuPjwvYnV0dG9uPicpO1xuICAgICAgICAgICAgICBidXR0b24uZGF0YSgnY2Fyb3VzZWwtaXRlbScsIGkpO1xuICAgICAgICAgICAgICBidXR0b24ub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICAgLy8gc2V0IG5ldyBwb3NpdGlvblxuICAgICAgICAgICAgICAgIHZhciBwID0gJCh0aGlzKS5kYXRhKCdjYXJvdXNlbC1pdGVtJyk7XG4gICAgICAgICAgICAgICAgdmFyIHNsaWRld2lkdGggPSBzaGFrZXIuY2hpbGRyZW4oJ2xpOmVxKDApJykud2lkdGgoKSAvIHNoYWtlci53aWR0aCgpICogMTAwO1xuICAgICAgICAgICAgICAgIHAgPSBwICogc2xpZGV3aWR0aCAqIC0xO1xuICAgICAgICAgICAgICAgIGNhcm91c2VsLmRhdGEoJ2Nhcm91c2VsLXBvc2l0aW9uJywgcCk7XG5cbiAgICAgICAgICAgICAgICAvLyBub3QgYSB0b3VjaCBnZXN0dXJlXG4gICAgICAgICAgICAgICAgY2Fyb3VzZWwuZGF0YSgnY2Fyb3VzZWwtbGFzdC10b3VjaCcsIGZhbHNlKTtcblxuICAgICAgICAgICAgICAgIC8vIGNvbnRhaW5cbiAgICAgICAgICAgICAgICBjYXJvdXNlbC50cmlnZ2VyKCdjYXJvdXNlbC1jb250YWluJyk7XG5cbiAgICAgICAgICAgICAgICAvLyBzbGlkZVxuICAgICAgICAgICAgICAgIGNhcm91c2VsLnRyaWdnZXIoJ2Nhcm91c2VsLXNsaWRlJyk7XG5cbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgLy8gPGxpPlxuICAgICAgICAgICAgICB2YXIgbGkgPSAkKCc8bGkvPicpO1xuICAgICAgICAgICAgICBsaS5hcHBlbmQoYnV0dG9uKTtcblxuICAgICAgICAgICAgICAvLyBhY3RpdmU/XG4gICAgICAgICAgICAgIGlmKGkgPT09IDApe1xuICAgICAgICAgICAgICAgIGxpLmFkZENsYXNzKCd1aS1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIGFkZCB0byBuYXYgbGlzdFxuICAgICAgICAgICAgICB1bC5hcHBlbmQobGkpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGFkZFxuICAgICAgICAgICAgY2Fyb3VzZWwuYXBwZW5kKHVsKTtcblxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGNvbnRhaW5cbiAgICAgICAgICBjYXJvdXNlbC50cmlnZ2VyKCdjYXJvdXNlbC1jb250YWluJyk7XG5cbiAgICAgICAgICAvLyBhdXRvcGxheT9cbiAgICAgICAgICBpZihzZXR0aW5ncy5hdXRvcGxheSl7XG4gICAgICAgICAgICBjYXJvdXNlbC50cmlnZ2VyKCdjYXJvdXNlbC1xdWV1ZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIG9uaW5pdD9cbiAgICAgICAgICBpZih0eXBlb2Yoc2V0dGluZ3Mub25pbml0KSA9PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgICAgIHNldHRpbmdzLm9uaW5pdCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgICAvLyB0b3VjaC1kb3duXG4gICAgICAgIGNhcm91c2VsLm9uKCdjYXJvdXNlbC10b3VjaC1kb3duJywgZnVuY3Rpb24oZSwgcG9zaXRpb24pe1xuXG4gICAgICAgICAgLy8gYWRkIGNsYXNzZXNcbiAgICAgICAgICBjYXJvdXNlbC5hZGRDbGFzcygndWktdG91Y2gtdGhyZXNob2xkJyk7XG5cbiAgICAgICAgICAvLyBzdGFydGluZyBwb2ludFxuICAgICAgICAgIGNhcm91c2VsLmRhdGEoJ2Nhcm91c2VsLXRvdWNoLXN0YXJ0Jywge1xuICAgICAgICAgICAgeDogcG9zaXRpb24ueCxcbiAgICAgICAgICAgIHk6ICQod2luZG93KS5zY3JvbGxUb3AoKVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gZGlzYWJsZSBhdXRvcGxheSB3aGlsZSBzd2lwaW5nXG4gICAgICAgICAgaWYoc2V0dGluZ3MuYXV0b3BsYXkpe1xuICAgICAgICAgICAgY2Fyb3VzZWwudHJpZ2dlcignY2Fyb3VzZWwtZGVxdWV1ZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgICAvLyB0b3VjaC1tb3ZlXG4gICAgICAgIGNhcm91c2VsLm9uKCdjYXJvdXNlbC10b3VjaC1tb3ZlJywgZnVuY3Rpb24oZSwgcG9zaXRpb24pe1xuXG4gICAgICAgICAgLy8gdGhyZXNob2xkP1xuICAgICAgICAgIGlmKGNhcm91c2VsLmhhc0NsYXNzKCd1aS10b3VjaC10aHJlc2hvbGQnKSl7XG5cbiAgICAgICAgICAgIC8vIGdldCBzdGFydGluZyBwb3NpdGlvblxuICAgICAgICAgICAgdmFyIHN0YXJ0ID0gY2Fyb3VzZWwuZGF0YSgnY2Fyb3VzZWwtdG91Y2gtc3RhcnQnKTtcblxuICAgICAgICAgICAgLy8gc2Nyb2xsaW5nP1xuICAgICAgICAgICAgaWYoTWF0aC5hYnMoJCh3aW5kb3cpLnNjcm9sbFRvcCgpIC0gc3RhcnQueSkgPj0gc2V0dGluZ3MubW92ZXRocmVzaG9sZCl7XG4gICAgICAgICAgICAgIGNhcm91c2VsLnJlbW92ZUNsYXNzKCd1aS10b3VjaC10aHJlc2hvbGQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc3dpcGluZz9cbiAgICAgICAgICAgIGVsc2UgaWYoTWF0aC5hYnMocG9zaXRpb24ueCAtIHN0YXJ0LngpID49IHNldHRpbmdzLm1vdmV0aHJlc2hvbGQpe1xuICAgICAgICAgICAgICBjYXJvdXNlbC5yZW1vdmVDbGFzcygndWktdG91Y2gtdGhyZXNob2xkJykuYWRkQ2xhc3MoJ3VpLXRvdWNoLXN3aXBpbmcnKTtcbiAgICAgICAgICAgICAgJCgnYm9keScpLmFkZENsYXNzKCd1aS1zd2lwaW5nJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBzd2lwaW5nP1xuICAgICAgICAgIGlmKGNhcm91c2VsLmhhc0NsYXNzKCd1aS10b3VjaC1zd2lwaW5nJykpe1xuXG4gICAgICAgICAgICAvLyBwb3NpdGlvblxuICAgICAgICAgICAgdmFyIHN0YXJ0ID0gY2Fyb3VzZWwuZGF0YSgnY2Fyb3VzZWwtdG91Y2gtc3RhcnQnKTtcbiAgICAgICAgICAgIHZhciBkaXN0YW5jZSA9IHBvc2l0aW9uLnggLSBzdGFydC54O1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gY2Fyb3VzZWwuZGF0YSgnY2Fyb3VzZWwtcG9zaXRpb24nKTtcbiAgICAgICAgICAgIHZhciBjaGFuZ2UgPSBkaXN0YW5jZSAvIHNoYWtlci53aWR0aCgpICogMTAwO1xuICAgICAgICAgICAgY2Fyb3VzZWwuZGF0YSgnY2Fyb3VzZWwtdG91Y2gtY2hhbmdlJywgY2hhbmdlKTtcblxuICAgICAgICAgICAgLy8gc2hha2UgaXRcbiAgICAgICAgICAgIHZhciBwID0gcG9zaXRpb24gKyBjaGFuZ2U7XG4gICAgICAgICAgICBpZih3aW5kb3cub3B0aW11c1ByaW1lKXtcbiAgICAgICAgICAgICAgc2hha2VyLmNzcyh7XG4gICAgICAgICAgICAgICAgV2Via2l0VHJhbnNmb3JtOiAndHJhbnNsYXRlWCgnICsgcCArICclKScsXG4gICAgICAgICAgICAgICAgTW96VHJhbnNmb3JtOiAndHJhbnNsYXRlWCgnICsgcCArICclKScsXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgnICsgcCArICclKSdcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICBzaGFrZXIuY3NzKCdsZWZ0JywgcCArICclJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG9udXBkYXRlP1xuICAgICAgICAgICAgaWYodHlwZW9mKHNldHRpbmdzLm9udXBkYXRlKSA9PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgICAgICAgc2V0dGluZ3Mub251cGRhdGUocCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gdG91Y2gtdXBcbiAgICAgICAgY2Fyb3VzZWwub24oJ2Nhcm91c2VsLXRvdWNoLXVwJywgZnVuY3Rpb24oKXtcblxuICAgICAgICAgIC8vIHRocmVzaG9sZD9cbiAgICAgICAgICBpZihjYXJvdXNlbC5oYXNDbGFzcygndWktdG91Y2gtdGhyZXNob2xkJykpe1xuXG4gICAgICAgICAgICAvLyByZW1vdmUgY2xhc3Nlc1xuICAgICAgICAgICAgY2Fyb3VzZWwucmVtb3ZlQ2xhc3MoJ3VpLXRvdWNoLXRocmVzaG9sZCcpO1xuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gc3dpcGluZz9cbiAgICAgICAgICBlbHNlIGlmKGNhcm91c2VsLmhhc0NsYXNzKCd1aS10b3VjaC1zd2lwaW5nJykpe1xuXG4gICAgICAgICAgICAvLyByZW1vdmUgY2xhc3Nlc1xuICAgICAgICAgICAgY2Fyb3VzZWwucmVtb3ZlQ2xhc3MoJ3VpLXRvdWNoLXN3aXBpbmcnKTtcbiAgICAgICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygndWktc3dpcGluZycpO1xuXG4gICAgICAgICAgICAvLyBwb3NpdGlvblxuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gY2Fyb3VzZWwuZGF0YSgnY2Fyb3VzZWwtcG9zaXRpb24nKTtcbiAgICAgICAgICAgIHZhciBjaGFuZ2UgPSBjYXJvdXNlbC5kYXRhKCdjYXJvdXNlbC10b3VjaC1jaGFuZ2UnKTtcblxuICAgICAgICAgICAgLy8gc3dpcGU/XG4gICAgICAgICAgICBpZihjaGFuZ2UgPj0gc2V0dGluZ3Muc3dpcGV0aHJlc2hvbGQpe1xuICAgICAgICAgICAgICB2YXIgc2xpZGV3aWR0aCA9IHNoYWtlci5jaGlsZHJlbignbGk6ZXEoMCknKS53aWR0aCgpIC8gc2hha2VyLndpZHRoKCkgKiAxMDA7XG4gICAgICAgICAgICAgIGlmKGNoYW5nZSA8PSBzbGlkZXdpZHRoKXtcbiAgICAgICAgICAgICAgICBjaGFuZ2UgPSBzbGlkZXdpZHRoO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKGNoYW5nZSA8PSBzZXR0aW5ncy5zd2lwZXRocmVzaG9sZCAqIC0xKXtcbiAgICAgICAgICAgICAgdmFyIHNsaWRld2lkdGggPSBzaGFrZXIuY2hpbGRyZW4oJ2xpOmVxKDApJykud2lkdGgoKSAvIHNoYWtlci53aWR0aCgpICogMTAwO1xuICAgICAgICAgICAgICBpZihjaGFuZ2UgPj0gc2xpZGV3aWR0aCAqIC0xKXtcbiAgICAgICAgICAgICAgICBjaGFuZ2UgPSBzbGlkZXdpZHRoICogLTE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdG91Y2ggZ2VzdHVyZVxuICAgICAgICAgICAgY2Fyb3VzZWwuZGF0YSgnY2Fyb3VzZWwtbGFzdC10b3VjaCcsIHRydWUpO1xuXG4gICAgICAgICAgICAvLyB1cGRhdGVcbiAgICAgICAgICAgIGNhcm91c2VsLmRhdGEoJ2Nhcm91c2VsLXBvc2l0aW9uJywgcG9zaXRpb24gKyBjaGFuZ2UpO1xuXG4gICAgICAgICAgICAvLyBjb250YWluXG4gICAgICAgICAgICBjYXJvdXNlbC50cmlnZ2VyKCdjYXJvdXNlbC1jb250YWluJyk7XG5cbiAgICAgICAgICAgIC8vIHRyYW5zZm9ybVxuICAgICAgICAgICAgY2Fyb3VzZWwudHJpZ2dlcignY2Fyb3VzZWwtc2xpZGUnKTtcblxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIHF1ZXVlIG5leHQgdHJhbnNpdGlvblxuICAgICAgICAgIGlmKHNldHRpbmdzLmF1dG9wbGF5KXtcbiAgICAgICAgICAgIGNhcm91c2VsLnRyaWdnZXIoJ2Nhcm91c2VsLXF1ZXVlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHF1ZXVlIG5leHQgdHJhbnNpdGlvblxuICAgICAgICBjYXJvdXNlbC5vbignY2Fyb3VzZWwtcXVldWUnLCBmdW5jdGlvbigpe1xuXG4gICAgICAgICAgLy8gc2V0IHRpbWVyXG4gICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBjYXJvdXNlbC5kYXRhKCdjYXJvdXNlbC1sYXN0LXRvdWNoJywgZmFsc2UpO1xuICAgICAgICAgICAgY2Fyb3VzZWwudHJpZ2dlcignY2Fyb3VzZWwtYWR2YW5jZScpO1xuICAgICAgICAgIH0sIHNldHRpbmdzLmRlbGF5KTtcblxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBkZS1xdWV1ZSB0cmFuc2l0aW9uc1xuICAgICAgICBjYXJvdXNlbC5vbignY2Fyb3VzZWwtZGVxdWV1ZScsIGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAvLyB1bnNldCB0aW1lclxuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gYWR2YW5jZVxuICAgICAgICBjYXJvdXNlbC5vbignY2Fyb3VzZWwtYWR2YW5jZScsIGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAvLyBhZHZhbmNlIG9uZSBzbGlkZVxuICAgICAgICAgIHZhciBwID0gY2Fyb3VzZWwuZGF0YSgnY2Fyb3VzZWwtcG9zaXRpb24nKTtcbiAgICAgICAgICB2YXIgc2xpZGV3aWR0aCA9IHNoYWtlci5jaGlsZHJlbignbGk6ZXEoMCknKS53aWR0aCgpIC8gc2hha2VyLndpZHRoKCkgKiAxMDA7XG4gICAgICAgICAgcCAtPSBzbGlkZXdpZHRoO1xuICAgICAgICAgIGNhcm91c2VsLmRhdGEoJ2Nhcm91c2VsLXBvc2l0aW9uJywgcCk7XG5cbiAgICAgICAgICAvLyBjb250YWluXG4gICAgICAgICAgY2Fyb3VzZWwudHJpZ2dlcignY2Fyb3VzZWwtY29udGFpbicpO1xuXG4gICAgICAgICAgLy8gc2xpZGVcbiAgICAgICAgICBjYXJvdXNlbC50cmlnZ2VyKCdjYXJvdXNlbC1zbGlkZScpO1xuXG4gICAgICAgICAgLy8gYXV0b3BsYXk/XG4gICAgICAgICAgaWYoc2V0dGluZ3MuYXV0b3BsYXkpe1xuICAgICAgICAgICAgY2Fyb3VzZWwudHJpZ2dlcignY2Fyb3VzZWwtZGVxdWV1ZScpO1xuICAgICAgICAgICAgY2Fyb3VzZWwudHJpZ2dlcignY2Fyb3VzZWwtcXVldWUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gcmV0cmVhdFxuICAgICAgICBjYXJvdXNlbC5vbignY2Fyb3VzZWwtcmV0cmVhdCcsIGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAvLyByZXRyZWF0IG9uZSBzbGlkZVxuICAgICAgICAgIHZhciBwID0gY2Fyb3VzZWwuZGF0YSgnY2Fyb3VzZWwtcG9zaXRpb24nKTtcbiAgICAgICAgICB2YXIgc2xpZGV3aWR0aCA9IHNoYWtlci5jaGlsZHJlbignbGk6ZXEoMCknKS53aWR0aCgpIC8gc2hha2VyLndpZHRoKCkgKiAxMDA7XG4gICAgICAgICAgcCArPSBzbGlkZXdpZHRoO1xuICAgICAgICAgIGNhcm91c2VsLmRhdGEoJ2Nhcm91c2VsLXBvc2l0aW9uJywgcCk7XG5cbiAgICAgICAgICAvLyBjb250YWluXG4gICAgICAgICAgY2Fyb3VzZWwudHJpZ2dlcignY2Fyb3VzZWwtY29udGFpbicpO1xuXG4gICAgICAgICAgLy8gc2xpZGVcbiAgICAgICAgICBjYXJvdXNlbC50cmlnZ2VyKCdjYXJvdXNlbC1zbGlkZScpO1xuXG4gICAgICAgICAgLy8gYXV0b3BsYXk/XG4gICAgICAgICAgaWYoc2V0dGluZ3MuYXV0b3BsYXkpe1xuICAgICAgICAgICAgY2Fyb3VzZWwudHJpZ2dlcignY2Fyb3VzZWwtZGVxdWV1ZScpO1xuICAgICAgICAgICAgY2Fyb3VzZWwudHJpZ2dlcignY2Fyb3VzZWwtcXVldWUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gY29udGFpblxuICAgICAgICBjYXJvdXNlbC5vbignY2Fyb3VzZWwtY29udGFpbicsIGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAvLyBnZXQgc2xpZGUgd2lkdGhcbiAgICAgICAgICB2YXIgc2xpZGV3aWR0aCA9IHNoYWtlci5jaGlsZHJlbignbGk6ZXEoMCknKS53aWR0aCgpIC8gc2hha2VyLndpZHRoKCkgKiAxMDA7XG4gICAgICAgICAgdmFyIHNsaWRlc2ludmlldyA9IE1hdGgucm91bmQoMTAwIC8gc2xpZGV3aWR0aCk7XG4gICAgICAgICAgdmFyIHNsaWRlcyA9IGNhcm91c2VsLmRhdGEoJ2Nhcm91c2VsLWl0ZW0tY291bnQnKTtcblxuICAgICAgICAgIC8vIGNvbnRhaW5cbiAgICAgICAgICB2YXIgcCA9IGNhcm91c2VsLmRhdGEoJ2Nhcm91c2VsLXBvc2l0aW9uJyk7XG4gICAgICAgICAgcCA9IE1hdGgucm91bmQocCAvIHNsaWRld2lkdGgpICogc2xpZGV3aWR0aDtcbiAgICAgICAgICBpZihwID4gMCl7XG4gICAgICAgICAgICBpZihzZXR0aW5ncy5sb29wICYmICFjYXJvdXNlbC5kYXRhKCdjYXJvdXNlbC1sYXN0LXRvdWNoJykpe1xuICAgICAgICAgICAgICBwID0gc2xpZGV3aWR0aCAqIChzbGlkZXMgLSBzbGlkZXNpbnZpZXcpICogLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICBwID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZihwIDwgc2xpZGV3aWR0aCAqIChzbGlkZXMgLSBzbGlkZXNpbnZpZXcpICogLTEpe1xuICAgICAgICAgICAgaWYoc2V0dGluZ3MubG9vcCAmJiAhY2Fyb3VzZWwuZGF0YSgnY2Fyb3VzZWwtbGFzdC10b3VjaCcpKXtcbiAgICAgICAgICAgICAgcCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICBwID0gc2xpZGV3aWR0aCAqIChzbGlkZXMgLSBzbGlkZXNpbnZpZXcpICogLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gZGlzYWJsZSBwYWdpbmdcbiAgICAgICAgICBpZighc2V0dGluZ3MubG9vcCAmJiBzZXR0aW5ncy5wYWdpbmcgJiYgcCA+PSAwKXtcbiAgICAgICAgICAgIGNhcm91c2VsLmNoaWxkcmVuKCdidXR0b24ucHJldmlvdXMnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmKCFzZXR0aW5ncy5sb29wICYmIHNldHRpbmdzLnBhZ2luZyl7XG4gICAgICAgICAgICBjYXJvdXNlbC5jaGlsZHJlbignYnV0dG9uLnByZXZpb3VzW2Rpc2FibGVkXScpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZighc2V0dGluZ3MubG9vcCAmJiBzZXR0aW5ncy5wYWdpbmcgJiYgcCA8PSBzbGlkZXdpZHRoICogKHNsaWRlcyAtIHNsaWRlc2ludmlldykgKiAtMSl7XG4gICAgICAgICAgICBjYXJvdXNlbC5jaGlsZHJlbignYnV0dG9uLm5leHQnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmKCFzZXR0aW5ncy5sb29wICYmIHNldHRpbmdzLnBhZ2luZyl7XG4gICAgICAgICAgICBjYXJvdXNlbC5jaGlsZHJlbignYnV0dG9uLm5leHRbZGlzYWJsZWRdJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gdXBkYXRlXG4gICAgICAgICAgY2Fyb3VzZWwuZGF0YSgnY2Fyb3VzZWwtcG9zaXRpb24nLCBwKTtcblxuICAgICAgICAgIC8vIHVwZGF0ZSBuYXZpZ2F0aW9uP1xuICAgICAgICAgIGlmKHNldHRpbmdzLm5hdmlnYXRpb24pe1xuICAgICAgICAgICAgdmFyIGkgPSBNYXRoLnJvdW5kKE1hdGguYWJzKHApIC8gc2xpZGV3aWR0aCk7XG4gICAgICAgICAgICB2YXIgbmF2bGlzdCA9IGNhcm91c2VsLmNoaWxkcmVuKCd1bC51aS1jYXJvdXNlbC1uYXYnKTtcbiAgICAgICAgICAgIG5hdmxpc3QuY2hpbGRyZW4oKS5yZW1vdmVDbGFzcygndWktYWN0aXZlJyk7XG4gICAgICAgICAgICBuYXZsaXN0LmNoaWxkcmVuKCkuZXEoaSkuYWRkQ2xhc3MoJ3VpLWFjdGl2ZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBzbGlkZVxuICAgICAgICBjYXJvdXNlbC5vbignY2Fyb3VzZWwtc2xpZGUnLCBmdW5jdGlvbigpe1xuXG4gICAgICAgICAgLy8gc2hha2UgaXRcbiAgICAgICAgICB2YXIgcCA9IGNhcm91c2VsLmRhdGEoJ2Nhcm91c2VsLXBvc2l0aW9uJyk7XG4gICAgICAgICAgaWYod2luZG93Lm9wdGltdXNQcmltZSl7XG4gICAgICAgICAgICBzaGFrZXIuY3NzKHtcbiAgICAgICAgICAgICAgV2Via2l0VHJhbnNmb3JtOiAndHJhbnNsYXRlWCgnICsgcCArICclKScsXG4gICAgICAgICAgICAgIE1velRyYW5zZm9ybTogJ3RyYW5zbGF0ZVgoJyArIHAgKyAnJSknLFxuICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKCcgKyBwICsgJyUpJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICBzaGFrZXIuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgIGxlZnQ6IHAgKyAnJSdcbiAgICAgICAgICAgIH0sIDMwMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gb251cGRhdGU/XG4gICAgICAgICAgaWYodHlwZW9mKHNldHRpbmdzLm9udXBkYXRlKSA9PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgICAgIHNldHRpbmdzLm9udXBkYXRlKHApO1xuICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBkZXN0cm95XG4gICAgICAgIGNhcm91c2VsLm9uKCdjYXJvdXNlbC1kZXN0cm95JywgZnVuY3Rpb24oKXtcblxuICAgICAgICAgIC8vIHJlbW92ZSBkYXRhXG4gICAgICAgICAgY2Fyb3VzZWwucmVtb3ZlRGF0YSgnY2Fyb3VzZWwtcG9zaXRpb24nKTtcbiAgICAgICAgICBjYXJvdXNlbC5yZW1vdmVEYXRhKCdjYXJvdXNlbC1pdGVtLWNvdW50Jyk7XG5cbiAgICAgICAgICAvLyByZW1vdmUgZXZlbnRzXG4gICAgICAgICAgY2Fyb3VzZWwub2ZmKCdjYXJvdXNlbC1pbml0IGNhcm91c2VsLWFkdmFuY2UgY2Fyb3VzZWwtcmV0cmVhdCBjYXJvdXNlbC1zbGlkZScpO1xuXG4gICAgICAgICAgLy8gcmVtb3ZlIHBhZ2luZ1xuICAgICAgICAgIGNhcm91c2VsLmNoaWxkcmVuKCdidXR0b24ucHJldmlvdXMsYnV0dG9uLm5leHQnKS5yZW1vdmUoKTtcblxuICAgICAgICAgIC8vIHJlbW92ZSBjbGFzc2VzXG4gICAgICAgICAgY2Fyb3VzZWwucmVtb3ZlQ2xhc3MoJ3VpLWNhcm91c2VsJyk7XG4gICAgICAgICAgc2hha2VyLnJlbW92ZUNsYXNzKCd1aS1jYXJvdXNlbC1zaGFrZXInKTtcbiAgICAgICAgICBpZih3aW5kb3cub3B0aW11c1ByaW1lKXtcbiAgICAgICAgICAgIHNoYWtlci5jc3Moe1xuICAgICAgICAgICAgICBXZWJraXRUcmFuc2Zvcm06ICd0cmFuc2xhdGVYKDAlKScsXG4gICAgICAgICAgICAgIE1velRyYW5zZm9ybTogJ3RyYW5zbGF0ZVgoMCUpJyxcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgwJSknXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIHNoYWtlci5jc3MoJ2xlZnQnLCAnMCUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBjYW5jZWwgZXZlbnRzP1xuICAgICAgICAgIGlmKCQoJy51aS1jYXJvdXNlbCcpLnNpemUoKSA9PT0gMCl7XG4gICAgICAgICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUnKTtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignbW91c2Vkb3duIHRvdWNoc3RhcnQgbW91c2Vtb3ZlIHRvdWNobW92ZSBtb3VzZXVwIHRvdWNoZW5kIHRvdWNobGVhdmUgdG91Y2hjYW5jZWwnKTtcbiAgICAgICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygndWktZHJhZ2dhYmxlcy1saXN0ZW4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gaW5pdFxuICAgICAgICBjYXJvdXNlbC50cmlnZ2VyKCdjYXJvdXNlbC1pbml0Jyk7XG5cbiAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgLy8gbGlzdGVuP1xuICAgIGlmKCEkKCdib2R5JykuaGFzQ2xhc3MoJ3VpLWRyYWdnYWJsZXMtbGlzdGVuJykpe1xuXG4gICAgICAvLyBhZGQgY2xhc3Nlc1xuICAgICAgJCgnYm9keScpLmFkZENsYXNzKCd1aS1kcmFnZ2FibGVzLWxpc3RlbicpO1xuXG4gICAgICAvLyByZXNpemUgLyBvcmllbnRhdGlvblxuICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUgb3JpZW50YXRpb25jaGFuZ2UnLCBmdW5jdGlvbihlKXtcbiAgICAgICAgJCgnLnVpLWNhcm91c2VsJykudHJpZ2dlcignY2Fyb3VzZWwtc2xpZGUnKTtcbiAgICAgICAgJCgnLnVpLWNhcm91c2VsJykudHJpZ2dlcignY2Fyb3VzZWwtY29udGFpbicpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIHRvdWNoIGRvd25cbiAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZWRvd24gdG91Y2hzdGFydCcsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBpZihlLnBhZ2VYIHx8IGUub3JpZ2luYWxFdmVudC50b3VjaGVzKXtcblxuICAgICAgICAgIC8vIGRyYWdnaW5nIGNhcm91c2VsP1xuICAgICAgICAgIGlmKCQoZS50YXJnZXQpLmlzKCcudWktY2Fyb3VzZWwsLnVpLWNhcm91c2VsICo6bm90KC5zbGlkZXItaGFuZGxlLC5zbGlkZXItaGFuZGxlICopJykgJiYgZS53aGljaCAhPSAzKXtcblxuICAgICAgICAgICAgLy8gdG91Y2hkb3duIVxuICAgICAgICAgICAgdmFyIGNhcm91c2VsID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLnVpLWNhcm91c2VsJyk7XG4gICAgICAgICAgICAkKGNhcm91c2VsKS50cmlnZ2VyKCdjYXJvdXNlbC10b3VjaC1kb3duJywgW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgeDogZS5wYWdlWCA/IGUucGFnZVggOiBlLm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXS5wYWdlWCxcbiAgICAgICAgICAgICAgICB5OiBlLnBhZ2VZID8gZS5wYWdlWSA6IGUub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdLnBhZ2VZXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0pO1xuXG4gICAgICAgICAgICAvLyBwcmV2ZW50IGNhbmNlbCBpbiBhbmRyb2lkXG4gICAgICAgICAgICBpZihuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9BbmRyb2lkL2kpKXtcbiAgICAgICAgICAgICAgLy9lLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIHRvdWNoIG1vdmVcbiAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUgdG91Y2htb3ZlJywgZnVuY3Rpb24oZSl7XG4gICAgICAgIGlmKGUucGFnZVggfHwgZS5vcmlnaW5hbEV2ZW50LnRvdWNoZXMpe1xuXG4gICAgICAgICAgaWYoJCgnYm9keScpLmhhc0NsYXNzKCd1aS1zd2lwaW5nJykpe1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIHVwZGF0ZSB0aHJlc2hvbGQvc3dpcGluZyBjYXJvdXNlbFxuICAgICAgICAgICQoJy51aS1jYXJvdXNlbC51aS10b3VjaC10aHJlc2hvbGQsLnVpLWNhcm91c2VsLnVpLXRvdWNoLXN3aXBpbmcnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXIoJ2Nhcm91c2VsLXRvdWNoLW1vdmUnLCBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB4OiBlLnBhZ2VYID8gZS5wYWdlWCA6IGUub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdLnBhZ2VYLFxuICAgICAgICAgICAgICAgIHk6IGUucGFnZVkgPyBlLnBhZ2VZIDogZS5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0ucGFnZVlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIHRvdWNoIHVwXG4gICAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCB0b3VjaGVuZCB0b3VjaGxlYXZlIHRvdWNoY2FuY2VsJywgZnVuY3Rpb24oZSl7XG5cbiAgICAgICAgLy8gZW5kIHRocmVzaG9sZC9zd2lwaW5nIGNhcm91c2VsXG4gICAgICAgICQoJy51aS1jYXJvdXNlbC51aS10b3VjaC10aHJlc2hvbGQsLnVpLWNhcm91c2VsLnVpLXRvdWNoLXN3aXBpbmcnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjYXJvdXNlbC10b3VjaC11cCcpO1xuICAgICAgICB9KTtcblxuICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvLyBkb25lXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9O1xuICB9KGpRdWVyeSkpXG59XG4iLCJjb25zdCBsaXN0cyA9IHdpbmRvdy5saXN0cyA9IHJlcXVpcmUoJy4vbGlzdHMnKTtcbmNvbnN0IHV0aWxpdGllcyA9IHdpbmRvdy51dGlsaXRpZXMgPSByZXF1aXJlKCcuL3V0aWxpdGllcycpO1xuXG52YXIgcmVzb3VyY2VKb2JGYW1pbHkgPSBbXTtcbnZhciByZXNvdXJjZUZ1bmN0aW9uYWxDb21tdW5pdHkgPSBbXTtcbnZhciByZXNvdXJjZUNhcmVlclRyYWNrID0gW107XG5cbnZhciBjb250YWluZXIgPSAnI2xlYXJuaW5ncGxhbnMtY29udGFpbmVyJztcbnZhciB0aGlzY29udGFpbmVyID0gJChjb250YWluZXIpO1xuXG52YXIgcmVzdWx0c1BhcmVudENvbnRhaW5lciA9ICcubGVhcm5pbmdwbGFucy1yZXN1bHRzLWNvbHVtbic7XG52YXIgcmVzdWx0c05hdmlnYXRpb25Db250YWluZXIgPSAnLmFscGhhLWZpbHRlcic7XG52YXIgcmVzdWx0c0NvbnRhaW5lciA9ICcucmVzdWx0cyc7XG52YXIgZmlsdGVyUGFyZW50Q29udGFpbmVyID0gJy5maWx0ZXItY29sdW1uJztcbnZhciBmaWx0ZXJDb250YWluZXIgPSAnLmZpbHRlci1ncm91cC1vcHRpb25zJztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gc2tlbGV0b24gY29kZSBmb3Igd2ViIHBhcnRcbiAgbG9hZDogZnVuY3Rpb24oKXtcblxuICAgIGVhbmRzdXBsYW5zLnJlc2V0V2ViUGFydCgpO1xuICAgIGVhbmRzdXBsYW5zLmJ1aWxkV2ViUGFydCgpO1xuXG4gICAgIHZhciBjaGVja0V4aXN0ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmKCQoJy5sZWFybmluZ3BsYW4taXRlbScpLnNpemUoKSAhPSAwKSB7XG4gICAgICAgICAgZWFuZHN1cGxhbnMuYnVpbGRSZWZpbmVtZW50KCk7XG4gICAgICAgICAgZWFuZHN1cGxhbnMuZmlsdGVyUmVzdWx0c0J5QWxwaGFiZXQoKTtcbiAgICAgICAgICBlYW5kc3VwbGFucy5maWx0ZXJSZXN1bHRzQnlSZWZpbmVtZW50KCk7XG5cbiAgICAgICAgICAvLyBzYXZlIGRlc2Mgb3JpZ2luYWwgaGVpZ2h0cyBmb3IgYW5pbWF0aW9uXG4gICAgICAgICAgJCgnLnRyaW1tZWQnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgdGhpc0hlaWdodCA9ICQodGhpcykuaGVpZ2h0KCk7XG4gICAgICAgICAgICAkKHRoaXMpLmF0dHIoJ2RhdGEtaGVpZ2h0Jyx0aGlzSGVpZ2h0KTtcbiAgICAgICAgICAgICQodGhpcykuY3NzKCdoZWlnaHQnLCc5MHB4Jyk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBzaG93IG1vcmUgb3IgbGVzcyBmZWxsb3cgZGVzY3JpcHRpb25cbiAgICAgICAgICAkKCcuZGVzY3JpcHRpb24tdG9nZ2xlLWxpbmsnKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGlmKCQodGhpcykuaGFzQ2xhc3MoJ2Rlc2NyaXB0aW9uLW1vcmUtbGluaycpKXtcbiAgICAgICAgICAgICAgdmFyIHRoaXNPcmlnSGVpZ2h0ID0gJCh0aGlzKS5wYXJlbnQoKS5maW5kKCcudHJpbW1lZCcpLmF0dHIoJ2RhdGEtaGVpZ2h0Jyk7XG4gICAgICAgICAgICAgICQodGhpcykucGFyZW50KCkuZmluZCgnLnRyaW1tZWQnKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHRoaXNPcmlnSGVpZ2h0XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAkKHRoaXMpLnByZXYoKS5oaWRlKCk7XG4gICAgICAgICAgICAgICQodGhpcykuY3NzKCdvcGFjaXR5JywgJzAnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICQodGhpcykucGFyZW50KCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiA5MFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuZGVzY3JpcHRpb24nKS5maW5kKCcuZGVzY3JpcHRpb24tbW9yZS1saW5rJykuY3NzKCdvcGFjaXR5JywgJzEnKTtcbiAgICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuZGVzY3JpcHRpb24nKS5maW5kKCcuZGVzY3JpcHRpb24tb3ZlcmxheScpLnNob3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgLy8gaGFzaCBjaGFuZ2VcbiAgICAgICAgICAkKHdpbmRvdykub24oJ2hhc2hjaGFuZ2UnLCBmdW5jdGlvbihlKXtcblxuICAgICAgICAgICAgLy8gZ2V0IGhhc2hcbiAgICAgICAgICAgIHZhciBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcnKTtcbiAgICAgICAgICAgIGhhc2ggPSBkZWNvZGVVUklDb21wb25lbnQoaGFzaCk7XG5cbiAgICAgICAgICAgIHZhciBfYWxwaGFiZXRzID0gJCgnLmFscGhhYmV0ID4gdWwgPiBsaSA+IGEnKTtcbiAgICAgICAgICAgIHZhciBfcmVmaW5lbWVudHMgPSAkKCcuZmlsdGVyLWdyb3VwID4gdWwgPiBsaScpO1xuICAgICAgICAgICAgdmFyIF9jb250ZW50Um93cyA9ICQoJy5sZWFybmluZ3BsYW4taXRlbScpO1xuICAgICAgICAgICAgdmFyIF9jb3VudCA9IDA7XG5cbiAgICAgICAgICAgIF9jb250ZW50Um93cy5oaWRlKCk7XG5cbiAgICAgICAgICAgICQoJy5tb2JpbGUtYWxwaGEtbGlzdCcpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICQoJy5hbHBoYWJldCA+IHVsID4gbGkgPiBhJykucmVtb3ZlQ2xhc3MoJ21vYmlsZS1hY3RpdmUnKTtcblxuICAgICAgICAgICAgaWYoaGFzaC5sZW5ndGggPT09IDAgfHwgaGFzaCA9PT0gJ2FsbCcpIHtcbiAgICAgICAgICAgICAgX3JlZmluZW1lbnRzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgJCgnW2RhdGEtZmlsdGVyPVwiYWxsXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAkKCcuY291cnNlLWluZm8sIC5zZXJ2aWNlLWluZm8nKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgX2FscGhhYmV0cy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICQoJ1tkYXRhLWFscGhhPVwiYWxsXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICBfY29udGVudFJvd3MuZmFkZUluKDQwMCk7XG4gICAgICAgICAgICAgIF9jb3VudCA9IF9jb250ZW50Um93cy5zaXplKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZihoYXNoLmxlbmd0aCA9PT0gMSl7XG4gICAgICAgICAgICAgICAgX3JlZmluZW1lbnRzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS1maWx0ZXI9XCJhbGxcIl0nKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgJCgnLmNvdXJzZS1pbmZvLCAuc2VydmljZS1pbmZvJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgX2FscGhhYmV0cy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtYWxwaGE9XCJhbGxcIl0nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtYWxwaGEtZmlsdGVyPVwiJytoYXNoKydcIl0nKS5mYWRlSW4oNDAwKTtcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS1hbHBoYT1cIicraGFzaCsnXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgIF9jb3VudCA9ICQoJ1tkYXRhLWFscGhhLWZpbHRlcj1cIicraGFzaCsnXCJdJykuc2l6ZSgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9hbHBoYWJldHMucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICQoJ1tkYXRhLWFscGhhPVwiYWxsXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgIF9yZWZpbmVtZW50cy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgJCgnLmNvdXJzZS1pbmZvLCAuc2VydmljZS1pbmZvJykucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBzdG9yZSBmaWx0ZXJzIGluIGFycmF5XG4gICAgICAgICAgICAgICAgdmFyIGFjdGl2ZUZpbHRlcnMgPSBoYXNoLnNwbGl0KCcsJyk7XG5cbiAgICAgICAgICAgICAgICAvLyBzaG93IHJlc3VsdHMgYmFzZWQgb24gYWN0aXZlIGZpbHRlciBhcnJheVxuICAgICAgICAgICAgICAgIF9jb250ZW50Um93cy5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICAgICAgICAgIHZhciB0aGVzZVRhZ3MgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcudGFncyBzcGFuJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICB0aGVzZVRhZ3MucHVzaCh0aGlzKTtcbiAgICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAgIHZhciBfY2VsbFRleHQgPSB0aGVzZVRhZ3MubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0udGV4dENvbnRlbnQ7XG4gICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICB2YXIgdGhpc0NvbnRhaW5zID0gYWN0aXZlRmlsdGVycy5ldmVyeShmdW5jdGlvbih2YWwpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2NlbGxUZXh0LmluZGV4T2YodmFsKSA+PSAwO1xuICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgIC8qZm9yICh2YXIgZmlsdGVyaXRlbSBvZiBhY3RpdmVGaWx0ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLWZpbHRlcj1cIicrZmlsdGVyaXRlbSsnXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgfSovXG5cbiAgICAgICAgICAgICAgICAgIHZhciBhcnJheUxlbmd0aCA9IGFjdGl2ZUZpbHRlcnMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheUxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmaWx0ZXJpdGVtID0gYWN0aXZlRmlsdGVyc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtZmlsdGVyPVwiJyArIGZpbHRlcml0ZW0gKyAnXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBpZih0aGlzQ29udGFpbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgX2NvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuZmFkZUluKDQwMCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJCgnLm5vLXJlc3VsdHMnKS5yZW1vdmUoKTtcblxuICAgICAgICAgICAgaWYoX2NvdW50ID09PSAwKXtcbiAgICAgICAgICAgICAgJCgnPGRpdiBjbGFzcz1cIm5vLXJlc3VsdHNcIj5UaGVyZSBhcmUgbm8gcmVzdWx0cy4gPGEgaHJlZj1cIiNcIj5WSUVXIEFMTDwvYT48L2Rpdj4nKS5hcHBlbmRUbygnLnJlc3VsdHMnKTtcbiAgICAgICAgICAgICAgJCgnLmNvdXJzZS1pbmZvLCAuc2VydmljZS1pbmZvJykucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgICAgJCgnLm5vLXJlc3VsdHMgYScpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBfY29udGVudFJvd3MuaGlkZSgpO1xuICAgICAgICAgICAgICAgIF9hbHBoYWJldHMucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgIF9yZWZpbmVtZW50cy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtYWxwaGE9XCJhbGxcIl0nKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtZmlsdGVyPVwiYWxsXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICAgICAgICAgX2NvbnRlbnRSb3dzLmZhZGVJbig0MDApO1xuICAgICAgICAgICAgICAgICQoJy5uby1yZXN1bHRzJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgdmFyIGhhc2ggPSAnI2FsbCc7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBoYXNoO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICBjbGVhckludGVydmFsKGNoZWNrRXhpc3QpO1xuXG4gICAgICAgICAkKHdpbmRvdykudHJpZ2dlcignaGFzaGNoYW5nZScpO1xuXG4gICAgICAgIH1cbiAgICAgfSwgMTAwKTtcblxuICB9LFxuICBidWlsZFdlYlBhcnQ6IGZ1bmN0aW9uIGJ1aWxkV2ViUGFydCgpXG4gIHtcbiAgICAgIC8vIFJlbmRlciBmaWx0ZXJpbmcgY29sdW1uXG4gICAgICB0aGlzY29udGFpbmVyLmFwcGVuZCgnPGRpdiBjbGFzcz1cImZpbHRlci10b2dnbGVcIj48aSBjbGFzcz1cImZhIGZhLWZpbHRlclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48c3BhbiBjbGFzcz1cInRleHRcIj5GaWx0ZXI8L3NwYW4+PC9kaXY+PGRpdiBjbGFzcz1cImZpbHRlci1jb2x1bW4gY29sLW1kLTNcIj48L2Rpdj4nKTtcblxuICAgICAgLy8gUmVuZGVyIHJlc3VsdHMgY29sdW1uXG4gICAgICB0aGlzY29udGFpbmVyLmFwcGVuZCgnPGRpdiBjbGFzcz1cImxlYXJuaW5ncGxhbnMtcmVzdWx0cy1jb2x1bW4gY29sLW1kLTlcIj4nKTtcbiAgICAgICAgICAvLyBSZW5kZXIgYWxwaGFiZXQgbmF2aWdhdGlvblxuICAgICAgICAgICQocmVzdWx0c1BhcmVudENvbnRhaW5lcikuYXBwZW5kKCc8ZGl2IGNsYXNzPVwiYWxwaGEtZmlsdGVyXCI+Jyk7XG5cbiAgICAgICAgICAgIGVhbmRzdXBsYW5zLmJ1aWxkQWxwaGFiZXQoKTtcblxuICAgICAgICAgICQocmVzdWx0c1BhcmVudENvbnRhaW5lcikuYXBwZW5kKCc8L2Rpdj48ZGl2IGNsYXNzPVwicm93IG5vLWd1dHRlciBpbmZvLWNvbnRhaW5lclwiPjwvZGl2PicpO1xuICAgICAgICAgIC8vIFJlbmRlciByZXN1bHRzIHBhbmVsXG4gICAgICAgICAgJChyZXN1bHRzUGFyZW50Q29udGFpbmVyKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJyZXN1bHRzXCI+Jyk7XG5cbiAgICAgICAgICAgIC8vIFJlbmRlciByZXN1bHRzXG4gICAgICAgICAgICBsaXN0cy5nZXRMaXN0SXRlbXMoe1xuICAgICAgICAgICAgICBsaXN0bmFtZTogJ0VhbmRTVSBQbGFucycsIC8vbGlzdG5hbWUsXG4gICAgICAgICAgICAgIGZpZWxkczogJ1RpdGxlLERlc2MsRW5hYmxlZCxMaW5rVVJMLE9wZW5MaW5rSW5OZXdXaW5kb3csSm9iRmFtaWx5LEZ1bmN0aW9uYWxDb21tdW5pdHksQ2FyZWVyVHJhY2snLFxuICAgICAgICAgICAgICBvcmRlcmJ5OiAnVGl0bGUnXG4gICAgICAgICAgICB9LGZ1bmN0aW9uKGl0ZW1zKXtcbiAgICAgICAgICAgICAgdmFyIGl0ZW1zZGF0YSA9IGl0ZW1zLmQucmVzdWx0cztcbiAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtc2RhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgdGhpc1RpdGxlID0gaXRlbXNkYXRhW2ldLlRpdGxlO1xuICAgICAgICAgICAgICAgIHZhciB0aGlzRGVzYyA9IGl0ZW1zZGF0YVtpXS5EZXNjO1xuICAgICAgICAgICAgICAgIHZhciB0aGlzRW5hYmxlZCA9IGl0ZW1zZGF0YVtpXS5FbmFibGVkO1xuICAgICAgICAgICAgICAgIHZhciBuZXdXaW5kb3cgPSBpdGVtc2RhdGFbaV0uT3BlbkxpbmtJbk5ld1dpbmRvdztcbiAgICAgICAgICAgICAgICB2YXIgY291cnNlSUQgPSAnJztcblxuICAgICAgICAgICAgICAgIHZhciBsZXR0ZXIgPSB0aGlzVGl0bGUudG9Mb3dlckNhc2UoKS5zdWJzdHJpbmcoMCwxKTtcbiAgICAgICAgICAgICAgICB2YXIgZmluYWxEZXNjcmlwdGlvbiA9ICcnO1xuICAgICAgICAgICAgICAgIHZhciB0aGlzVGl0bGVCdWlsZCA9ICc8ZGl2IGNsYXNzPVwidGl0bGVcIj4nK3RoaXNUaXRsZSsnPC9kaXY+JztcblxuICAgICAgICAgICAgICAgIGlmKHRoaXNEZXNjICE9IHVuZGVmaW5lZCB8fCB0aGlzRGVzYyAhPSBudWxsKXtcbiAgICAgICAgICAgICAgICAgIGZpbmFsRGVzY3JpcHRpb24gPSAnPGRpdiBjbGFzcz1cImRlc2NyaXB0aW9uXCI+Jyt0aGlzRGVzYysnPC9kaXY+JztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzRW5hYmxlZCl7XG5cbiAgICAgICAgICAgICAgICAgIGlmKGl0ZW1zZGF0YVtpXS5MaW5rVVJMICE9IG51bGwgJiYgaXRlbXNkYXRhW2ldLkxpbmtVUkwgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGlzVXJsID0gaXRlbXNkYXRhW2ldLkxpbmtVUkw7XG4gICAgICAgICAgICAgICAgICAgIGlmKG5ld1dpbmRvdyl7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpc1RpdGxlQnVpbGQgPSAnPGRpdiBjbGFzcz1cInRpdGxlXCI+PGEgaHJlZj1cIicgKyB0aGlzVXJsICsgJ1wiIGNsYXNzPVwibGVhcm5pbmdwbGFuLXRpdGxlXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JyArIHRoaXNUaXRsZSArICc8L2E+PC9kaXY+J1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXNUaXRsZUJ1aWxkID0gJzxkaXYgY2xhc3M9XCJ0aXRsZVwiPjxhIGhyZWY9XCInICsgdGhpc1VybCArICdcIiBjbGFzcz1cImxlYXJuaW5ncGxhbi10aXRsZVwiPicgKyB0aGlzVGl0bGUgKyAnPC9hPjwvZGl2PidcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICB2YXIgc1BhcmVudCA9ICc8ZGl2IGNsYXNzPVwibGVhcm5pbmdwbGFuLWl0ZW1cIiBkYXRhLWFscGhhLWZpbHRlcj1cIicrbGV0dGVyKydcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgdGhpc1RpdGxlQnVpbGQgK1xuICAgICAgICAgICAgICAgICAgICBjb3Vyc2VJRCArXG4gICAgICAgICAgICAgICAgICAgIGZpbmFsRGVzY3JpcHRpb24gK1xuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInRhZ3NcIj4nO1xuICAgICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gJyc7XG5cbiAgICAgICAgICAgICAgICAgIC8vZmlsdGVyIGRhdGFcblxuICAgICAgICAgICAgICAgICAgaWYoaXRlbXNkYXRhW2ldLkpvYkZhbWlseSAmJiBpdGVtc2RhdGFbaV0uSm9iRmFtaWx5Lmxlbmd0aClcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbXMgKz0gJzxzcGFuIGNsYXNzPVwiSm9iRmFtaWx5XCI+JyArIGl0ZW1zZGF0YVtpXS5Kb2JGYW1pbHkgKyAnPC9zcGFuPic7XG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlSm9iRmFtaWx5LnB1c2goaXRlbXNkYXRhW2ldLkpvYkZhbWlseSk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGlmKGl0ZW1zZGF0YVtpXS5GdW5jdGlvbmFsQ29tbXVuaXR5ICYmIGl0ZW1zZGF0YVtpXS5GdW5jdGlvbmFsQ29tbXVuaXR5Lmxlbmd0aClcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbXMgKz0gJzxzcGFuIGNsYXNzPVwiRnVuY3Rpb25hbENvbW11bml0eVwiPicgKyBpdGVtc2RhdGFbaV0uRnVuY3Rpb25hbENvbW11bml0eSArICc8L3NwYW4+JztcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VGdW5jdGlvbmFsQ29tbXVuaXR5LnB1c2goaXRlbXNkYXRhW2ldLkZ1bmN0aW9uYWxDb21tdW5pdHkpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBpZihpdGVtc2RhdGFbaV0uQ2FyZWVyVHJhY2sgJiYgaXRlbXNkYXRhW2ldLkNhcmVlclRyYWNrLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbXMgKz0gJzxzcGFuIGNsYXNzPVwiQ2FyZWVyVHJhY2tcIj4nICsgaXRlbXNkYXRhW2ldLkNhcmVlclRyYWNrICsgJzwvc3Bhbj4nO1xuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZUNhcmVlclRyYWNrLnB1c2goaXRlbXNkYXRhW2ldLkNhcmVlclRyYWNrKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgdmFyIGNQYXJlbnQgPSAnPC9kaXY+PC9kaXY+JztcblxuICAgICAgICAgICAgICAgICAgJChyZXN1bHRzQ29udGFpbmVyKS5hcHBlbmQoc1BhcmVudCArIGl0ZW1zICsgY1BhcmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICQocmVzdWx0c1BhcmVudENvbnRhaW5lcikuYXBwZW5kKCc8L2Rpdj4nKTtcbiAgICAgIHRoaXNjb250YWluZXIuYXBwZW5kKCc8L2Rpdj4nKTtcbiAgfSxcbiAgYnVpbGRBbHBoYWJldDogZnVuY3Rpb24gYnVpbGRBbHBoYWJldCgpXG4gIHtcbiAgICAkKHJlc3VsdHNOYXZpZ2F0aW9uQ29udGFpbmVyKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJhbHBoYWJldFwiPicgK1xuICAgICAgJzx1bD4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJhbGxcIiBjbGFzcz1cImFjdGl2ZVwiPkFsbDwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImFcIj5BPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiYlwiPkI8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJjXCI+QzwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImRcIj5EPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiZVwiPkU8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJmXCI+RjwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImdcIj5HPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiaFwiPkg8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJpXCI+STwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImpcIj5KPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwia1wiPks8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJsXCI+TDwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cIm1cIj5NPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiblwiPk48L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJvXCI+TzwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInBcIj5QPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwicVwiPlE8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJyXCI+UjwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInNcIj5TPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwidFwiPlQ8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ1XCI+VTwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInZcIj5WPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwid1wiPlc8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ4XCI+WDwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInlcIj5ZPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwielwiPlo8L2E+PC9saT4nICtcbiAgICAgICc8L3VsPicgK1xuICAgICAgJzwvZGl2PicpO1xuICAgICAgJCgnI2xlYXJuaW5ncGxhbnMtY29udGFpbmVyJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cImFscGhhLWZpbHRlclwiPjxkaXYgY2xhc3M9XCJhbHBoYWJldCBtb2JpbGUtYWxwaGFiZXRcIj48ZGl2IGNsYXNzPVwibW9iaWxlLWFscGhhLXRyaWdnZXJcIj48c3BhbiBjbGFzcz1cImFycm93XCI+PGkgY2xhc3M9XCJmYSBmYS1hbmdsZS1kb3duXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjwvc3Bhbj48L2Rpdj4nICtcbiAgICAgICAgJzx1bCBjbGFzcz1cIm1vYmlsZS1hbHBoYS1saXN0XCI+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJhbGxcIiBjbGFzcz1cImFjdGl2ZVwiPkFsbDwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiYVwiPkE8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImJcIj5CPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJjXCI+QzwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiZFwiPkQ8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImVcIj5FPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJmXCI+RjwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiZ1wiPkc8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImhcIj5IPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJpXCI+STwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwialwiPko8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImtcIj5LPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJsXCI+TDwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwibVwiPk08L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cIm5cIj5OPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJvXCI+TzwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwicFwiPlA8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInFcIj5RPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJyXCI+UjwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwic1wiPlM8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInRcIj5UPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ1XCI+VTwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwidlwiPlY8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cIndcIj5XPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ4XCI+WDwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwieVwiPlk8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInpcIj5aPC9hPjwvbGk+JyArXG4gICAgICAgICc8L3VsPicgK1xuICAgICAgICAnPC9kaXY+PC9kaXY+Jyk7XG4gIH0sXG4gIGJ1aWxkUmVmaW5lbWVudDogZnVuY3Rpb24gYnVpbGRSZWZpbmVtZW50KClcbiAge1xuXG4gICAgcmVzb3VyY2VKb2JGYW1pbHkuc29ydCgpO1xuICAgIHJlc291cmNlRnVuY3Rpb25hbENvbW11bml0eS5zb3J0KCk7XG4gICAgcmVzb3VyY2VDYXJlZXJUcmFjay5zb3J0KCk7XG5cbiAgICAkKGZpbHRlclBhcmVudENvbnRhaW5lcikuYXBwZW5kKCc8ZGl2IGlkPVwiYWxsLWZpbHRlclwiIGNsYXNzPVwiZmlsdGVyLWdyb3VwXCIgY2xhc3M9XCJvcGVuZWRcIj4nICtcbiAgICAgICc8dWwgY2xhc3M9XCJmaWx0ZXItZ3JvdXAtb3B0aW9uc1wiPjxsaSBkYXRhLWZpbHRlcj1cImFsbFwiIGNsYXNzPVwiYWN0aXZlXCI+PGRpdiBjbGFzcz1cImZpbHRlci1jaGVja2JveFwiPjwvZGl2PjxkaXYgY2xhc3M9XCJmaWx0ZXItdGl0bGVcIj5WSUVXIEFMTDwvZGl2PjwvbGk+PC91bD48L2Rpdj4nKTtcblxuICAgICQoZmlsdGVyUGFyZW50Q29udGFpbmVyKS5hcHBlbmQoJzxkaXYgaWQ9XCJqb2ItZmFtaWx5XCIgY2xhc3M9XCJmaWx0ZXItZ3JvdXBcIiBjbGFzcz1cIm9wZW5lZFwiPicgK1xuICAgICAgJzxoMyBjbGFzcz1cImZpbHRlci1ncm91cC10aXRsZVwiPkpvYiBGYW1pbHk8L2gzPicgK1xuICAgICAgICAnPHVsIGNsYXNzPVwiZmlsdGVyLWdyb3VwLW9wdGlvbnNcIj4nKTtcbiAgICAgICAgZWFuZHN1cGxhbnMuZ2V0VW5pcXVlUmVzdWx0cyhyZXNvdXJjZUpvYkZhbWlseSkuZm9yRWFjaChmdW5jdGlvbihKb2JGYW1pbHkpIHtcbiAgICAgICAgICBlYW5kc3VwbGFucy5hZGRSZWZpbmVtZW50SXRlbShKb2JGYW1pbHksICdqb2ItZmFtaWx5Jyk7XG4gICAgICAgIH0pO1xuICAgICQoZmlsdGVyUGFyZW50Q29udGFpbmVyKS5hcHBlbmQoJzwvdWw+PC9kaXY+Jyk7XG5cbiAgICAgICQoZmlsdGVyUGFyZW50Q29udGFpbmVyKS5hcHBlbmQoJzxkaXYgaWQ9XCJmdW5jdGlvbmFsLWNvbW11bml0eVwiIGNsYXNzPVwiZmlsdGVyLWdyb3VwXCIgY2xhc3M9XCJvcGVuZWRcIj4nICtcbiAgICAgICAgJzxoMyBjbGFzcz1cImZpbHRlci1ncm91cC10aXRsZVwiPkZ1bmN0aW9uYWwgQ29tbXVuaXR5PC9oMz4nICtcbiAgICAgICAgICAnPHVsIGNsYXNzPVwiZmlsdGVyLWdyb3VwLW9wdGlvbnNcIj4nKTtcbiAgICAgICAgICBlYW5kc3VwbGFucy5nZXRVbmlxdWVSZXN1bHRzKHJlc291cmNlRnVuY3Rpb25hbENvbW11bml0eSkuZm9yRWFjaChmdW5jdGlvbihGdW5jdGlvbmFsQ29tbXVuaXR5KSB7XG4gICAgICAgICAgICBlYW5kc3VwbGFucy5hZGRSZWZpbmVtZW50SXRlbShGdW5jdGlvbmFsQ29tbXVuaXR5LCAnZnVuY3Rpb25hbC1jb21tdW5pdHknKTtcbiAgICAgICAgICB9KTtcbiAgICAgICQoZmlsdGVyUGFyZW50Q29udGFpbmVyKS5hcHBlbmQoJzwvdWw+PC9kaXY+Jyk7XG5cbiAgICAgICQoZmlsdGVyUGFyZW50Q29udGFpbmVyKS5hcHBlbmQoJzxkaXYgaWQ9XCJjYXJlZXItdHJhY2tcIiBjbGFzcz1cImZpbHRlci1ncm91cFwiIGNsYXNzPVwib3BlbmVkXCI+JyArXG4gICAgICAgICc8aDMgY2xhc3M9XCJmaWx0ZXItZ3JvdXAtdGl0bGVcIj5DYXJlZXIgVHJhY2s8L2gzPicgK1xuICAgICAgICAgICc8dWwgY2xhc3M9XCJmaWx0ZXItZ3JvdXAtb3B0aW9uc1wiPicpO1xuICAgICAgICAgIGVhbmRzdXBsYW5zLmdldFVuaXF1ZVJlc3VsdHMocmVzb3VyY2VDYXJlZXJUcmFjaykuZm9yRWFjaChmdW5jdGlvbihDYXJlZXJUcmFjaykge1xuICAgICAgICAgICAgZWFuZHN1cGxhbnMuYWRkUmVmaW5lbWVudEl0ZW0oQ2FyZWVyVHJhY2ssICdjYXJlZXItdHJhY2snKTtcbiAgICAgICAgICB9KTtcbiAgICAgICQoZmlsdGVyUGFyZW50Q29udGFpbmVyKS5hcHBlbmQoJzwvdWw+PC9kaXY+Jyk7XG4gIH0sXG4gIGFkZFJlZmluZW1lbnRJdGVtOiBmdW5jdGlvbiBhZGRSZWZpbmVtZW50SXRlbSh0YWcsIGlkKVxuICB7XG4gICAgJCgnIycgKyBpZCArICc+IHVsJykuYXBwZW5kKCc8bGkgZGF0YS1maWx0ZXI9XCInICsgdGFnICsgJ1wiPicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJmaWx0ZXItY2hlY2tib3hcIj48L2Rpdj4nICtcbiAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJmaWx0ZXItdGl0bGVcIj4nICsgdGFnICsgJzwvZGl2PicgK1xuICAgICAgICAgICc8L2xpPicpO1xuICB9LFxuICBmaWx0ZXJSZXN1bHRzQnlBbHBoYWJldDogZnVuY3Rpb24gZmlsdGVyUmVzdWx0c0J5QWxwaGFiZXQoKSB7XG5cbiAgICAkKCcubW9iaWxlLWFscGhhLXRyaWdnZXInKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgJCgnLm1vYmlsZS1hbHBoYS1saXN0JykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgJCh0aGlzKS5uZXh0KCkuZmluZCgnYScpLmFkZENsYXNzKCdtb2JpbGUtYWN0aXZlJyk7XG4gICAgfSlcblxuICAgIHZhciBfYWxwaGFiZXRzID0gJCgnLmFscGhhYmV0ID4gdWwgPiBsaSA+IGEnKTtcblxuICAgIF9hbHBoYWJldHMuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgdmFsdWUgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtYWxwaGEnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgdmFyIGhhc2ggPSAnIycgKyB2YWx1ZTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gaGFzaDtcbiAgICB9KTtcbiAgfSxcbiAgZmlsdGVyUmVzdWx0c0J5UmVmaW5lbWVudDogZnVuY3Rpb24gZmlsdGVyUmVzdWx0c0J5UmVmaW5lbWVudCgpIHtcblxuICAgICQoJy5maWx0ZXItdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oKXtcbiAgICAgIGlmKCQodGhpcykuaGFzQ2xhc3MoJ2FjdGl2ZScpKSB7XG4gICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAkKCcuZmlsdGVyLWNvbHVtbicpLnNsaWRlVXAoNDAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAkKCcuZmlsdGVyLWNvbHVtbicpLnNsaWRlRG93big0MDApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIF9yZWZpbmVtZW50cyA9ICQoJy5maWx0ZXItZ3JvdXAgPiB1bCA+IGxpJyk7XG5cbiAgICBfcmVmaW5lbWVudHMuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdmFsdWUgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtZmlsdGVyJykudG9Mb3dlckNhc2UoKTtcbiAgICAgIHZhciBhY3RpdmVGaWx0ZXJzID0gJ2FsbCc7XG5cbiAgICAgIGlmKHZhbHVlICE9ICdhbGwnKSB7XG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJyk7XG4gICAgICAgICQoJ1tkYXRhLWZpbHRlcj1cImFsbFwiXScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgYWN0aXZlRmlsdGVycyA9ICcnO1xuXG4gICAgICAgIC8vIHN0b3JlIGFueSByZW1haW5pbmcgYWN0aXZlIGZpbHRlcnMgaW4gYXJyYXlcbiAgICAgICAgICAgICQoJ1tkYXRhLWZpbHRlcl0uYWN0aXZlJykuZWFjaChmdW5jdGlvbihpKXtcbiAgICAgICAgICAgICAgdmFyIHRoaXNBY3RpdmVGaWx0ZXIgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtZmlsdGVyJyk7XG4gICAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICBhY3RpdmVGaWx0ZXJzID0gYWN0aXZlRmlsdGVycy5jb25jYXQoXCIsXCIgKyB0aGlzQWN0aXZlRmlsdGVyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhY3RpdmVGaWx0ZXJzID0gYWN0aXZlRmlsdGVycy5jb25jYXQodGhpc0FjdGl2ZUZpbHRlcik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAvLyBlczYgbWV0aG9kIGFjdGl2ZUZpbHRlcnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWZpbHRlcl0uYWN0aXZlJykpLm1hcChpdGVtID0+IGl0ZW0uZGF0YXNldC5maWx0ZXIpO1xuICAgICAgICB9XG5cbiAgICAgIHZhciBoYXNoID0gJyMnICsgYWN0aXZlRmlsdGVycztcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gaGFzaDtcbiAgICB9KTtcbiAgfSxcbiAgZ2V0VW5pcXVlUmVzdWx0czogZnVuY3Rpb24gZ2V0VW5pcXVlUmVzdWx0cyhhcnIpXG4gIHtcbiAgICB2YXIgdW5pcXVlQXJyYXkgPSBhcnIuZmlsdGVyKGZ1bmN0aW9uKGVsZW0sIHBvcywgYXJyKSB7XG4gICAgICByZXR1cm4gYXJyLmluZGV4T2YoZWxlbSkgPT0gcG9zO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHVuaXF1ZUFycmF5O1xuICB9LFxuICByZXNldFdlYlBhcnQ6IGZ1bmN0aW9uIHJlc2V0V2ViUGFydCgpXG4gIHtcbiAgICB2YXIgY29udGFpbmVyID0gJyNsZWFybmluZ3BsYW5zLWNvbnRhaW5lcic7XG4gICAgdmFyIHRoaXNjb250YWluZXIgPSAkKGNvbnRhaW5lcik7XG4gICAgdGhpc2NvbnRhaW5lci5lbXB0eSgpO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvLyBza2VsZXRvbiBjb2RlIGZvciB3ZWIgcGFydFxuICBsb2FkOiBmdW5jdGlvbihvcHRpb25zKXtcbiAgICBsZXQgc2V0dGluZ3MgPSAkLmV4dGVuZCh0cnVlLCB7fSwge1xuICAgICAgY29udGFpbmVyOiAnJyxcbiAgICAgIG9yaWdpbmFsd2lkdGg6IDE2MDBcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIChmdW5jdGlvbigkKXtcbiAgICAgIHZhciB0aGlzTWFwID0gJChzZXR0aW5ncy5jb250YWluZXIpLmZpbmQoJ21hcCcpO1xuICAgICAgdmFyIHRoaXNBcmVhID0gJChzZXR0aW5ncy5jb250YWluZXIpLmZpbmQoJ2FyZWEnKTtcbiAgICAgIHZhciB0aGlzSW1hZ2UgPSAkKHNldHRpbmdzLmNvbnRhaW5lcikuZmluZCgnaW1nJyk7XG4gICAgICB2YXIgb3JpZ2luYWxDb29yZHMgPSBbXTtcbiAgXHQkKHRoaXNBcmVhKS5lYWNoKGZ1bmN0aW9uKGkpe1xuICBcdFx0b3JpZ2luYWxDb29yZHNbaV0gPSAkKHRoaXMpLmF0dHIoJ2Nvb3JkcycpO1xuICBcdFx0b3JpZ2luYWxDb29yZHNbaV0gPSBvcmlnaW5hbENvb3Jkc1tpXS5zcGxpdCgnLCcpO1xuICBcdH0pO1xuICBcdHZhciBuZXdXaWR0aCA9IHBhcnNlSW50KCQodGhpc0ltYWdlKS53aWR0aCgpKTtcbiAgXHR2YXIgcGVyY2VudERpZmZlcmVuY2UgPSBuZXdXaWR0aCAvIHNldHRpbmdzLm9yaWdpbmFsd2lkdGg7XG4gIFx0JCh0aGlzQXJlYSkuZWFjaChmdW5jdGlvbihpKXtcbiAgXHRcdHZhciBuZXdDb29yZHMgPSBbXTtcbiAgXHRcdCQuZWFjaChvcmlnaW5hbENvb3Jkc1tpXSxmdW5jdGlvbihlKXtcbiAgXHRcdFx0bmV3Q29vcmRzLnB1c2gob3JpZ2luYWxDb29yZHNbaV1bZV0gKiBwZXJjZW50RGlmZmVyZW5jZSk7XG4gIFx0XHR9KTtcbiAgXHRcdHZhciBuZXdDb29yZHMgPSBuZXdDb29yZHMuam9pbignLCcpO1xuICBcdFx0JCh0aGlzKS5hdHRyKCdjb29yZHMnLCBuZXdDb29yZHMpO1xuICBcdH0pO1xuICBcdC8vIHJlc2l6ZSB3aW5kb3dcbiAgXHQkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCl7XG4gIFx0XHR2YXIgbmV3V2lkdGggPSBwYXJzZUludCgkKHRoaXNJbWFnZSkud2lkdGgoKSk7XG4gIFx0XHR2YXIgcGVyY2VudERpZmZlcmVuY2UgPSBuZXdXaWR0aCAvIHNldHRpbmdzLm9yaWdpbmFsd2lkdGg7XG4gIFx0XHQkKHRoaXNBcmVhKS5lYWNoKGZ1bmN0aW9uKGkpe1xuICBcdFx0XHR2YXIgbmV3Q29vcmRzID0gW107XG4gIFx0XHRcdCQuZWFjaChvcmlnaW5hbENvb3Jkc1tpXSxmdW5jdGlvbihlKXtcbiAgXHRcdFx0XHRuZXdDb29yZHMucHVzaChvcmlnaW5hbENvb3Jkc1tpXVtlXSAqIHBlcmNlbnREaWZmZXJlbmNlKTtcbiAgXHRcdFx0fSk7XG4gIFx0XHRcdHZhciBuZXdDb29yZHMgPSBuZXdDb29yZHMuam9pbignLCcpO1xuICBcdFx0XHQkKHRoaXMpLmF0dHIoJ2Nvb3JkcycsIG5ld0Nvb3Jkcyk7XG4gIFx0XHR9KTtcbiAgXHR9KTtcbiAgICB9KGpRdWVyeSkpO1xuICB9XG59O1xuIiwiY29uc3QgbGlzdHMgPSB3aW5kb3cubGlzdHMgPSByZXF1aXJlKCcuL2xpc3RzJyk7XG5jb25zdCB1dGlsaXRpZXMgPSB3aW5kb3cudXRpbGl0aWVzID0gcmVxdWlyZSgnLi91dGlsaXRpZXMnKTtcblxudmFyIHJlc291cmNlVHlwZVRhZ3MgPSBbXTtcbnZhciByZXNvdXJjZUNvbmNlbnRyYXRpb25UYWdzID0gW107XG5cbnZhciBjb250YWluZXIgPSAnI2xlYXJuaW5ncGxhbnMtY29udGFpbmVyJztcbnZhciB0aGlzY29udGFpbmVyID0gJChjb250YWluZXIpO1xuXG52YXIgcmVzdWx0c1BhcmVudENvbnRhaW5lciA9ICcubGVhcm5pbmdwbGFucy1yZXN1bHRzLWNvbHVtbic7XG52YXIgcmVzdWx0c05hdmlnYXRpb25Db250YWluZXIgPSAnLmFscGhhLWZpbHRlcic7XG52YXIgcmVzdWx0c0NvbnRhaW5lciA9ICcucmVzdWx0cyc7XG52YXIgZmlsdGVyUGFyZW50Q29udGFpbmVyID0gJy5maWx0ZXItY29sdW1uJztcbnZhciBmaWx0ZXJDb250YWluZXIgPSAnLmZpbHRlci1ncm91cC1vcHRpb25zJztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gc2tlbGV0b24gY29kZSBmb3Igd2ViIHBhcnRcbiAgbG9hZDogZnVuY3Rpb24oKXtcblxuICAgIGxlYXJuaW5ncGxhbnMucmVzZXRXZWJQYXJ0KCk7XG4gICAgbGVhcm5pbmdwbGFucy5idWlsZFdlYlBhcnQoKTtcblxuICAgICB2YXIgY2hlY2tFeGlzdCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZigkKCcubGVhcm5pbmdwbGFuLWl0ZW0nKS5zaXplKCkgIT0gMCkge1xuICAgICAgICAgIGxlYXJuaW5ncGxhbnMuYnVpbGRSZWZpbmVtZW50KCk7XG4gICAgICAgICAgbGVhcm5pbmdwbGFucy5maWx0ZXJSZXN1bHRzQnlBbHBoYWJldCgpO1xuICAgICAgICAgIGxlYXJuaW5ncGxhbnMuZmlsdGVyUmVzdWx0c0J5UmVmaW5lbWVudCgpO1xuXG4gICAgICAgICAgLy8gc2F2ZSBkZXNjIG9yaWdpbmFsIGhlaWdodHMgZm9yIGFuaW1hdGlvblxuICAgICAgICAgICQoJy50cmltbWVkJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIHRoaXNIZWlnaHQgPSAkKHRoaXMpLmhlaWdodCgpO1xuICAgICAgICAgICAgJCh0aGlzKS5hdHRyKCdkYXRhLWhlaWdodCcsdGhpc0hlaWdodCk7XG4gICAgICAgICAgICAkKHRoaXMpLmNzcygnaGVpZ2h0JywnOTBweCcpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gc2hvdyBtb3JlIG9yIGxlc3MgZmVsbG93IGRlc2NyaXB0aW9uXG4gICAgICAgICAgJCgnLmRlc2NyaXB0aW9uLXRvZ2dsZS1saW5rJykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKCdkZXNjcmlwdGlvbi1tb3JlLWxpbmsnKSl7XG4gICAgICAgICAgICAgIHZhciB0aGlzT3JpZ0hlaWdodCA9ICQodGhpcykucGFyZW50KCkuZmluZCgnLnRyaW1tZWQnKS5hdHRyKCdkYXRhLWhlaWdodCcpO1xuICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJy50cmltbWVkJykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzT3JpZ0hlaWdodFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgJCh0aGlzKS5wcmV2KCkuaGlkZSgpO1xuICAgICAgICAgICAgICAkKHRoaXMpLmNzcygnb3BhY2l0eScsICcwJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIGhlaWdodDogOTBcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICQodGhpcykuY2xvc2VzdCgnLmRlc2NyaXB0aW9uJykuZmluZCgnLmRlc2NyaXB0aW9uLW1vcmUtbGluaycpLmNzcygnb3BhY2l0eScsICcxJyk7XG4gICAgICAgICAgICAgICQodGhpcykuY2xvc2VzdCgnLmRlc2NyaXB0aW9uJykuZmluZCgnLmRlc2NyaXB0aW9uLW92ZXJsYXknKS5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcblxuICAgICAgICAgIC8vIGhhc2ggY2hhbmdlXG4gICAgICAgICAgJCh3aW5kb3cpLm9uKCdoYXNoY2hhbmdlJywgZnVuY3Rpb24oZSl7XG5cbiAgICAgICAgICAgIC8vIGdldCBoYXNoXG4gICAgICAgICAgICB2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCAnJyk7XG4gICAgICAgICAgICBoYXNoID0gZGVjb2RlVVJJQ29tcG9uZW50KGhhc2gpO1xuXG4gICAgICAgICAgICB2YXIgX2FscGhhYmV0cyA9ICQoJy5hbHBoYWJldCA+IHVsID4gbGkgPiBhJyk7XG4gICAgICAgICAgICB2YXIgX3JlZmluZW1lbnRzID0gJCgnLmZpbHRlci1ncm91cCA+IHVsID4gbGknKTtcbiAgICAgICAgICAgIHZhciBfY29udGVudFJvd3MgPSAkKCcubGVhcm5pbmdwbGFuLWl0ZW0nKTtcbiAgICAgICAgICAgIHZhciBfY291bnQgPSAwO1xuXG4gICAgICAgICAgICBfY29udGVudFJvd3MuaGlkZSgpO1xuXG4gICAgICAgICAgICAkKCcubW9iaWxlLWFscGhhLWxpc3QnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAkKCcuYWxwaGFiZXQgPiB1bCA+IGxpID4gYScpLnJlbW92ZUNsYXNzKCdtb2JpbGUtYWN0aXZlJyk7XG5cbiAgICAgICAgICAgIGlmKGhhc2gubGVuZ3RoID09PSAwIHx8IGhhc2ggPT09ICdhbGwnKSB7XG4gICAgICAgICAgICAgIF9yZWZpbmVtZW50cy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICQoJ1tkYXRhLWZpbHRlcj1cImFsbFwiXScpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgJCgnLmNvdXJzZS1pbmZvLCAuc2VydmljZS1pbmZvJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgIF9hbHBoYWJldHMucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAkKCdbZGF0YS1hbHBoYT1cImFsbFwiXScpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgX2NvbnRlbnRSb3dzLmZhZGVJbig0MDApO1xuICAgICAgICAgICAgICBfY291bnQgPSBfY29udGVudFJvd3Muc2l6ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYoaGFzaC5sZW5ndGggPT09IDEpe1xuICAgICAgICAgICAgICAgIF9yZWZpbmVtZW50cy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtZmlsdGVyPVwiYWxsXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICQoJy5jb3Vyc2UtaW5mbywgLnNlcnZpY2UtaW5mbycpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIF9hbHBoYWJldHMucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICQoJ1tkYXRhLWFscGhhPVwiYWxsXCJdJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICQoJ1tkYXRhLWFscGhhLWZpbHRlcj1cIicraGFzaCsnXCJdJykuZmFkZUluKDQwMCk7XG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtYWxwaGE9XCInK2hhc2grJ1wiXScpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICBfY291bnQgPSAkKCdbZGF0YS1hbHBoYS1maWx0ZXI9XCInK2hhc2grJ1wiXScpLnNpemUoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfYWxwaGFiZXRzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS1hbHBoYT1cImFsbFwiXScpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICBfcmVmaW5lbWVudHMucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICQoJy5jb3Vyc2UtaW5mbywgLnNlcnZpY2UtaW5mbycpLnJlbW92ZSgpO1xuXG4gICAgICAgICAgICAgICAgLy8gc3RvcmUgZmlsdGVycyBpbiBhcnJheVxuICAgICAgICAgICAgICAgIHZhciBhY3RpdmVGaWx0ZXJzID0gaGFzaC5zcGxpdCgnLCcpO1xuXG4gICAgICAgICAgICAgICAgLy8gc2hvdyByZXN1bHRzIGJhc2VkIG9uIGFjdGl2ZSBmaWx0ZXIgYXJyYXlcbiAgICAgICAgICAgICAgICBfY29udGVudFJvd3MuZWFjaChmdW5jdGlvbihpKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgdGhlc2VUYWdzID0gW107XG5cbiAgICAgICAgICAgICAgICAgICQodGhpcykuZmluZCgnLnRhZ3Mgc3BhbicpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgdGhlc2VUYWdzLnB1c2godGhpcyk7XG4gICAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgICB2YXIgX2NlbGxUZXh0ID0gdGhlc2VUYWdzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLnRleHRDb250ZW50O1xuICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgdmFyIHRoaXNDb250YWlucyA9IGFjdGl2ZUZpbHRlcnMuZXZlcnkoZnVuY3Rpb24odmFsKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9jZWxsVGV4dC5pbmRleE9mKHZhbCkgPj0gMDtcbiAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAvKmZvciAodmFyIGZpbHRlcml0ZW0gb2YgYWN0aXZlRmlsdGVycykge1xuICAgICAgICAgICAgICAgICAgICAkKCdbZGF0YS1maWx0ZXI9XCInK2ZpbHRlcml0ZW0rJ1wiXScpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgIH0qL1xuXG4gICAgICAgICAgICAgICAgICB2YXIgYXJyYXlMZW5ndGggPSBhY3RpdmVGaWx0ZXJzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmlsdGVyaXRlbSA9IGFjdGl2ZUZpbHRlcnNbaV07XG4gICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLWZpbHRlcj1cIicgKyBmaWx0ZXJpdGVtICsgJ1wiXScpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgaWYodGhpc0NvbnRhaW5zKSB7XG4gICAgICAgICAgICAgICAgICAgIF9jb3VudCArPSAxO1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmZhZGVJbig0MDApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYoYWN0aXZlRmlsdGVycy5pbmNsdWRlcygnQ291cnNlJykpIHtcbiAgICAgICAgICAgICAgICAgICQoJzxkaXYgY2xhc3M9XCJjb3Vyc2UtaW5mbyBjb2wtc20tNlwiPlRvIGVucm9sbCBpbiBhIGNvdXJzZTo8YnIvPjxvbD48bGk+R28gdG8gPGEgaHJlZj1cImh0dHA6Ly9sZWFybi5iYWguY29tXCIgdGFyZ2V0PVwiX2JsYW5rXCI+TGVhcm48L2E+IChodHRwOi8vbGVhcm4uYmFoLmNvbSk8L2xpPjxsaT5TZWFyY2ggZm9yIHRoZSBjb3Vyc2UgYnkgY29kZSBvciB0aXRsZSBpbiB0aGUgPHN0cm9uZz5TZWFyY2ggZm9yIExlYXJuaW5nPC9zdHJvbmc+IGZpZWxkPC9saT48bGk+Q2xpY2sgb24gdGhlIGNvdXJzZSB0aXRsZSBhbmQgZm9sbG93IHByb21wdHM8L2xpPjwvb2w+PGJyLz48YnIvPjwvZGl2PicpLnByZXBlbmRUbygnLmluZm8tY29udGFpbmVyJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKGFjdGl2ZUZpbHRlcnMuaW5jbHVkZXMoJ1NlcnZpY2UgQmFzZWQgTGVhcm5pbmcgUGxhbicpKSB7XG4gICAgICAgICAgICAgICAgICAkKCc8ZGl2IGNsYXNzPVwic2VydmljZS1pbmZvIGNvbC1zbS02XCI+VG8gZW5yb2xsIGluIGEgU2VydmljZS1iYXNlZCBMZWFybmluZyBQbGFuOjxici8+PG9sPjxsaT5HbyB0byA8YSBocmVmPVwiaHR0cDovL2xlYXJuLmJhaC5jb21cIiB0YXJnZXQ9XCJfYmxhbmtcIj5MZWFybjwvYT4gKGh0dHA6Ly9sZWFybi5iYWguY29tKTwvbGk+PGxpPkNsaWNrIG9uIHRoZSA8c3Ryb25nPkxlYXJuaW5nIFBsYW5zPC9zdHJvbmc+IGJveDwvbGk+PGxpPkNsaWNrIHRoZSA8c3Ryb25nPlNlcnZpY2UgQmFzZWQgTGVhcm5pbmcgUGxhbnM8L3N0cm9uZz4gb3B0aW9uPC9saT48bGk+Q2xpY2sgb24gdGhlIDxzdHJvbmc+K0FkZCBQbGFuPC9zdHJvbmc+IGJveCB0byByZWdpc3RlcjwvbGk+PC9vbD48YnIvPjxici8+PC9kaXY+JykuYXBwZW5kVG8oJy5pbmZvLWNvbnRhaW5lcicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkKCcubm8tcmVzdWx0cycpLnJlbW92ZSgpO1xuXG4gICAgICAgICAgICBpZihfY291bnQgPT09IDApe1xuICAgICAgICAgICAgICAkKCc8ZGl2IGNsYXNzPVwibm8tcmVzdWx0c1wiPlRoZXJlIGFyZSBubyByZXN1bHRzLiA8YSBocmVmPVwiI1wiPlZJRVcgQUxMPC9hPjwvZGl2PicpLmFwcGVuZFRvKCcucmVzdWx0cycpO1xuICAgICAgICAgICAgICAkKCcuY291cnNlLWluZm8sIC5zZXJ2aWNlLWluZm8nKS5yZW1vdmUoKTtcblxuICAgICAgICAgICAgICAkKCcubm8tcmVzdWx0cyBhJykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIF9jb250ZW50Um93cy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgX2FscGhhYmV0cy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgX3JlZmluZW1lbnRzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS1hbHBoYT1cImFsbFwiXScpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS1maWx0ZXI9XCJhbGxcIl0nKS5hZGRDbGFzcygnYWN0aXZlJylcbiAgICAgICAgICAgICAgICBfY29udGVudFJvd3MuZmFkZUluKDQwMCk7XG4gICAgICAgICAgICAgICAgJCgnLm5vLXJlc3VsdHMnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB2YXIgaGFzaCA9ICcjYWxsJztcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGhhc2g7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgIGNsZWFySW50ZXJ2YWwoY2hlY2tFeGlzdCk7XG5cbiAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdoYXNoY2hhbmdlJyk7XG5cbiAgICAgICAgfVxuICAgICB9LCAxMDApO1xuXG4gIH0sXG4gIGJ1aWxkV2ViUGFydDogZnVuY3Rpb24gYnVpbGRXZWJQYXJ0KClcbiAge1xuICAgICAgLy8gUmVuZGVyIGZpbHRlcmluZyBjb2x1bW5cbiAgICAgIHRoaXNjb250YWluZXIuYXBwZW5kKCc8ZGl2IGNsYXNzPVwiZmlsdGVyLXRvZ2dsZVwiPjxpIGNsYXNzPVwiZmEgZmEtZmlsdGVyXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjxzcGFuIGNsYXNzPVwidGV4dFwiPkZpbHRlcjwvc3Bhbj48L2Rpdj48ZGl2IGNsYXNzPVwiZmlsdGVyLWNvbHVtbiBjb2wtbWQtM1wiPjwvZGl2PicpO1xuXG4gICAgICAvLyBSZW5kZXIgcmVzdWx0cyBjb2x1bW5cbiAgICAgIHRoaXNjb250YWluZXIuYXBwZW5kKCc8ZGl2IGNsYXNzPVwibGVhcm5pbmdwbGFucy1yZXN1bHRzLWNvbHVtbiBjb2wtbWQtOVwiPicpO1xuICAgICAgICAgIC8vIFJlbmRlciBhbHBoYWJldCBuYXZpZ2F0aW9uXG4gICAgICAgICAgJChyZXN1bHRzUGFyZW50Q29udGFpbmVyKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJhbHBoYS1maWx0ZXJcIj4nKTtcblxuICAgICAgICAgICAgbGVhcm5pbmdwbGFucy5idWlsZEFscGhhYmV0KCk7XG5cbiAgICAgICAgICAkKHJlc3VsdHNQYXJlbnRDb250YWluZXIpLmFwcGVuZCgnPC9kaXY+PGRpdiBjbGFzcz1cInJvdyBuby1ndXR0ZXIgaW5mby1jb250YWluZXJcIj48L2Rpdj4nKTtcbiAgICAgICAgICAvLyBSZW5kZXIgcmVzdWx0cyBwYW5lbFxuICAgICAgICAgICQocmVzdWx0c1BhcmVudENvbnRhaW5lcikuYXBwZW5kKCc8ZGl2IGNsYXNzPVwicmVzdWx0c1wiPicpO1xuXG4gICAgICAgICAgICAvLyBSZW5kZXIgcmVzdWx0c1xuICAgICAgICAgICAgbGlzdHMuZ2V0TGlzdEl0ZW1zKHtcbiAgICAgICAgICAgICAgbGlzdG5hbWU6ICdMZWFybmluZyBQbGFucyBhbmQgQ291cnNlcycsIC8vbGlzdG5hbWUsXG4gICAgICAgICAgICAgIGZpZWxkczogJ1RpdGxlLERlc2MsSFRNTERlc2NyaXB0aW9uLEVuYWJsZWQsTGlua1VSTCxJZCxPcGVuTGlua0luTmV3V2luZG93LENvdXJzZUlELFJlc291cmNlVHlwZSxSZXNvdXJjZUNvbmNlbnRyYXRpb24nLFxuICAgICAgICAgICAgICBvcmRlcmJ5OiAnVGl0bGUnXG4gICAgICAgICAgICB9LGZ1bmN0aW9uKGl0ZW1zKXtcbiAgICAgICAgICAgICAgdmFyIGl0ZW1zZGF0YSA9IGl0ZW1zLmQucmVzdWx0cztcbiAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtc2RhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgdGhpc1RpdGxlID0gaXRlbXNkYXRhW2ldLlRpdGxlO1xuICAgICAgICAgICAgICAgIHZhciB0aGlzRGVzYyA9IGl0ZW1zZGF0YVtpXS5EZXNjO1xuICAgICAgICAgICAgICAgIHZhciB0aGlzSFRNTCA9IGl0ZW1zZGF0YVtpXS5IVE1MRGVzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgdmFyIHRoaXNFbmFibGVkID0gaXRlbXNkYXRhW2ldLkVuYWJsZWQ7XG4gICAgICAgICAgICAgICAgdmFyIHRoaXNJRCA9IGl0ZW1zZGF0YVtpXS5JZDtcbiAgICAgICAgICAgICAgICB2YXIgbmV3V2luZG93ID0gaXRlbXNkYXRhW2ldLk9wZW5MaW5rSW5OZXdXaW5kb3c7XG4gICAgICAgICAgICAgICAgdmFyIHRoaXNDb3Vyc2VJRCA9IGl0ZW1zZGF0YVtpXS5Db3Vyc2VJRDtcbiAgICAgICAgICAgICAgICB2YXIgY291cnNlSUQgPSAnJztcbiAgICAgICAgICAgICAgICBpZih0aGlzQ291cnNlSUQgIT0gdW5kZWZpbmVkIHx8IHRoaXNDb3Vyc2VJRCAhPSBudWxsKXtcbiAgICAgICAgICAgICAgICAgIGNvdXJzZUlEID0gJzxkaXYgY2xhc3M9XCJjb3Vyc2UtaWRcIj4nK3RoaXNDb3Vyc2VJRCsnPC9kaXY+JztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgbGV0dGVyID0gdGhpc1RpdGxlLnRvTG93ZXJDYXNlKCkuc3Vic3RyaW5nKDAsMSk7XG4gICAgICAgICAgICAgICAgdmFyIGZpbmFsRGVzY3JpcHRpb24gPSAnJztcbiAgICAgICAgICAgICAgICB2YXIgdGhpc1RpdGxlQnVpbGQgPSAnPGRpdiBjbGFzcz1cInRpdGxlXCI+Jyt0aGlzVGl0bGUrJzwvZGl2Pic7XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzRGVzYyAhPSB1bmRlZmluZWQgfHwgdGhpc0Rlc2MgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICBmaW5hbERlc2NyaXB0aW9uID0gJzxkaXYgY2xhc3M9XCJkZXNjcmlwdGlvblwiPicrdGhpc0Rlc2MrJzwvZGl2Pic7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGlmKHRoaXNIVE1MICE9IHVuZGVmaW5lZCB8fCB0aGlzSFRNTCAhPSBudWxsKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNIVE1MdGV4dCA9ICQoJzxkaXY+Jyt0aGlzSFRNTCsnPC9kaXY+JykudGV4dCgpLnRyaW0oKS5yZXBsYWNlKC9cXHUyMDBCL2csJycpLnJlcGxhY2UoLyAvZywgJycpLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpc0hUTUx0ZXh0ICE9IDApe1xuICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXNIVE1MdGV4dCA+IDMwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxEZXNjcmlwdGlvbiA9ICc8ZGl2IGNsYXNzPVwiZGVzY3JpcHRpb25cIj48ZGl2IGNsYXNzPVwiZGVzYy1pbm5lciB0cmltbWVkXCI+Jyt0aGlzSFRNTCsnPGJyLz48YSBocmVmPVwiI1wiIGNsYXNzPVwiZGVzY3JpcHRpb24tbGVzcy1saW5rIGRlc2NyaXB0aW9uLXRvZ2dsZS1saW5rXCI+VmlldyBMZXNzPC9hPjwvZGl2PjxkaXYgY2xhc3M9XCJkZXNjcmlwdGlvbi1vdmVybGF5XCI+PC9kaXY+PGEgaHJlZj1cIiNcIiBjbGFzcz1cImRlc2NyaXB0aW9uLW1vcmUtbGluayBkZXNjcmlwdGlvbi10b2dnbGUtbGlua1wiPlZpZXcgTW9yZTwvYT48L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5hbERlc2NyaXB0aW9uID0gJzxkaXYgY2xhc3M9XCJkZXNjcmlwdGlvblwiPicrdGhpc0hUTUwrJzwvZGl2Pic7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYodGhpc0VuYWJsZWQpe1xuXG4gICAgICAgICAgICAgICAgICBpZihpdGVtc2RhdGFbaV0uTGlua1VSTCAhPSBudWxsICYmIGl0ZW1zZGF0YVtpXS5MaW5rVVJMICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc1VybCA9IGl0ZW1zZGF0YVtpXS5MaW5rVVJMLlVybDtcbiAgICAgICAgICAgICAgICAgICAgaWYobmV3V2luZG93KXtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzVGl0bGVCdWlsZCA9ICc8ZGl2IGNsYXNzPVwidGl0bGVcIj48YSBocmVmPVwiJyArIHRoaXNVcmwgKyAnXCIgY2xhc3M9XCJsZWFybmluZ3BsYW4tdGl0bGVcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nICsgdGhpc1RpdGxlICsgJzwvYT48L2Rpdj4nXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpc1RpdGxlQnVpbGQgPSAnPGRpdiBjbGFzcz1cInRpdGxlXCI+PGEgaHJlZj1cIicgKyB0aGlzVXJsICsgJ1wiIGNsYXNzPVwibGVhcm5pbmdwbGFuLXRpdGxlXCI+JyArIHRoaXNUaXRsZSArICc8L2E+PC9kaXY+J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIHZhciBzUGFyZW50ID0gJzxkaXYgY2xhc3M9XCJsZWFybmluZ3BsYW4taXRlbVwiIGRhdGEtYWxwaGEtZmlsdGVyPVwiJytsZXR0ZXIrJ1wiPicgK1xuICAgICAgICAgICAgICAgICAgICB0aGlzVGl0bGVCdWlsZCArXG4gICAgICAgICAgICAgICAgICAgIGNvdXJzZUlEICtcbiAgICAgICAgICAgICAgICAgICAgZmluYWxEZXNjcmlwdGlvbiArXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwidGFnc1wiPic7XG4gICAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSAnJztcblxuICAgICAgICAgICAgICAgICAgaWYoaXRlbXNkYXRhW2ldLlJlc291cmNlVHlwZS5yZXN1bHRzLmxlbmd0aCA+PSAxICYmIGl0ZW1zZGF0YVtpXS5SZXNvdXJjZVR5cGUucmVzdWx0cyAhPSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGlzVHlwZUFyciA9IGl0ZW1zZGF0YVtpXS5SZXNvdXJjZVR5cGUucmVzdWx0cztcblxuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGo9MDsgaiA8IHRoaXNUeXBlQXJyLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNUeXBlID0gdGhpc1R5cGVBcnJbal0uTGFiZWw7XG4gICAgICAgICAgICAgICAgICAgICAgaXRlbXMgKz0gJzxzcGFuIGNsYXNzPVwidHlwZVwiPicgKyB0aGlzVHlwZSArICc8L3NwYW4+JztcbiAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZVR5cGVUYWdzLnB1c2godGhpc1R5cGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGlmKGl0ZW1zZGF0YVtpXS5SZXNvdXJjZUNvbmNlbnRyYXRpb24ucmVzdWx0cy5sZW5ndGggPj0gMSAmJiBpdGVtc2RhdGFbaV0uUmVzb3VyY2VDb25jZW50cmF0aW9uLnJlc3VsdHMgIT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc0NvbmNlbnRyYXRpb25BcnIgPSBpdGVtc2RhdGFbaV0uUmVzb3VyY2VDb25jZW50cmF0aW9uLnJlc3VsdHM7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBqPTA7IGogPCB0aGlzQ29uY2VudHJhdGlvbkFyci5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgIHZhciB0aGlzQ29uY2VudHJhdGlvbiA9IHRoaXNDb25jZW50cmF0aW9uQXJyW2pdLkxhYmVsO1xuICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zICs9ICc8c3BhbiBjbGFzcz1cImNvbmNlbnRyYXRpb25cIj4nICsgdGhpc0NvbmNlbnRyYXRpb24gKyAnPC9zcGFuPic7XG4gICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VDb25jZW50cmF0aW9uVGFncy5wdXNoKHRoaXNDb25jZW50cmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICB2YXIgY1BhcmVudCA9ICc8L2Rpdj48L2Rpdj4nO1xuXG4gICAgICAgICAgICAgICAgICAkKHJlc3VsdHNDb250YWluZXIpLmFwcGVuZChzUGFyZW50ICsgaXRlbXMgKyBjUGFyZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgJChyZXN1bHRzUGFyZW50Q29udGFpbmVyKS5hcHBlbmQoJzwvZGl2PicpO1xuICAgICAgdGhpc2NvbnRhaW5lci5hcHBlbmQoJzwvZGl2PicpO1xuICB9LFxuICBidWlsZEFscGhhYmV0OiBmdW5jdGlvbiBidWlsZEFscGhhYmV0KClcbiAge1xuICAgICQocmVzdWx0c05hdmlnYXRpb25Db250YWluZXIpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImFscGhhYmV0XCI+JyArXG4gICAgICAnPHVsPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImFsbFwiIGNsYXNzPVwiYWN0aXZlXCI+QWxsPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiYVwiPkE8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJiXCI+QjwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImNcIj5DPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiZFwiPkQ8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJlXCI+RTwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImZcIj5GPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiZ1wiPkc8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJoXCI+SDwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImlcIj5JPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwialwiPko8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJrXCI+SzwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImxcIj5MPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwibVwiPk08L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJuXCI+TjwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cIm9cIj5PPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwicFwiPlA8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJxXCI+UTwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInJcIj5SPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwic1wiPlM8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ0XCI+VDwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInVcIj5VPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwidlwiPlY8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ3XCI+VzwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInhcIj5YPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwieVwiPlk8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ6XCI+WjwvYT48L2xpPicgK1xuICAgICAgJzwvdWw+JyArXG4gICAgICAnPC9kaXY+Jyk7XG4gICAgICAkKCcjbGVhcm5pbmdwbGFucy1jb250YWluZXInKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiYWxwaGEtZmlsdGVyXCI+PGRpdiBjbGFzcz1cImFscGhhYmV0IG1vYmlsZS1hbHBoYWJldFwiPjxkaXYgY2xhc3M9XCJtb2JpbGUtYWxwaGEtdHJpZ2dlclwiPjxzcGFuIGNsYXNzPVwiYXJyb3dcIj48aSBjbGFzcz1cImZhIGZhLWFuZ2xlLWRvd25cIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+PC9zcGFuPjwvZGl2PicgK1xuICAgICAgICAnPHVsIGNsYXNzPVwibW9iaWxlLWFscGhhLWxpc3RcIj4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImFsbFwiIGNsYXNzPVwiYWN0aXZlXCI+QWxsPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJhXCI+QTwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiYlwiPkI8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImNcIj5DPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJkXCI+RDwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiZVwiPkU8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImZcIj5GPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJnXCI+RzwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiaFwiPkg8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImlcIj5JPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJqXCI+SjwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwia1wiPks8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImxcIj5MPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJtXCI+TTwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiblwiPk48L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cIm9cIj5PPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJwXCI+UDwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwicVwiPlE8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInJcIj5SPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJzXCI+UzwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwidFwiPlQ8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInVcIj5VPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ2XCI+VjwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwid1wiPlc8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInhcIj5YPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ5XCI+WTwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwielwiPlo8L2E+PC9saT4nICtcbiAgICAgICAgJzwvdWw+JyArXG4gICAgICAgICc8L2Rpdj48L2Rpdj4nKTtcbiAgfSxcbiAgYnVpbGRSZWZpbmVtZW50OiBmdW5jdGlvbiBidWlsZFJlZmluZW1lbnQoKVxuICB7XG5cbiAgICByZXNvdXJjZVR5cGVUYWdzLnNvcnQoKTtcbiAgICByZXNvdXJjZUNvbmNlbnRyYXRpb25UYWdzLnNvcnQoKTtcblxuICAgICQoZmlsdGVyUGFyZW50Q29udGFpbmVyKS5hcHBlbmQoJzxkaXYgaWQ9XCJhbGwtZmlsdGVyXCIgY2xhc3M9XCJmaWx0ZXItZ3JvdXBcIiBjbGFzcz1cIm9wZW5lZFwiPicgK1xuICAgICAgJzx1bCBjbGFzcz1cImZpbHRlci1ncm91cC1vcHRpb25zXCI+PGxpIGRhdGEtZmlsdGVyPVwiYWxsXCIgY2xhc3M9XCJhY3RpdmVcIj48ZGl2IGNsYXNzPVwiZmlsdGVyLWNoZWNrYm94XCI+PC9kaXY+PGRpdiBjbGFzcz1cImZpbHRlci10aXRsZVwiPlZJRVcgQUxMPC9kaXY+PC9saT48L3VsPjwvZGl2PicpO1xuXG4gICAgJChmaWx0ZXJQYXJlbnRDb250YWluZXIpLmFwcGVuZCgnPGRpdiBpZD1cInJlc291cmNlLXR5cGVcIiBjbGFzcz1cImZpbHRlci1ncm91cFwiIGNsYXNzPVwib3BlbmVkXCI+JyArXG4gICAgICAnPGgzIGNsYXNzPVwiZmlsdGVyLWdyb3VwLXRpdGxlXCI+UmVzb3VyY2UgVHlwZTwvaDM+JyArXG4gICAgICAgICc8dWwgY2xhc3M9XCJmaWx0ZXItZ3JvdXAtb3B0aW9uc1wiPicpO1xuICAgICAgICBsZWFybmluZ3BsYW5zLmdldFVuaXF1ZVJlc3VsdHMocmVzb3VyY2VUeXBlVGFncykuZm9yRWFjaChmdW5jdGlvbihyZXNvdXJjZVR5cGUpIHtcbiAgICAgICAgICBsZWFybmluZ3BsYW5zLmFkZFJlZmluZW1lbnRJdGVtKHJlc291cmNlVHlwZSwgJ3Jlc291cmNlLXR5cGUnKTtcbiAgICAgICAgfSk7XG4gICAgJChmaWx0ZXJQYXJlbnRDb250YWluZXIpLmFwcGVuZCgnPC91bD48L2Rpdj4nKTtcblxuICAgICAgJChmaWx0ZXJQYXJlbnRDb250YWluZXIpLmFwcGVuZCgnPGRpdiBpZD1cImNvbmNlbnRyYXRpb25cIiBjbGFzcz1cImZpbHRlci1ncm91cFwiIGNsYXNzPVwib3BlbmVkXCI+JyArXG4gICAgICAgICc8aDMgY2xhc3M9XCJmaWx0ZXItZ3JvdXAtdGl0bGVcIj5EZXBhcnRtZW50PC9oMz4nICtcbiAgICAgICAgICAnPHVsIGNsYXNzPVwiZmlsdGVyLWdyb3VwLW9wdGlvbnNcIj4nKTtcbiAgICAgICAgICBsZWFybmluZ3BsYW5zLmdldFVuaXF1ZVJlc3VsdHMocmVzb3VyY2VDb25jZW50cmF0aW9uVGFncykuZm9yRWFjaChmdW5jdGlvbihyZXNvdXJjZUNvbmNlbnRyYXRpb24pIHtcbiAgICAgICAgICAgIGxlYXJuaW5ncGxhbnMuYWRkUmVmaW5lbWVudEl0ZW0ocmVzb3VyY2VDb25jZW50cmF0aW9uLCAnY29uY2VudHJhdGlvbicpO1xuICAgICAgICAgIH0pO1xuICAgICAgJChmaWx0ZXJQYXJlbnRDb250YWluZXIpLmFwcGVuZCgnPC91bD48L2Rpdj4nKTtcbiAgfSxcbiAgYWRkUmVmaW5lbWVudEl0ZW06IGZ1bmN0aW9uIGFkZFJlZmluZW1lbnRJdGVtKHRhZywgaWQpXG4gIHtcbiAgICAkKCcjJyArIGlkICsgJz4gdWwnKS5hcHBlbmQoJzxsaSBkYXRhLWZpbHRlcj1cIicgKyB0YWcgKyAnXCI+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImZpbHRlci1jaGVja2JveFwiPjwvZGl2PicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImZpbHRlci10aXRsZVwiPicgKyB0YWcgKyAnPC9kaXY+JyArXG4gICAgICAgICAgJzwvbGk+Jyk7XG4gIH0sXG4gIGZpbHRlclJlc3VsdHNCeUFscGhhYmV0OiBmdW5jdGlvbiBmaWx0ZXJSZXN1bHRzQnlBbHBoYWJldCgpIHtcblxuICAgICQoJy5tb2JpbGUtYWxwaGEtdHJpZ2dlcicpLmNsaWNrKGZ1bmN0aW9uKCl7XG4gICAgICAkKCcubW9iaWxlLWFscGhhLWxpc3QnKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAkKHRoaXMpLm5leHQoKS5maW5kKCdhJykuYWRkQ2xhc3MoJ21vYmlsZS1hY3RpdmUnKTtcbiAgICB9KVxuXG4gICAgdmFyIF9hbHBoYWJldHMgPSAkKCcuYWxwaGFiZXQgPiB1bCA+IGxpID4gYScpO1xuXG4gICAgX2FscGhhYmV0cy5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciB2YWx1ZSA9ICQodGhpcykuYXR0cignZGF0YS1hbHBoYScpLnRvTG93ZXJDYXNlKCk7XG4gICAgICB2YXIgaGFzaCA9ICcjJyArIHZhbHVlO1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBoYXNoO1xuICAgIH0pO1xuICB9LFxuICBmaWx0ZXJSZXN1bHRzQnlSZWZpbmVtZW50OiBmdW5jdGlvbiBmaWx0ZXJSZXN1bHRzQnlSZWZpbmVtZW50KCkge1xuXG4gICAgJCgnLmZpbHRlci10b2dnbGUnKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgaWYoJCh0aGlzKS5oYXNDbGFzcygnYWN0aXZlJykpIHtcbiAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJy5maWx0ZXItY29sdW1uJykuc2xpZGVVcCg0MDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJy5maWx0ZXItY29sdW1uJykuc2xpZGVEb3duKDQwMCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgX3JlZmluZW1lbnRzID0gJCgnLmZpbHRlci1ncm91cCA+IHVsID4gbGknKTtcblxuICAgIF9yZWZpbmVtZW50cy5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2YWx1ZSA9ICQodGhpcykuYXR0cignZGF0YS1maWx0ZXInKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgdmFyIGFjdGl2ZUZpbHRlcnMgPSAnYWxsJztcblxuICAgICAgaWYodmFsdWUgIT0gJ2FsbCcpIHtcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKTtcbiAgICAgICAgJCgnW2RhdGEtZmlsdGVyPVwiYWxsXCJdJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICBhY3RpdmVGaWx0ZXJzID0gJyc7XG5cbiAgICAgICAgLy8gc3RvcmUgYW55IHJlbWFpbmluZyBhY3RpdmUgZmlsdGVycyBpbiBhcnJheVxuICAgICAgICAgICAgJCgnW2RhdGEtZmlsdGVyXS5hY3RpdmUnKS5lYWNoKGZ1bmN0aW9uKGkpe1xuICAgICAgICAgICAgICB2YXIgdGhpc0FjdGl2ZUZpbHRlciA9ICQodGhpcykuYXR0cignZGF0YS1maWx0ZXInKTtcbiAgICAgICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICAgIGFjdGl2ZUZpbHRlcnMgPSBhY3RpdmVGaWx0ZXJzLmNvbmNhdChcIixcIiArIHRoaXNBY3RpdmVGaWx0ZXIpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFjdGl2ZUZpbHRlcnMgPSBhY3RpdmVGaWx0ZXJzLmNvbmNhdCh0aGlzQWN0aXZlRmlsdGVyKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC8vIGVzNiBtZXRob2QgYWN0aXZlRmlsdGVycyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZmlsdGVyXS5hY3RpdmUnKSkubWFwKGl0ZW0gPT4gaXRlbS5kYXRhc2V0LmZpbHRlcik7XG4gICAgICAgIH1cblxuICAgICAgdmFyIGhhc2ggPSAnIycgKyBhY3RpdmVGaWx0ZXJzO1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBoYXNoO1xuICAgIH0pO1xuICB9LFxuICAgIGdldFVuaXF1ZVJlc3VsdHM6IGZ1bmN0aW9uIGdldFVuaXF1ZVJlc3VsdHMoYXJyKVxuICAgIHtcbiAgICAgIHZhciB1bmlxdWVBcnJheSA9IGFyci5maWx0ZXIoZnVuY3Rpb24oZWxlbSwgcG9zLCBhcnIpIHtcbiAgICAgICAgcmV0dXJuIGFyci5pbmRleE9mKGVsZW0pID09IHBvcztcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gdW5pcXVlQXJyYXk7XG4gICAgfSxcbiAgICByZXNldFdlYlBhcnQ6IGZ1bmN0aW9uIHJlc2V0V2ViUGFydCgpXG4gICAge1xuICAgICAgdmFyIGNvbnRhaW5lciA9ICcjbGVhcm5pbmdwbGFucy1jb250YWluZXInO1xuICAgICAgdmFyIHRoaXNjb250YWluZXIgPSAkKGNvbnRhaW5lcik7XG4gICAgICB0aGlzY29udGFpbmVyLmVtcHR5KCk7XG4gICAgfVxufVxuIiwiLy8gcmVxdWlyZWRcbmNvbnN0IHV0aWxpdGllcyA9IHdpbmRvdy51dGlsaXRpZXMgPSByZXF1aXJlKCcuL3V0aWxpdGllcycpO1xuXG4vLyBhZGQgYW55IGxpc3QgZnVuY3Rpb25zIGhlcmVcbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGdldExpc3RJdGVtczogZnVuY3Rpb24gKG9wdGlvbnMsc3VjY2VzcyxlcnJvcikge1xuICAgIGxldCBzZXR0aW5ncyA9ICQuZXh0ZW5kKHRydWUsIHt9LCB7XG4gICAgICBsaXN0bmFtZTogJycsXG4gICAgICBzaXRldXJsOiBib25lcy53ZWIudXJsLFxuICAgICAgZmllbGRzOiAnJyxcbiAgICAgIG9yZGVyYnk6ICdUaXRsZScsXG4gICAgICBvcmRlcmRpcmVjdGlvbjogJ2FzYycsXG4gICAgICBleHBhbmQ6ICcnLFxuICAgICAgbGltaXQ6IDUwMFxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgJC5hamF4KHtcbiAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnYWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb247b2RhdGE9dmVyYm9zZScsXG4gICAgICAgIFwiWC1SZXF1ZXN0RGlnZXN0XCI6IGJvbmVzLmRpZ2VzdFxuICAgICAgfSxcbiAgICAgIHVybDogc2V0dGluZ3Muc2l0ZXVybCArICcvX2FwaS93ZWIvbGlzdHMvZ2V0Ynl0aXRsZShcXCcnICsgc2V0dGluZ3MubGlzdG5hbWUgKyAnXFwnKS9JdGVtcz8kdG9wPScrc2V0dGluZ3MubGltaXQrJyYkb3JkZXJieT0nICsgc2V0dGluZ3Mub3JkZXJieSArICcgJyArIHNldHRpbmdzLm9yZGVyZGlyZWN0aW9uICsgJyYkc2VsZWN0PScgKyBzZXR0aW5ncy5maWVsZHMgKyAnJiRleHBhbmQ9JyArIHNldHRpbmdzLmV4cGFuZCxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGl0ZW1zKSB7XG4gICAgICAgIHN1Y2Nlc3MoaXRlbXMpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbihpdGVtcykge1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBnZXRMaXN0RmllbGRWYWx1ZXNIVE1MOiBmdW5jdGlvbiAob3B0aW9ucyxzdWNjZXNzLGVycm9yKSB7XG4gICAgbGV0IHNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sIHtcbiAgICAgIGxpc3RuYW1lOiAnJyxcbiAgICAgIHNpdGV1cmw6IGJvbmVzLndlYi51cmwsXG4gICAgICBpZDogJycsXG4gICAgICBmaWVsZHM6ICcnXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnYWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb247b2RhdGE9dmVyYm9zZScsXG4gICAgICAgIFwiWC1SZXF1ZXN0RGlnZXN0XCI6IGJvbmVzLmRpZ2VzdFxuICAgICAgfSxcbiAgICAgIHVybDogc2V0dGluZ3Muc2l0ZXVybCArICcvX2FwaS93ZWIvbGlzdHMvZ2V0Ynl0aXRsZShcXCcnICsgc2V0dGluZ3MubGlzdG5hbWUgKyAnXFwnKS9JdGVtcygnK3NldHRpbmdzLmlkKycpL0ZpZWxkVmFsdWVzQXNIVE1MPyRzZWxlY3Q9JyArIHNldHRpbmdzLmZpZWxkcyxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGZpZWxkcyxpZCkge1xuICAgICAgICBzdWNjZXNzKGZpZWxkcyxzZXR0aW5ncy5pZCk7XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKGZpZWxkcykge1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBjcmVhdGVMaXN0czogZnVuY3Rpb24gY3JlYXRlTGlzdHMob3B0aW9ucykge1xuICAgICAgbGV0IHNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sIHtcbiAgICAgICAgbGlzdE5hbWU6ICcnLFxuICAgICAgICBzaXRlVXJsOiBib25lcy53ZWIudXJsLFxuICAgICAgICBkZXNjcmlwdGlvbjogJydcbiAgICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgICB2YXIgZXhlY3V0b3I7XG5cbiAgICAgIGV4ZWN1dG9yID0gbmV3IFNQLlJlcXVlc3RFeGVjdXRvcihzZXR0aW5ncy5zaXRlVXJsKTtcbiAgICAgIGV4ZWN1dG9yLmV4ZWN1dGVBc3luYyh7XG4gICAgICAgICAgdXJsOiBzZXR0aW5ncy5zaXRlVXJsICsgXCIvX2FwaS93ZWIvTGlzdHNcIixcbiAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgIGJvZHk6IFwieyAnX19tZXRhZGF0YSc6IHsgJ3R5cGUnOiAnU1AuTGlzdCcgfSwgJ0FsbG93Q29udGVudFR5cGVzJzogdHJ1ZSwgJ0NvbnRlbnRUeXBlc0VuYWJsZWQnOiB0cnVlLCAnQmFzZVRlbXBsYXRlJzogMTAwLCAnRGVzY3JpcHRpb24nOiAnXCIgKyBzZXR0aW5ncy5saXN0TmFtZSArIFwiJywgJ1RpdGxlJzonXCIgKyBzZXR0aW5ncy5saXN0TmFtZSArIFwiJ31cIixcbiAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgIFwiY29udGVudC10eXBlXCI6IFwiYXBwbGljYXRpb24vanNvbjsgb2RhdGE9dmVyYm9zZVwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBlcnJvcjogZnVuY3Rpb24ocyxhLCBlcnJNc2cpIHtcbiAgICAgICAgICB9XG4gICAgICB9KTtcbiAgfSxcbiAgYWRkQ29udGVudFR5cGVUb0xpc3Q6IGZ1bmN0aW9uIGFkZENvbnRlbnRUeXBlVG9MaXN0KG9wdGlvbnMpIHtcbiAgICAgICAgbGV0IHNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sIHtcbiAgICAgICAgICBsaXN0TmFtZTogJycsXG4gICAgICAgICAgc2l0ZVVybDogYm9uZXMud2ViLnVybCxcbiAgICAgICAgICBjb250ZW50VHlwZUlkOiAnJ1xuICAgICAgICB9LCBvcHRpb25zKTtcblxuICAgICAgICB2YXIgZXhlY3V0b3I7XG5cbiAgICAgICAgZXhlY3V0b3IgPSBuZXcgU1AuUmVxdWVzdEV4ZWN1dG9yKHNldHRpbmdzLnNpdGVVcmwpO1xuICAgICAgICBleGVjdXRvci5leGVjdXRlQXN5bmMoe1xuICAgICAgICAgICAgdXJsOiBzZXR0aW5ncy5zaXRlVXJsICsgXCIvX2FwaS93ZWIvbGlzdHMvZ2V0Ynl0aXRsZSgnXCIgKyBzZXR0aW5ncy5saXN0TmFtZSArIFwiJykvQ29udGVudFR5cGVzL0FkZEF2YWlsYWJsZUNvbnRlbnRUeXBlXCIsXG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyAnY29udGVudFR5cGVJZCc6IHNldHRpbmdzLmNvbnRlbnRUeXBlSWQgfSksXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJjb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uOyBvZGF0YT12ZXJib3NlXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHMsYSwgZXJyTXNnKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0SVRFTUNvbnRlbnRUeXBlOiBmdW5jdGlvbihvcHRpb25zLHN1Y2Nlc3MpIHtcbiAgICAgIGxldCBzZXR0aW5ncyA9ICQuZXh0ZW5kKHRydWUsIHt9LCB7XG4gICAgICAgIGxpc3RuYW1lOiAnJyxcbiAgICAgICAgc2l0ZXVybDogYm9uZXMud2ViLnVybFxuICAgICAgfSwgb3B0aW9ucyk7XG5cbiAgICAgICQuYWpheCh7XG4gICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ2FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uO29kYXRhPXZlcmJvc2UnLFxuICAgICAgICAgIFwiWC1SZXF1ZXN0RGlnZXN0XCI6IGJvbmVzLmRpZ2VzdFxuICAgICAgICB9LFxuICAgICAgICB1cmw6IHNldHRpbmdzLnNpdGV1cmwgKyAnL19hcGkvd2ViL2xpc3RzL2dldGJ5dGl0bGUoXFwnJyArIHNldHRpbmdzLmxpc3RuYW1lICsgJ1xcJykvQ29udGVudFR5cGVzPyRzZWxlY3Q9TmFtZSxpZCYkZmlsdGVyPU5hbWUgZXEgJTI3SXRlbSUyNycsXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICBzdWNjZXNzKGl0ZW0pO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHJlbW92ZUNvbnRlbnRUeXBlRnJvbUxpc3Q6IGZ1bmN0aW9uIHJlbW92ZUNvbnRlbnRUeXBlRnJvbUxpc3Qob3B0aW9ucykge1xuICAgICAgbGV0IHNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sIHtcbiAgICAgICAgbGlzdE5hbWU6ICcnLFxuICAgICAgICBzaXRlVXJsOiBib25lcy53ZWIudXJsLFxuICAgICAgICBjb250ZW50VHlwZUlkOiAnJ1xuICAgICAgfSwgb3B0aW9ucyk7XG5cbiAgICAgIHZhciBleGVjdXRvcjtcblxuICAgICAgZXhlY3V0b3IgPSBuZXcgU1AuUmVxdWVzdEV4ZWN1dG9yKHNldHRpbmdzLnNpdGVVcmwpO1xuICAgICAgZXhlY3V0b3IuZXhlY3V0ZUFzeW5jKHtcbiAgICAgICAgdXJsOiBzZXR0aW5ncy5zaXRlVXJsICsgXCIvX2FwaS93ZWIvbGlzdHMvZ2V0Ynl0aXRsZSgnXCIgKyBzZXR0aW5ncy5saXN0TmFtZSArIFwiJykvQ29udGVudFR5cGVzKCdcIiArIHNldHRpbmdzLmNvbnRlbnRUeXBlSWQgKyBcIicpL2RlbGV0ZU9iamVjdCgpXCIsXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIFwiY29udGVudC10eXBlXCI6IFwiYXBwbGljYXRpb24vanNvbjsgb2RhdGE9dmVyYm9zZVwiXG4gICAgICAgIH0sXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHMsYSwgZXJyTXNnKSB7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9LFxuICBjcmVhdGVMaXN0V2l0aENvbnRlbnRUeXBlOiBmdW5jdGlvbihvcHRpb25zLGJ0bixmb3JtLGlucHV0KSB7XG4gICAgbGV0IHNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sIHtcbiAgICAgIGxpc3ROYW1lOiAnJyxcbiAgICAgIHNpdGVVcmw6IGJvbmVzLndlYi51cmwsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICBjb250ZW50VHlwZUlkOiAnJ1xuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBsaXN0XG4gICAgdmFyIGxpc3RleGVjdXRvcjtcblxuICAgIGxpc3RleGVjdXRvciA9IG5ldyBTUC5SZXF1ZXN0RXhlY3V0b3Ioc2V0dGluZ3Muc2l0ZVVybCk7XG4gICAgbGlzdGV4ZWN1dG9yLmV4ZWN1dGVBc3luYyh7XG4gICAgICAgIHVybDogc2V0dGluZ3Muc2l0ZVVybCArIFwiL19hcGkvd2ViL0xpc3RzXCIsXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGJvZHk6IFwieyAnX19tZXRhZGF0YSc6IHsgJ3R5cGUnOiAnU1AuTGlzdCcgfSwgJ0FsbG93Q29udGVudFR5cGVzJzogdHJ1ZSwgJ0NvbnRlbnRUeXBlc0VuYWJsZWQnOiB0cnVlLCAnQmFzZVRlbXBsYXRlJzogMTAwLCAnRGVzY3JpcHRpb24nOiAnXCIgKyBzZXR0aW5ncy5kZXNjcmlwdGlvbiArIFwiJywgJ1RpdGxlJzonXCIgKyBzZXR0aW5ncy5saXN0TmFtZSArIFwiJ31cIixcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgXCJjb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uOyBvZGF0YT12ZXJib3NlXCJcbiAgICAgICAgfSxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgIGlmKGRhdGEuc3RhdHVzVGV4dCA9PSBcIkNyZWF0ZWRcIikge1xuICAgICAgICAgICAgIGJ0bi50ZXh0KCdDb25maWd1cmluZyBjb250ZW50IHR5cGUuLi4nKTtcbiAgICAgICAgICAgfVxuXG4gICAgICAgICAgIC8vIHRpbWVvdXQgdG8gYWxsb3cgbGlzdCB0byBiZSBjcmVhdGVkIHJlYWR5IHRvIHVwZGF0ZVxuICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICB2YXIgY29udGVudHR5cGVleGVjdXRvcjtcblxuICAgICAgICAgICAgIGNvbnRlbnR0eXBlZXhlY3V0b3IgPSBuZXcgU1AuUmVxdWVzdEV4ZWN1dG9yKHNldHRpbmdzLnNpdGVVcmwpO1xuICAgICAgICAgICAgIGNvbnRlbnR0eXBlZXhlY3V0b3IuZXhlY3V0ZUFzeW5jKHtcbiAgICAgICAgICAgICAgICAgdXJsOiBzZXR0aW5ncy5zaXRlVXJsICsgXCIvX2FwaS93ZWIvbGlzdHMvZ2V0Ynl0aXRsZSgnXCIgKyBzZXR0aW5ncy5saXN0TmFtZSArIFwiJykvQ29udGVudFR5cGVzL0FkZEF2YWlsYWJsZUNvbnRlbnRUeXBlXCIsXG4gICAgICAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgJ2NvbnRlbnRUeXBlSWQnOiBzZXR0aW5ncy5jb250ZW50VHlwZUlkIH0pLFxuICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICBcImNvbnRlbnQtdHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb247IG9kYXRhPXZlcmJvc2VcIlxuICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdGltZW91dCB0byBhbGxvdyBjb250ZW50IHR5cGUocykgdG8gYmUgYWRkZWQgcmVhZHkgdG8gdXBkYXRlXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgbGlzdHMuZ2V0SVRFTUNvbnRlbnRUeXBlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RuYW1lOiBzZXR0aW5ncy5saXN0TmFtZVxuICAgICAgICAgICAgICAgICAgICAgIH0sZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc0NUID0gaXRlbS5kLnJlc3VsdHM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZW1vdmVjb250ZW50dHlwZWV4ZWN1dG9yO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVjb250ZW50dHlwZWV4ZWN1dG9yID0gbmV3IFNQLlJlcXVlc3RFeGVjdXRvcihzZXR0aW5ncy5zaXRlVXJsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZWNvbnRlbnR0eXBlZXhlY3V0b3IuZXhlY3V0ZUFzeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHNldHRpbmdzLnNpdGVVcmwgKyBcIi9fYXBpL3dlYi9saXN0cy9nZXRieXRpdGxlKCdcIiArIHNldHRpbmdzLmxpc3ROYW1lICsgXCInKS9Db250ZW50VHlwZXMoJ1wiICsgdGhpc0NUWzBdLklkLlN0cmluZ1ZhbHVlICsgXCInKS9kZWxldGVPYmplY3QoKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRlbnQtdHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb247IG9kYXRhPXZlcmJvc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHMsYSwgZXJyTXNnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihzLGEsIGVyck1zZykge1xuICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICBpZihzdGF0dXMgPT0gJ2Vycm9yJykge1xuICAgICAgICAgICAgICAgZm9ybS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAvLyB1cGRhdGUgaW5wdXRcbiAgICAgICAgICAgICBpbnB1dC52YWwoc2V0dGluZ3MubGlzdE5hbWUpO1xuICAgICAgICAgICAgIGlucHV0LnRyaWdnZXIoJ2NoYW5nZScpO1xuXG4gICAgICAgICAgICAgLy8gY2xvc2UgbmV3IGZvcm1cbiAgICAgICAgICAgICBmb3JtLnJlbW92ZSgpO1xuXG4gICAgICAgICAgIH0sIDUwMDApXG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbihzLGEsIGVyck1zZykge1xuICAgICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIGFkZENvbHVtblRvTGlzdDogZnVuY3Rpb24gYWRkQ29sdW1uVG9MaXN0KG9wdGlvbnMpIHtcbiAgICAvLyBmaWVsZHR5cGUgY2FuIGJlIGFueSBvZiB0aGUgZm9sbG93aW5nIHZhbHVlczpcbiAgICAvLyBJbnRlZ2VyID0gMFxuICAgIC8vIFRleHQgPSAxXG4gICAgLy8gTm90ZSA9IDNcbiAgICAvLyBEYXRlVGltZSA9IDRcbiAgICAvLyBDb3VudGVyID0gNVxuICAgIC8vIENob2ljZSA9IDZcbiAgICAvLyBMb29rdXAgPSA3XG4gICAgLy8gQm9vbGVhbiA9IDhcbiAgICAvLyBOdW1iZXIgPSA5XG4gICAgLy8gQ3VycmVuY3kgPSAxMFxuICAgIC8vIFVSTCA9IDExXG4gICAgLy8gVXNlciA9IDIwXG5cbiAgICBsZXQgc2V0dGluZ3MgPSAkLmV4dGVuZCh0cnVlLCB7fSwge1xuICAgICAgbGlzdE5hbWU6ICcnLFxuICAgICAgc2l0ZVVybDogYm9uZXMud2ViLnVybCxcbiAgICAgIGZpZWxkVHlwZTogJycsXG4gICAgICBmaWVsZFRpdGxlOiAnJyxcbiAgICAgIGZpZWxkRGlzcGxheU5hbWU6ICcnXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICB2YXIgZXhlY3V0b3I7XG5cbiAgICBleGVjdXRvciA9IG5ldyBTUC5SZXF1ZXN0RXhlY3V0b3Ioc2V0dGluZ3Muc2l0ZVVybCk7XG4gICAgZXhlY3V0b3IuZXhlY3V0ZUFzeW5jKHtcbiAgICAgIHVybDogc2V0dGluZ3Muc2l0ZVVybCArIFwiL19hcGkvd2ViL2xpc3RzL2dldGJ5dGl0bGUoJ1wiICsgc2V0dGluZ3MubGlzdE5hbWUgKyBcIicpL2ZpZWxkc1wiLFxuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBib2R5OiBcInsnX19tZXRhZGF0YSc6IHsgJ3R5cGUnOiAnU1AuRmllbGQnIH0sICdGaWVsZFR5cGVLaW5kJzogXCIgKyBzZXR0aW5ncy5maWVsZFR5cGUgKyBcIiwgJ1RpdGxlJzogJ1wiICsgc2V0dGluZ3MuZmllbGRUaXRsZSArIFwiJywgJ0Rlc2NyaXB0aW9uJzogJ1wiICsgc2V0dGluZ3MuZmllbGREaXNwbGF5TmFtZSArIFwiJ31cIixcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uO29kYXRhPXZlcmJvc2UnXG4gICAgICB9LFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbihzLGEsIGVyck1zZykge1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBidWlsZHdlYnBhcnQ6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgbGV0IHNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sIHtcbiAgICAgIHRyaWdnZXI6ICcnLFxuICAgICAgY29udGFpbmVyOiAnJ1xuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgdmFyIGxvYWR2aWV3ID0gZnVuY3Rpb24oKXtcbiAgICAgICQoc2V0dGluZ3MudHJpZ2dlcikuZWFjaChmdW5jdGlvbihqKXtcblxuICAgICAgICAvLyBnZXQgZGF0YVxuICAgICAgICB2YXIgd2VicGFydCA9ICQodGhpcyk7XG4gICAgICAgIHZhciBib2R5ID0gd2VicGFydC5wYXJlbnQoKTtcblxuICAgICAgICAvLyBnZXQgZXhpc3RpbmcgY29udGFpbmVyXG4gICAgICAgIHZhciBjb250YWluZXIgPSBib2R5Lm5leHQoc2V0dGluZ3MuY29udGFpbmVyKTtcblxuICAgICAgICAvLyBjcmVhdGUgY29udGFpbmVyXG4gICAgICAgIGlmKCFjb250YWluZXIuc2l6ZSgpKXtcblxuICAgICAgICAgIHZhciBjb250YWluZXJjbGFzcyA9IHNldHRpbmdzLmNvbnRhaW5lci5zdWJzdHJpbmcoc2V0dGluZ3MuY29udGFpbmVyLmluZGV4T2YoJy4nKSsxKTtcblxuICAgICAgICAgIGNvbnRhaW5lciA9ICQoJzxkaXYgY2xhc3M9XCInK2NvbnRhaW5lcmNsYXNzKydcIj48L2Rpdj4nKTtcbiAgICAgICAgICBib2R5LmFmdGVyKGNvbnRhaW5lcik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBoaWRlIHRoZSBib2R5XG4gICAgICAgIGJvZHkuaGlkZSgpO1xuXG4gICAgICAgIC8vIGdldCBsaXN0XG4gICAgICAgIHZhciBsaXN0ID0gJyc7XG4gICAgICAgIGlmKHdlYnBhcnQuaXMoJ1tkYXRhLWxpc3RdJykpIGxpc3QgPSB3ZWJwYXJ0LmF0dHIoJ2RhdGEtbGlzdCcpO1xuXG4gICAgICAgIC8vIGVkaXQgbW9kZSBjb250cm9scyAoZmlyc3QgdGltZSBzZXR1cCBvbmx5KVxuICAgICAgICBpZihib25lcy5wYWdlLmVkaXRtb2RlICYmICFjb250YWluZXIuY2hpbGRyZW4oJy5lZGl0LW1vZGUtcGFuZWwnKS5zaXplKCkpe1xuXG4gICAgICAgICAgLy8gZGlzYWJsZSBjb250ZW50IGVkaXRvclxuICAgICAgICAgIGJvZHkucmVtb3ZlQXR0cignY29udGVudGVkaXRhYmxlJykucmVtb3ZlQXR0cignY29udGVudGVkaXRvcicpO1xuICAgICAgICAgIGJvZHkucGFyZW50KCkucmVtb3ZlQXR0cigncnRlcmVkaXJlY3QnKTtcblxuICAgICAgICAgIC8vIGFkZCBlZGl0IHBhbmVsXG4gICAgICAgICAgY29udGFpbmVyLmFwcGVuZCgnPGRpdiBjbGFzcz1cImVkaXQtbW9kZS1wYW5lbFwiPjxkaXYgY2xhc3M9XCJtcy1mb3JtZmllbGRsYWJlbGNvbnRhaW5lclwiPkxpc3Q8L2Rpdj48ZGl2IGNsYXNzPVwibXMtZm9ybWZpZWxkdmFsdWVjb250YWluZXJcIj48aW5wdXQgY2xhc3M9XCJ3ZWJwYXJ0LWxpc3RcIiB0eXBlPVwidGV4dFwiIHZhbHVlPVwiJytsaXN0KydcIi8+PC9kaXY+PC9kaXY+Jyk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlbW92ZSBlZGl0IGJ1dHRvbnNcbiAgICAgICAgY29udGFpbmVyLmZpbmQoJy5saXN0LWVkaXQnKS5yZW1vdmUoKTtcblxuICAgICAgICAvLyBubyBsaXN0P1xuICAgICAgICBpZighbGlzdC5sZW5ndGgpe1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGVkaXQgbGlzdCBidXR0b25cbiAgICAgICAgaWYoYm9uZXMucGFnZS5lZGl0bW9kZSl7XG4gICAgICAgICAgdmFyIGVkaXRCdG4gPSAkKCc8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1zbSBsaXN0LWVkaXRcIiB0aXRsZT1cIkFkZCBhbmQgZWRpdCBsaW5rcyBpbiB0aGlzIGxpc3RcIj48aSBjbGFzcz1cImZhIGZhLXBlbmNpbFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L2J1dHRvbj4nKTtcbiAgICAgICAgICBlZGl0QnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdmFyIG9wZW5EaWFsb2cgPSBmdW5jdGlvbiBvcGVuRGlhbG9nKCl7XG4gICAgICAgICAgICAgIFNQLlVJLk1vZGFsRGlhbG9nLnNob3dNb2RhbERpYWxvZyh7XG4gICAgICAgICAgICAgICAgdXJsOiBib25lcy53ZWIudXJsKycvTGlzdHMvJytsaXN0LFxuICAgICAgICAgICAgICAgIGF1dG9TaXplOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRpYWxvZ1JldHVyblZhbHVlQ2FsbGJhY2s6IGZ1bmN0aW9uKHJlc3VsdCwgZGF0YSl7XG4gICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09IFNQLlVJLkRpYWxvZ1Jlc3VsdC5PSykge1xuICAgICAgICAgICAgICAgICAgICBvcGVuRGlhbG9nKCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09IFNQLlVJLkRpYWxvZ1Jlc3VsdC5jYW5jZWwpIHtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG9wZW5EaWFsb2coKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb250YWluZXIuZmluZCgnaW5wdXQud2VicGFydC1saXN0JykuYWZ0ZXIoZWRpdEJ0bik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gICAgbG9hZHZpZXcoKTtcbiAgfSxcbiAgZWRpdHdlYnBhcnQ6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgbGV0IHNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sIHtcbiAgICAgIHRyaWdnZXI6ICcnLFxuICAgICAgY29udGFpbmVyOiAnJyxcbiAgICAgIGNvbnRlbnR0eXBlaWQ6ICcnLFxuICAgICAgcmVtb3ZlY29udGVudHR5cGVpZDogJydcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIC8vIGVkaXRvclxuICAgIHZhciBsb2FkZWRpdG9yID0gZnVuY3Rpb24oKXtcbiAgICAgICQoc2V0dGluZ3MuY29udGFpbmVyKS5maW5kKCdpbnB1dC53ZWJwYXJ0LWxpc3QnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBpbnB1dCA9ICQodGhpcyk7XG4gICAgICAgIHZhciBsaXN0ID0gaW5wdXQudmFsKCkudHJpbSgpO1xuXG4gICAgICAgIC8vIGNoYW5nZVxuICAgICAgICBpbnB1dC5vbignY2hhbmdlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICBpbnB1dC5jbG9zZXN0KHNldHRpbmdzLmNvbnRhaW5lcikucHJldignZGl2JykuZmluZChzZXR0aW5ncy50cmlnZ2VyKS5hdHRyKCdkYXRhLWxpc3QnLCAkKHRoaXMpLnZhbCgpKTtcbiAgICAgICAgICBsaXN0cy5idWlsZHdlYnBhcnQoe1xuICAgICAgICAgICAgdHJpZ2dlcjogc2V0dGluZ3MudHJpZ2dlcixcbiAgICAgICAgICAgIGNvbnRhaW5lcjogc2V0dGluZ3MuY29udGFpbmVyXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGNyZWF0ZSBidG5cbiAgICAgICAgdmFyIGNyZWF0ZUJ0biA9ICQoJzxidXR0b24gY2xhc3M9XCJidG4gYnRuLXNtIHdlYnBhcnQtbGlzdC1jcmVhdGVcIiB0aXRsZT1cIkNyZWF0ZSBhIG5ldyBsaXN0XCI+PGkgY2xhc3M9XCJmYSBmYS1wbHVzXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjwvYnV0dG9uPicpO1xuICAgICAgICBpbnB1dC5wYXJlbnQoKS5hcHBlbmQoY3JlYXRlQnRuKTtcblxuICAgICAgICAvLyBjcmVhdGVcbiAgICAgICAgY3JlYXRlQnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgIC8vIGNsb3NlIGZvcm1cbiAgICAgICAgICBpZigkKHRoaXMpLm5leHQoJy53ZWJwYXJ0LWZvcm0nKS5zaXplKCkgPiAwKXtcbiAgICAgICAgICAgICQodGhpcykubmV4dCgnLndlYnBhcnQtZm9ybScpLnJlbW92ZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIG5ldyBmb3JtXG4gICAgICAgICAgZWxzZXtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIGZvcm1cbiAgICAgICAgICAgIHZhciBmb3JtID0gJCgnPGRpdiBjbGFzcz1cIndlYnBhcnQtZm9ybVwiPjxpbnB1dCB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiTmV3IExpc3QgTmFtZVwiPjxidXR0b24gY2xhc3M9XCJidG4gYnRuLXNtXCI+Q3JlYXRlPC9idXR0b24+PC9kaXY+Jyk7XG4gICAgICAgICAgICAkKHRoaXMpLmFmdGVyKGZvcm0pO1xuXG4gICAgICAgICAgICAvLyBzdWJtaXRcbiAgICAgICAgICAgIGZvcm0uY2hpbGRyZW4oJ2J1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgLy8gZGlzYWJsZWQ/XG4gICAgICAgICAgICAgIGlmKCQodGhpcykuaXMoJ1tkaXNhYmxlZF0nKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gZGlzYWJsZSBidXR0b25cbiAgICAgICAgICAgICAgdmFyIGJ0biA9ICQodGhpcyk7XG4gICAgICAgICAgICAgIGJ0bi5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpLnRleHQoJ0NyZWF0aW5nIGxpc3QuLi4nKTtcblxuICAgICAgICAgICAgICAvLyBnZXQgbmV3IGxpc3QgbmFtZVxuICAgICAgICAgICAgICB2YXIgbGlzdE5hbWUgPSAkKHRoaXMpLnByZXYoJ2lucHV0JykudmFsKCkudHJpbSgpO1xuXG4gICAgICAgICAgICAgIC8vIHNhbml0aXplIGxpc3QgbmFtZVxuICAgICAgICAgICAgICBsaXN0TmFtZSA9IGxpc3ROYW1lLnJlcGxhY2UoL1teQS1afGEtenxcXGR8XFxzXS9nLCAnJyk7XG5cbiAgICAgICAgICAgICAgLy8gbm8gbGlzdD9cbiAgICAgICAgICAgICAgaWYoIWxpc3ROYW1lLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgZm9ybS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBjcmVhdGUgbGlzdFxuICAgICAgICAgICAgICBsaXN0cy5jcmVhdGVMaXN0V2l0aENvbnRlbnRUeXBlKHtcbiAgICAgICAgICAgICAgICBsaXN0TmFtZTogbGlzdE5hbWUsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGxpc3ROYW1lLFxuICAgICAgICAgICAgICAgIGNvbnRlbnRUeXBlSWQ6IHNldHRpbmdzLmNvbnRlbnR0eXBlaWQsXG4gICAgICAgICAgICAgICAgcmVtb3ZlQ29udGVudFR5cGVJZDogc2V0dGluZ3MucmVtb3ZlY29udGVudHR5cGVpZFxuICAgICAgICAgICAgICB9LGJ0bixmb3JtLGlucHV0KTtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgIH0pO1xuICAgIH07XG4gICAgbG9hZGVkaXRvcigpO1xuICB9XG59O1xuIiwiY29uc3QgbGlzdHMgPSB3aW5kb3cubGlzdHMgPSByZXF1aXJlKCcuL2xpc3RzJyk7XG5jb25zdCB1dGlsaXRpZXMgPSB3aW5kb3cudXRpbGl0aWVzID0gcmVxdWlyZSgnLi91dGlsaXRpZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gc2tlbGV0b24gY29kZSBmb3Igd2ViIHBhcnRcbiAgbG9hZDogZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgbGV0IHNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sIHtcbiAgICAgIHRyaWdnZXI6ICcud3AtbmV3cycsXG4gICAgICBjb250YWluZXI6ICcubmV3cy1jb250YWluZXInLFxuICAgICAgY29udGVudHR5cGVpZDogJzB4MDEwMEFFQTkwMTM3RUNEODEzNDlCMTdEQjcyMTlGRTM0NENEJyAvLyBuZXdzd2VicGFydFxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgKGZ1bmN0aW9uKCQpe1xuXG4gICAgICBsaXN0cy5idWlsZHdlYnBhcnQoe1xuICAgICAgICB0cmlnZ2VyOiBzZXR0aW5ncy50cmlnZ2VyLFxuICAgICAgICBjb250YWluZXI6IHNldHRpbmdzLmNvbnRhaW5lclxuICAgICAgfSk7XG5cbiAgICAgICQoc2V0dGluZ3MuY29udGFpbmVyKS5lYWNoKGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgdmFyIHRoaXNDb250YWluZXIgPSAkKHRoaXMpO1xuXG4gICAgICAgIC8vIHJlbW92ZSBhbnkgcHJldmlvdXNseS1mZXRjaGVkIGl0ZW1zXG4gICAgICAgIHRoaXNDb250YWluZXIuZmluZCgndWwnKS5yZW1vdmUoKTtcblxuICAgICAgICAvLyBnZXQgbGlzdCBuYW1lXG4gICAgICAgIHZhciBsaXN0bmFtZSA9IHRoaXNDb250YWluZXIuY2xvc2VzdCgnLm1zLXdlYnBhcnR6b25lLWNlbGwnKS5maW5kKHNldHRpbmdzLnRyaWdnZXIpLmF0dHIoJ2RhdGEtbGlzdCcpO1xuXG4gICAgICAgIC8vIGdldCBsaXN0IGl0ZW1zXG4gICAgICAgIGlmKCFib25lcy5wYWdlLmVkaXRtb2RlKXtcbiAgICAgICAgICBsaXN0cy5nZXRMaXN0SXRlbXMoe1xuICAgICAgICAgICAgbGlzdG5hbWU6IGxpc3RuYW1lLFxuICAgICAgICAgICAgZmllbGRzOiAnVGl0bGUsRW5hYmxlZCxDYWxsVG9BY3Rpb24sU29ydE9yZGVyLEV4Y2VycHQsSWQsT3BlbkxpbmtJbk5ld1dpbmRvdycsXG4gICAgICAgICAgICBvcmRlcmJ5OiAnU29ydE9yZGVyJ1xuICAgICAgICAgIH0sZnVuY3Rpb24oaXRlbXMpe1xuICAgICAgICAgICAgdmFyIGl0ZW1zZGF0YSA9IGl0ZW1zLmQucmVzdWx0cztcbiAgICAgICAgICAgIHRoaXNDb250YWluZXIuYXBwZW5kKCc8dWwvPicpO1xuICAgICAgICAgICAgdmFyIHRoaXNjb250YWluZXIgPSB0aGlzQ29udGFpbmVyLmZpbmQoJ3VsJyk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICB2YXIgdGhpc1RpdGxlID0gaXRlbXNkYXRhW2ldLlRpdGxlO1xuICAgICAgICAgICAgICB2YXIgdGhpc0VuYWJsZWQgPSBpdGVtc2RhdGFbaV0uRW5hYmxlZDtcbiAgICAgICAgICAgICAgdmFyIHRoaXNFeGNlcnB0ID0gaXRlbXNkYXRhW2ldLkV4Y2VycHQ7XG4gICAgICAgICAgICAgIHZhciB0aGlzSUQgPSBpdGVtc2RhdGFbaV0uSWQ7XG4gICAgICAgICAgICAgIHZhciBuZXdXaW5kb3cgPSBpdGVtc2RhdGFbaV0uT3BlbkxpbmtJbk5ld1dpbmRvdztcblxuICAgICAgICAgICAgICBpZihpdGVtc2RhdGFbaV0uRXhjZXJwdCA9PT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgdGhpc0V4Y2VycHQgPSAnJztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmKHRoaXNFbmFibGVkKXtcbiAgICAgICAgICAgICAgICBpZihpdGVtc2RhdGFbaV0uQ2FsbFRvQWN0aW9uICE9IG51bGwgJiYgaXRlbXNkYXRhW2ldLkNhbGxUb0FjdGlvbiAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgIHZhciB0aGlzQnV0dG9uVGV4dCA9IGl0ZW1zZGF0YVtpXS5DYWxsVG9BY3Rpb24uRGVzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgICB2YXIgdGhpc0J1dHRvblVybCA9IGl0ZW1zZGF0YVtpXS5DYWxsVG9BY3Rpb24uVXJsO1xuICAgICAgICAgICAgICAgICAgaWYobmV3V2luZG93KXtcbiAgICAgICAgICAgICAgICAgICAgdGhpc2NvbnRhaW5lci5hcHBlbmQoJzxsaSBjbGFzcz1cIm5ld3Mtc2xpZGUgcm93IG5vLWd1dHRlclwiPjxkaXYgY2xhc3M9XCJuZXdzLXNsaWRlLWltYWdlIG5ld3MtaW1hZ2UtJyt0aGlzSUQrJyBjb2wtc20tN1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJuZXdzLXNsaWRlLWNvbnRlbnQgY29sLXNtLTVcIj48aDE+TmV3cyAmIEFubm91bmNlbWVudHM8L2gxPjxkaXYgY2xhc3M9XCJuZXdzLXNsaWRlLXRpdGxlXCI+Jyt0aGlzVGl0bGUrJzwvZGl2PjxkaXYgY2xhc3M9XCJuZXdzLXNsaWRlLWV4Y2VycHRcIj4nK3RoaXNFeGNlcnB0Kyc8L2Rpdj48ZGl2IGNsYXNzPVwibmV3cy1zbGlkZS1idG5cIj48YSBocmVmPVwiJyt0aGlzQnV0dG9uVXJsKydcIiBjbGFzcz1cImJhaC1jdGFcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nK3RoaXNCdXR0b25UZXh0Kyc8L2E+PC9kaXY+PC9kaXY+PC9saT4nKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNjb250YWluZXIuYXBwZW5kKCc8bGkgY2xhc3M9XCJuZXdzLXNsaWRlIHJvdyBuby1ndXR0ZXJcIj48ZGl2IGNsYXNzPVwibmV3cy1zbGlkZS1pbWFnZSBuZXdzLWltYWdlLScrdGhpc0lEKycgY29sLXNtLTdcIj48L2Rpdj48ZGl2IGNsYXNzPVwibmV3cy1zbGlkZS1jb250ZW50IGNvbC1zbS01XCI+PGgxPk5ld3MgJiBBbm5vdW5jZW1lbnRzPC9oMT48ZGl2IGNsYXNzPVwibmV3cy1zbGlkZS10aXRsZVwiPicrdGhpc1RpdGxlKyc8L2Rpdj48ZGl2IGNsYXNzPVwibmV3cy1zbGlkZS1leGNlcnB0XCI+Jyt0aGlzRXhjZXJwdCsnPC9kaXY+PGRpdiBjbGFzcz1cIm5ld3Mtc2xpZGUtYnRuXCI+PGEgaHJlZj1cIicrdGhpc0J1dHRvblVybCsnXCIgY2xhc3M9XCJiYWgtY3RhXCI+Jyt0aGlzQnV0dG9uVGV4dCsnPC9hPjwvZGl2PjwvZGl2PjwvbGk+Jyk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHRoaXNjb250YWluZXIuYXBwZW5kKCc8bGkgY2xhc3M9XCJuZXdzLXNsaWRlIHJvdyBuby1ndXR0ZXJcIj48ZGl2IGNsYXNzPVwibmV3cy1zbGlkZS1pbWFnZSBuZXdzLWltYWdlLScrdGhpc0lEKycgY29sLXNtLTdcIj48L2Rpdj48ZGl2IGNsYXNzPVwibmV3cy1zbGlkZS1jb250ZW50IGNvbC1zbS01XCI+PGgxPk5ld3MgJiBBbm5vdW5jZW1lbnRzPC9oMT48ZGl2IGNsYXNzPVwibmV3cy1zbGlkZS10aXRsZVwiPicrdGhpc1RpdGxlKyc8L2Rpdj48ZGl2IGNsYXNzPVwibmV3cy1zbGlkZS1leGNlcnB0XCI+Jyt0aGlzRXhjZXJwdCsnPC9kaXY+PC9kaXY+PC9saT4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBsaXN0cy5nZXRMaXN0RmllbGRWYWx1ZXNIVE1MKHtcbiAgICAgICAgICAgICAgICBsaXN0bmFtZTogbGlzdG5hbWUsXG4gICAgICAgICAgICAgICAgZmllbGRzOiAnQkFISW1hZ2UnLFxuICAgICAgICAgICAgICAgIGlkOiB0aGlzSURcbiAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZmllbGRzLGlkKXtcbiAgICAgICAgICAgICAgICB2YXIgdGhpc0ltYWdlID0gZmllbGRzLmQuQkFISW1hZ2U7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2hlY2tFeGlzdCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgIGlmKHRoaXNJbWFnZSAmJiAkKHRoaXNJbWFnZSkgJiYgJCh0aGlzSW1hZ2UpWzBdICYmICQodGhpc0ltYWdlKVswXS53aWR0aCAhPSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICB2YXIgaW1hZ2VSYXRpbyA9ICQodGhpc0ltYWdlKVswXS53aWR0aC8kKHRoaXNJbWFnZSlbMF0uaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgdmFyIGNvbnRhaW5lclJhdGlvID0gdGhpc0NvbnRhaW5lci5maW5kKCcubmV3cy1pbWFnZS0nK2lkKS53aWR0aCgpL3RoaXNDb250YWluZXIuZmluZCgnLm5ld3MtaW1hZ2UtJytpZCkuaGVpZ2h0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgIHRoaXNDb250YWluZXIuZmluZCgnLm5ld3MtaW1hZ2UtJytpZCkuYXBwZW5kKHRoaXNJbWFnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgIGlmKGltYWdlUmF0aW8gPiBjb250YWluZXJSYXRpbyl7XG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXNDb250YWluZXIuZmluZCgnLm5ld3MtaW1hZ2UtJytpZCArJyBpbWcnKS53aWR0aCgnYXV0bycpLmhlaWdodCgnMTAwJScpO1xuICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgdGhpc0NvbnRhaW5lci5maW5kKCcubmV3cy1pbWFnZS0nK2lkICsnIGltZycpLndpZHRoKCcxMDAlJykuaGVpZ2h0KCdhdXRvJyk7XG4gICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChjaGVja0V4aXN0KTtcblxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAxMDApO1xuXG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICQoc2V0dGluZ3MuY29udGFpbmVyKS5jYXJvdXNlbCh7XG4gICAgICAgICAgICAgIGxvb3A6IHRydWUsXG4gICAgICAgICAgICAgIG5hdmlnYXRpb246IHRydWUsXG4gICAgICAgICAgICAgIGF1dG9wbGF5OiB0cnVlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIC8vIGxvYWQgZWRpdG9yXG4gICAgICBsaXN0cy5lZGl0d2VicGFydCh7XG4gICAgICAgIHRyaWdnZXI6IHNldHRpbmdzLnRyaWdnZXIsXG4gICAgICAgIGNvbnRhaW5lcjogc2V0dGluZ3MuY29udGFpbmVyLFxuICAgICAgICBjb250ZW50dHlwZWlkOiBzZXR0aW5ncy5jb250ZW50dHlwZWlkXG4gICAgICB9KTtcblxuICAgIH0oalF1ZXJ5KSk7XG4gIH1cbn07XG4iLCJjb25zdCBsaXN0cyA9IHdpbmRvdy5saXN0cyA9IHJlcXVpcmUoJy4vbGlzdHMnKTtcbmNvbnN0IHV0aWxpdGllcyA9IHdpbmRvdy51dGlsaXRpZXMgPSByZXF1aXJlKCcuL3V0aWxpdGllcycpO1xuXG52YXIgcGFydG5lcnNoaXBUYWdzID0gW107XG52YXIgY29uY2VudHJhdGlvblRhZ3MgPSBbXTtcbnZhciB0ZWNobm9sb2d5VGFncyA9IFtdO1xudmFyIGNlcnRpZmljYXRpb25UYWdzID0gW107XG52YXIgZGVncmVlVGFncyA9IFtdO1xuXG52YXIgY29udGFpbmVyID0gJyNwYXJ0bmVyc2hpcC1jb250YWluZXInO1xudmFyIHRoaXNjb250YWluZXIgPSAkKGNvbnRhaW5lcik7XG5cbnZhciByZXN1bHRzUGFyZW50Q29udGFpbmVyID0gJy5wYXJ0bmVyc2hpcC1yZXN1bHRzLWNvbHVtbic7XG52YXIgcmVzdWx0c05hdmlnYXRpb25Db250YWluZXIgPSAnLmFscGhhLWZpbHRlcic7XG52YXIgcmVzdWx0c0NvbnRhaW5lciA9ICcucmVzdWx0cyc7XG52YXIgZmlsdGVyUGFyZW50Q29udGFpbmVyID0gJy5maWx0ZXItY29sdW1uJztcbnZhciBmaWx0ZXJDb250YWluZXIgPSAnLmZpbHRlci1ncm91cC1vcHRpb25zJztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gc2tlbGV0b24gY29kZSBmb3Igd2ViIHBhcnRcbiAgbG9hZDogZnVuY3Rpb24oKXtcblxuICAgIHBhcnRuZXJzaGlwcy5yZXNldFdlYlBhcnQoKTtcbiAgICBwYXJ0bmVyc2hpcHMuYnVpbGRXZWJQYXJ0KCk7XG5cbiAgICAgdmFyIGNoZWNrRXhpc3QgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYoJCgnLnBhcnRuZXJzaGlwLWl0ZW0nKS5zaXplKCkgIT0gMCkge1xuICAgICAgICAgIHBhcnRuZXJzaGlwcy5idWlsZFJlZmluZW1lbnQoKTtcbiAgICAgICAgICBwYXJ0bmVyc2hpcHMuZmlsdGVyUmVzdWx0c0J5QWxwaGFiZXQoKTtcbiAgICAgICAgICBwYXJ0bmVyc2hpcHMuZmlsdGVyUmVzdWx0c0J5UmVmaW5lbWVudCgpO1xuXG4gICAgICAgICAgLy8gc2F2ZSBkZXNjIG9yaWdpbmFsIGhlaWdodHMgZm9yIGFuaW1hdGlvblxuICAgICAgICAgICQoJy50cmltbWVkJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIHRoaXNIZWlnaHQgPSAkKHRoaXMpLmhlaWdodCgpO1xuICAgICAgICAgICAgJCh0aGlzKS5hdHRyKCdkYXRhLWhlaWdodCcsdGhpc0hlaWdodCk7XG4gICAgICAgICAgICAkKHRoaXMpLmNzcygnaGVpZ2h0JywnOTBweCcpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gc2hvdyBtb3JlIG9yIGxlc3MgZmVsbG93IGRlc2NyaXB0aW9uXG4gICAgICAgICAgJCgnLmRlc2NyaXB0aW9uLXRvZ2dsZS1saW5rJykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKCdkZXNjcmlwdGlvbi1tb3JlLWxpbmsnKSl7XG4gICAgICAgICAgICAgIHZhciB0aGlzT3JpZ0hlaWdodCA9ICQodGhpcykucGFyZW50KCkuZmluZCgnLnRyaW1tZWQnKS5hdHRyKCdkYXRhLWhlaWdodCcpO1xuICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJy50cmltbWVkJykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzT3JpZ0hlaWdodFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgJCh0aGlzKS5wcmV2KCkuaGlkZSgpO1xuICAgICAgICAgICAgICAkKHRoaXMpLmNzcygnb3BhY2l0eScsICcwJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIGhlaWdodDogOTBcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICQodGhpcykuY2xvc2VzdCgnLmRlc2NyaXB0aW9uJykuZmluZCgnLmRlc2NyaXB0aW9uLW1vcmUtbGluaycpLmNzcygnb3BhY2l0eScsICcxJyk7XG4gICAgICAgICAgICAgICQodGhpcykuY2xvc2VzdCgnLmRlc2NyaXB0aW9uJykuZmluZCgnLmRlc2NyaXB0aW9uLW92ZXJsYXknKS5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcblxuICAgICAgICAgIC8vIGhhc2ggY2hhbmdlXG4gICAgICAgICAgJCh3aW5kb3cpLm9uKCdoYXNoY2hhbmdlJywgZnVuY3Rpb24oZSl7XG5cbiAgICAgICAgICAgIC8vIGdldCBoYXNoXG4gICAgICAgICAgICB2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCAnJyk7XG4gICAgICAgICAgICBoYXNoID0gZGVjb2RlVVJJQ29tcG9uZW50KGhhc2gpO1xuXG4gICAgICAgICAgICB2YXIgX2FscGhhYmV0cyA9ICQoJy5hbHBoYWJldCA+IHVsID4gbGkgPiBhJyk7XG4gICAgICAgICAgICB2YXIgX3JlZmluZW1lbnRzID0gJCgnLmZpbHRlci1ncm91cCA+IHVsID4gbGknKTtcbiAgICAgICAgICAgIHZhciBfY29udGVudFJvd3MgPSAkKCcucGFydG5lcnNoaXAtaXRlbScpO1xuICAgICAgICAgICAgdmFyIF9jb3VudCA9IDA7XG5cbiAgICAgICAgICAgIF9jb250ZW50Um93cy5oaWRlKCk7XG5cbiAgICAgICAgICAgICQoJy5tb2JpbGUtYWxwaGEtbGlzdCcpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICQoJy5hbHBoYWJldCA+IHVsID4gbGkgPiBhJykucmVtb3ZlQ2xhc3MoJ21vYmlsZS1hY3RpdmUnKTtcblxuICAgICAgICAgICAgaWYoaGFzaC5sZW5ndGggPT09IDAgfHwgaGFzaCA9PT0gJ2FsbCcpIHtcbiAgICAgICAgICAgICAgX3JlZmluZW1lbnRzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgJCgnW2RhdGEtZmlsdGVyPVwiYWxsXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICBfYWxwaGFiZXRzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgJCgnW2RhdGEtYWxwaGE9XCJhbGxcIl0nKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgIF9jb250ZW50Um93cy5mYWRlSW4oNDAwKTtcbiAgICAgICAgICAgICAgX2NvdW50ID0gX2NvbnRlbnRSb3dzLnNpemUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmKGhhc2gubGVuZ3RoID09PSAxKXtcbiAgICAgICAgICAgICAgICBfcmVmaW5lbWVudHMucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICQoJ1tkYXRhLWZpbHRlcj1cImFsbFwiXScpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICBfYWxwaGFiZXRzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS1hbHBoYT1cImFsbFwiXScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS1hbHBoYS1maWx0ZXI9XCInK2hhc2grJ1wiXScpLmZhZGVJbig0MDApO1xuICAgICAgICAgICAgICAgICQoJ1tkYXRhLWFscGhhPVwiJytoYXNoKydcIl0nKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgX2NvdW50ID0gJCgnW2RhdGEtYWxwaGEtZmlsdGVyPVwiJytoYXNoKydcIl0nKS5zaXplKCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX2FscGhhYmV0cy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtYWxwaGE9XCJhbGxcIl0nKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgX3JlZmluZW1lbnRzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcblxuICAgICAgICAgICAgICAgIC8vIHN0b3JlIGZpbHRlcnMgaW4gYXJyYXlcbiAgICAgICAgICAgICAgICB2YXIgYWN0aXZlRmlsdGVycyA9IGhhc2guc3BsaXQoJywnKTtcblxuICAgICAgICAgICAgICAgIC8vIHNob3cgcmVzdWx0cyBiYXNlZCBvbiBhY3RpdmUgZmlsdGVyIGFycmF5XG4gICAgICAgICAgICAgICAgX2NvbnRlbnRSb3dzLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICAgICAgICAgICAgdmFyIHRoZXNlVGFncyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy50YWdzIHNwYW4nKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHRoZXNlVGFncy5wdXNoKHRoaXMpO1xuICAgICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgICAgdmFyIF9jZWxsVGV4dCA9IHRoZXNlVGFncy5tYXAoaXRlbSA9PiBpdGVtLnRleHRDb250ZW50KTtcblxuICAgICAgICAgICAgICAgICAgdmFyIHRoaXNDb250YWlucyA9IGFjdGl2ZUZpbHRlcnMuZXZlcnkoZnVuY3Rpb24odmFsKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9jZWxsVGV4dC5pbmRleE9mKHZhbCkgPj0gMDtcbiAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAvKmZvciAodmFyIGZpbHRlcml0ZW0gb2YgYWN0aXZlRmlsdGVycykge1xuICAgICAgICAgICAgICAgICAgICAkKCdbZGF0YS1maWx0ZXI9XCInK2ZpbHRlcml0ZW0rJ1wiXScpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgIH0qL1xuXG4gICAgICAgICAgICAgICAgICB2YXIgYXJyYXlMZW5ndGggPSBhY3RpdmVGaWx0ZXJzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmlsdGVyaXRlbSA9IGFjdGl2ZUZpbHRlcnNbaV07XG4gICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLWZpbHRlcj1cIicrZmlsdGVyaXRlbSsnXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBpZih0aGlzQ29udGFpbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgX2NvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuZmFkZUluKDQwMCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJCgnLm5vLXJlc3VsdHMnKS5yZW1vdmUoKTtcblxuICAgICAgICAgICAgaWYoX2NvdW50ID09PSAwKXtcbiAgICAgICAgICAgICAgJCgnPGRpdiBjbGFzcz1cIm5vLXJlc3VsdHNcIj5UaGVyZSBhcmUgbm8gcmVzdWx0cy4gPGEgaHJlZj1cIiNcIj5WSUVXIEFMTDwvYT48L2Rpdj4nKS5hcHBlbmRUbygnLnJlc3VsdHMnKTtcblxuICAgICAgICAgICAgICAkKCcubm8tcmVzdWx0cyBhJykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIF9jb250ZW50Um93cy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgX2FscGhhYmV0cy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgX3JlZmluZW1lbnRzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS1hbHBoYT1cImFsbFwiXScpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS1maWx0ZXI9XCJhbGxcIl0nKS5hZGRDbGFzcygnYWN0aXZlJylcbiAgICAgICAgICAgICAgICBfY29udGVudFJvd3MuZmFkZUluKDQwMCk7XG4gICAgICAgICAgICAgICAgJCgnLm5vLXJlc3VsdHMnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB2YXIgaGFzaCA9ICcjYWxsJztcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGhhc2g7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBjbGVhckludGVydmFsKGNoZWNrRXhpc3QpO1xuXG4gICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ2hhc2hjaGFuZ2UnKTtcblxuICAgICAgICB9XG4gICAgIH0sIDEwMCk7XG5cbiAgfSxcbiAgYnVpbGRXZWJQYXJ0OiBmdW5jdGlvbiBidWlsZFdlYlBhcnQoKVxuICB7XG4gICAgICAvLyBSZW5kZXIgZmlsdGVyaW5nIGNvbHVtblxuICAgICAgdGhpc2NvbnRhaW5lci5hcHBlbmQoJzxkaXYgY2xhc3M9XCJmaWx0ZXItdG9nZ2xlXCI+PGkgY2xhc3M9XCJmYSBmYS1maWx0ZXJcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+PHNwYW4gY2xhc3M9XCJ0ZXh0XCI+RmlsdGVyPC9zcGFuPjwvZGl2PjxkaXYgY2xhc3M9XCJmaWx0ZXItY29sdW1uIGNvbC1tZC0zXCI+PC9kaXY+Jyk7XG5cbiAgICAgIC8vIFJlbmRlciByZXN1bHRzIGNvbHVtblxuICAgICAgdGhpc2NvbnRhaW5lci5hcHBlbmQoJzxkaXYgY2xhc3M9XCJwYXJ0bmVyc2hpcC1yZXN1bHRzLWNvbHVtbiBjb2wtbWQtOVwiPicpO1xuICAgICAgICAgIC8vIFJlbmRlciBhbHBoYWJldCBuYXZpZ2F0aW9uXG4gICAgICAgICAgJChyZXN1bHRzUGFyZW50Q29udGFpbmVyKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJhbHBoYS1maWx0ZXJcIj4nKTtcblxuICAgICAgICAgICAgcGFydG5lcnNoaXBzLmJ1aWxkQWxwaGFiZXQoKTtcblxuICAgICAgICAgICQocmVzdWx0c1BhcmVudENvbnRhaW5lcikuYXBwZW5kKCc8L2Rpdj4nKTtcbiAgICAgICAgICAvLyBSZW5kZXIgcmVzdWx0cyBwYW5lbFxuICAgICAgICAgICQocmVzdWx0c1BhcmVudENvbnRhaW5lcikuYXBwZW5kKCc8ZGl2IGNsYXNzPVwicmVzdWx0c1wiPicpO1xuXG4gICAgICAgICAgICAvLyBSZW5kZXIgcmVzdWx0c1xuICAgICAgICAgICAgbGlzdHMuZ2V0TGlzdEl0ZW1zKHtcbiAgICAgICAgICAgICAgbGlzdG5hbWU6ICdQYXJ0bmVyc2hpcHMnLCAvL2xpc3RuYW1lLFxuICAgICAgICAgICAgICBmaWVsZHM6ICdUaXRsZSxEZXNjLEhUTUxEZXNjcmlwdGlvbixFbmFibGVkLExpbmtVUkwsQ2VydGlmaWNhdGlvbixDb25jZW50cmF0aW9uLERlZ3JlZSxQYXJ0bmVyc2hpcFR5cGUsVGVjaG5vbG9neSxJZCxPcGVuTGlua0luTmV3V2luZG93JyxcbiAgICAgICAgICAgICAgb3JkZXJieTogJ1RpdGxlJ1xuICAgICAgICAgICAgfSxmdW5jdGlvbihpdGVtcyl7XG4gICAgICAgICAgICAgIHZhciBpdGVtc2RhdGEgPSBpdGVtcy5kLnJlc3VsdHM7XG4gICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXNkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRoaXNUaXRsZSA9IGl0ZW1zZGF0YVtpXS5UaXRsZTtcbiAgICAgICAgICAgICAgICB2YXIgdGhpc0Rlc2MgPSBpdGVtc2RhdGFbaV0uRGVzYztcbiAgICAgICAgICAgICAgICB2YXIgdGhpc0hUTUwgPSBpdGVtc2RhdGFbaV0uSFRNTERlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgIHZhciB0aGlzRW5hYmxlZCA9IGl0ZW1zZGF0YVtpXS5FbmFibGVkO1xuICAgICAgICAgICAgICAgIHZhciB0aGlzSUQgPSBpdGVtc2RhdGFbaV0uSWQ7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1dpbmRvdyA9IGl0ZW1zZGF0YVtpXS5PcGVuTGlua0luTmV3V2luZG93O1xuXG4gICAgICAgICAgICAgICAgdmFyIGxldHRlciA9IHRoaXNUaXRsZS50b0xvd2VyQ2FzZSgpLnN1YnN0cmluZygwLDEpO1xuICAgICAgICAgICAgICAgIHZhciBmaW5hbERlc2NyaXB0aW9uID0gJyc7XG4gICAgICAgICAgICAgICAgdmFyIHRoaXNUaXRsZUJ1aWxkID0gJzxkaXYgY2xhc3M9XCJ0aXRsZVwiPicrdGhpc1RpdGxlKyc8L2Rpdj4nO1xuXG4gICAgICAgICAgICAgICAgaWYodGhpc0Rlc2MgIT0gdW5kZWZpbmVkIHx8IHRoaXNEZXNjICE9IG51bGwpe1xuICAgICAgICAgICAgICAgICAgZmluYWxEZXNjcmlwdGlvbiA9ICc8ZGl2IGNsYXNzPVwiZGVzY3JpcHRpb25cIj4nK3RoaXNEZXNjKyc8L2Rpdj4nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZih0aGlzSFRNTCAhPSB1bmRlZmluZWQgfHwgdGhpc0hUTUwgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGlzSFRNTHRleHQgPSAkKCc8ZGl2PicrdGhpc0hUTUwrJzwvZGl2PicpLnRleHQoKS50cmltKCkucmVwbGFjZSgvXFx1MjAwQi9nLCcnKS5yZXBsYWNlKC8gL2csICcnKS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXNIVE1MdGV4dCAhPSAwKXtcbiAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzSFRNTHRleHQgPiAzMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsRGVzY3JpcHRpb24gPSAnPGRpdiBjbGFzcz1cImRlc2NyaXB0aW9uXCI+PGRpdiBjbGFzcz1cImRlc2MtaW5uZXIgdHJpbW1lZFwiPicrdGhpc0hUTUwrJzxici8+PGEgaHJlZj1cIiNcIiBjbGFzcz1cImRlc2NyaXB0aW9uLWxlc3MtbGluayBkZXNjcmlwdGlvbi10b2dnbGUtbGlua1wiPlZpZXcgTGVzczwvYT48L2Rpdj48ZGl2IGNsYXNzPVwiZGVzY3JpcHRpb24tb3ZlcmxheVwiPjwvZGl2PjxhIGhyZWY9XCIjXCIgY2xhc3M9XCJkZXNjcmlwdGlvbi1tb3JlLWxpbmsgZGVzY3JpcHRpb24tdG9nZ2xlLWxpbmtcIj5WaWV3IE1vcmU8L2E+PC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxEZXNjcmlwdGlvbiA9ICc8ZGl2IGNsYXNzPVwiZGVzY3JpcHRpb25cIj4nK3RoaXNIVE1MKyc8L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKHRoaXNFbmFibGVkKXtcblxuICAgICAgICAgICAgICAgICAgaWYoaXRlbXNkYXRhW2ldLkxpbmtVUkwgIT0gbnVsbCAmJiBpdGVtc2RhdGFbaV0uTGlua1VSTCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNVcmwgPSBpdGVtc2RhdGFbaV0uTGlua1VSTC5Vcmw7XG4gICAgICAgICAgICAgICAgICAgIGlmKG5ld1dpbmRvdyl7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpc1RpdGxlQnVpbGQgPSAnPGRpdiBjbGFzcz1cInRpdGxlXCI+PGEgaHJlZj1cIicgKyB0aGlzVXJsICsgJ1wiIGNsYXNzPVwicGFydG5lcnNoaXAtdGl0bGVcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nICsgdGhpc1RpdGxlICsgJzwvYT48L2Rpdj4nXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpc1RpdGxlQnVpbGQgPSAnPGRpdiBjbGFzcz1cInRpdGxlXCI+PGEgaHJlZj1cIicgKyB0aGlzVXJsICsgJ1wiIGNsYXNzPVwicGFydG5lcnNoaXAtdGl0bGVcIj4nICsgdGhpc1RpdGxlICsgJzwvYT48L2Rpdj4nXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgdmFyIHNQYXJlbnQgPSAnPGRpdiBjbGFzcz1cInBhcnRuZXJzaGlwLWl0ZW1cIiBkYXRhLWFscGhhLWZpbHRlcj1cIicrbGV0dGVyKydcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgdGhpc1RpdGxlQnVpbGQgK1xuICAgICAgICAgICAgICAgICAgICBmaW5hbERlc2NyaXB0aW9uICtcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJ0YWdzXCI+JztcbiAgICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9ICcnO1xuXG4gICAgICAgICAgICAgICAgICBpZihpdGVtc2RhdGFbaV0uUGFydG5lcnNoaXBUeXBlLnJlc3VsdHMubGVuZ3RoID49IDEgJiYgaXRlbXNkYXRhW2ldLlBhcnRuZXJzaGlwVHlwZS5yZXN1bHRzICE9IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnRuZXJzaGlwVHlwZUFyciA9IGl0ZW1zZGF0YVtpXS5QYXJ0bmVyc2hpcFR5cGUucmVzdWx0cztcblxuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGo9MDsgaiA8IHBhcnRuZXJzaGlwVHlwZUFyci5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgIHZhciB0aGlzUGFydG5lcnNoaXBUeXBlID0gcGFydG5lcnNoaXBUeXBlQXJyW2pdLkxhYmVsO1xuICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zICs9ICc8c3Bhbj4nICsgdGhpc1BhcnRuZXJzaGlwVHlwZSArICc8L3NwYW4+JztcbiAgICAgICAgICAgICAgICAgICAgICBwYXJ0bmVyc2hpcFRhZ3MucHVzaCh0aGlzUGFydG5lcnNoaXBUeXBlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGlmKGl0ZW1zZGF0YVtpXS5Db25jZW50cmF0aW9uLnJlc3VsdHMubGVuZ3RoID49IDEgJiYgaXRlbXNkYXRhW2ldLkNvbmNlbnRyYXRpb24ucmVzdWx0cyAhPSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBqPTA7IGogPCBpdGVtc2RhdGFbaV0uQ29uY2VudHJhdGlvbi5yZXN1bHRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNDb25jZW50cmF0aW9uID0gaXRlbXNkYXRhW2ldLkNvbmNlbnRyYXRpb24ucmVzdWx0c1tqXS5MYWJlbDtcbiAgICAgICAgICAgICAgICAgICAgICBpdGVtcyArPSAnPHNwYW4+JyArIHRoaXNDb25jZW50cmF0aW9uICsgJzwvc3Bhbj4nO1xuICAgICAgICAgICAgICAgICAgICAgIGNvbmNlbnRyYXRpb25UYWdzLnB1c2godGhpc0NvbmNlbnRyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgaWYoaXRlbXNkYXRhW2ldLlRlY2hub2xvZ3kucmVzdWx0cy5sZW5ndGggPj0gMSAmJiBpdGVtc2RhdGFbaV0uVGVjaG5vbG9neS5yZXN1bHRzICE9IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBqPTA7IGogPCBpdGVtc2RhdGFbaV0uVGVjaG5vbG9neS5yZXN1bHRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNUZWNobm9sb2d5ID0gaXRlbXNkYXRhW2ldLlRlY2hub2xvZ3kucmVzdWx0c1tqXS5MYWJlbDtcbiAgICAgICAgICAgICAgICAgICAgICBpdGVtcyArPSAnPHNwYW4+JyArIHRoaXNUZWNobm9sb2d5ICsgJzwvc3Bhbj4nO1xuICAgICAgICAgICAgICAgICAgICAgIHRlY2hub2xvZ3lUYWdzLnB1c2godGhpc1RlY2hub2xvZ3kpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGlmKGl0ZW1zZGF0YVtpXS5DZXJ0aWZpY2F0aW9uLnJlc3VsdHMubGVuZ3RoICA+PSAxICYmIGl0ZW1zZGF0YVtpXS5DZXJ0aWZpY2F0aW9uLnJlc3VsdHMgIT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGo9MDsgaiA8IGl0ZW1zZGF0YVtpXS5DZXJ0aWZpY2F0aW9uLnJlc3VsdHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc0NlcnRpZmljYXRpb24gPSBpdGVtc2RhdGFbaV0uQ2VydGlmaWNhdGlvbi5yZXN1bHRzW2pdLkxhYmVsO1xuICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zICs9ICc8c3Bhbj4nICsgdGhpc0NlcnRpZmljYXRpb24gKyAnPC9zcGFuPic7XG4gICAgICAgICAgICAgICAgICAgICAgY2VydGlmaWNhdGlvblRhZ3MucHVzaCh0aGlzQ2VydGlmaWNhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgaWYoaXRlbXNkYXRhW2ldLkRlZ3JlZS5yZXN1bHRzLmxlbmd0aCAgPj0gMSAmJiBpdGVtc2RhdGFbaV0uRGVncmVlLnJlc3VsdHMgIT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGo9MDsgaiA8IGl0ZW1zZGF0YVtpXS5EZWdyZWUucmVzdWx0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgIHZhciB0aGlzRGVncmVlID0gaXRlbXNkYXRhW2ldLkRlZ3JlZS5yZXN1bHRzW2pdLkxhYmVsO1xuICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zICs9ICc8c3Bhbj4nICsgdGhpc0RlZ3JlZSArICc8L3NwYW4+JztcbiAgICAgICAgICAgICAgICAgICAgICBkZWdyZWVUYWdzLnB1c2godGhpc0RlZ3JlZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgdmFyIGNQYXJlbnQgPSAnPC9kaXY+PC9kaXY+JztcblxuICAgICAgICAgICAgICAgICAgJChyZXN1bHRzQ29udGFpbmVyKS5hcHBlbmQoc1BhcmVudCArIGl0ZW1zICsgY1BhcmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICQocmVzdWx0c1BhcmVudENvbnRhaW5lcikuYXBwZW5kKCc8L2Rpdj4nKTtcbiAgICAgIHRoaXNjb250YWluZXIuYXBwZW5kKCc8L2Rpdj4nKTtcbiAgfSxcbiAgYnVpbGRBbHBoYWJldDogZnVuY3Rpb24gYnVpbGRBbHBoYWJldCgpXG4gIHtcbiAgICAkKHJlc3VsdHNOYXZpZ2F0aW9uQ29udGFpbmVyKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJhbHBoYWJldFwiPicgK1xuICAgICAgJzx1bD4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJhbGxcIiBjbGFzcz1cImFjdGl2ZVwiPkFsbDwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImFcIj5BPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiYlwiPkI8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJjXCI+QzwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImRcIj5EPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiZVwiPkU8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJmXCI+RjwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImdcIj5HPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiaFwiPkg8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJpXCI+STwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImpcIj5KPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwia1wiPks8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJsXCI+TDwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cIm1cIj5NPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiblwiPk48L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJvXCI+TzwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInBcIj5QPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwicVwiPlE8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJyXCI+UjwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInNcIj5TPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwidFwiPlQ8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ1XCI+VTwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInZcIj5WPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwid1wiPlc8L2E+PC9saT4nICtcbiAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ4XCI+WDwvYT48L2xpPicgK1xuICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInlcIj5ZPC9hPjwvbGk+JyArXG4gICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwielwiPlo8L2E+PC9saT4nICtcbiAgICAgICc8L3VsPicgK1xuICAgICAgJzwvZGl2PicpO1xuICAgICAgJCgnI3BhcnRuZXJzaGlwLWNvbnRhaW5lcicpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJhbHBoYS1maWx0ZXJcIj48ZGl2IGNsYXNzPVwiYWxwaGFiZXQgbW9iaWxlLWFscGhhYmV0XCI+PGRpdiBjbGFzcz1cIm1vYmlsZS1hbHBoYS10cmlnZ2VyXCI+PHNwYW4gY2xhc3M9XCJhcnJvd1wiPjxpIGNsYXNzPVwiZmEgZmEtYW5nbGUtZG93blwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L3NwYW4+PC9kaXY+JyArXG4gICAgICAgICc8dWwgY2xhc3M9XCJtb2JpbGUtYWxwaGEtbGlzdFwiPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiYWxsXCIgY2xhc3M9XCJhY3RpdmVcIj5BbGw8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImFcIj5BPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJiXCI+QjwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiY1wiPkM8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImRcIj5EPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJlXCI+RTwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiZlwiPkY8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImdcIj5HPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJoXCI+SDwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiaVwiPkk8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cImpcIj5KPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJrXCI+SzwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwibFwiPkw8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cIm1cIj5NPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJuXCI+TjwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwib1wiPk88L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInBcIj5QPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJxXCI+UTwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwiclwiPlI8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInNcIj5TPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ0XCI+VDwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwidVwiPlU8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInZcIj5WPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ3XCI+VzwvYT48L2xpPicgK1xuICAgICAgICAgICc8bGk+PGEgaHJlZj1cIiNcIiBkYXRhLWFscGhhPVwieFwiPlg8L2E+PC9saT4nICtcbiAgICAgICAgICAnPGxpPjxhIGhyZWY9XCIjXCIgZGF0YS1hbHBoYT1cInlcIj5ZPC9hPjwvbGk+JyArXG4gICAgICAgICAgJzxsaT48YSBocmVmPVwiI1wiIGRhdGEtYWxwaGE9XCJ6XCI+WjwvYT48L2xpPicgK1xuICAgICAgICAnPC91bD4nICtcbiAgICAgICAgJzwvZGl2PjwvZGl2PicpO1xuICB9LFxuICBidWlsZFJlZmluZW1lbnQ6IGZ1bmN0aW9uIGJ1aWxkUmVmaW5lbWVudCgpXG4gIHtcbiAgICBwYXJ0bmVyc2hpcFRhZ3Muc29ydCgpO1xuICAgIGNvbmNlbnRyYXRpb25UYWdzLnNvcnQoKTtcbiAgICB0ZWNobm9sb2d5VGFncy5zb3J0KCk7XG4gICAgY2VydGlmaWNhdGlvblRhZ3Muc29ydCgpO1xuICAgIGRlZ3JlZVRhZ3Muc29ydCgpO1xuXG4gICAgJChmaWx0ZXJQYXJlbnRDb250YWluZXIpLmFwcGVuZCgnPGRpdiBpZD1cImFsbC1maWx0ZXJcIiBjbGFzcz1cImZpbHRlci1ncm91cFwiIGNsYXNzPVwib3BlbmVkXCI+JyArXG4gICAgICAnPHVsIGNsYXNzPVwiZmlsdGVyLWdyb3VwLW9wdGlvbnNcIj48bGkgZGF0YS1maWx0ZXI9XCJhbGxcIiBjbGFzcz1cImFjdGl2ZVwiPjxkaXYgY2xhc3M9XCJmaWx0ZXItY2hlY2tib3hcIj48L2Rpdj48ZGl2IGNsYXNzPVwiZmlsdGVyLXRpdGxlXCI+VklFVyBBTEw8L2Rpdj48L2xpPjwvdWw+PC9kaXY+Jyk7XG5cbiAgICAkKGZpbHRlclBhcmVudENvbnRhaW5lcikuYXBwZW5kKCc8ZGl2IGlkPVwicGFydG5lcnNoaXAtdHlwZVwiIGNsYXNzPVwiZmlsdGVyLWdyb3VwXCIgY2xhc3M9XCJvcGVuZWRcIj4nICtcbiAgICAgICc8aDMgY2xhc3M9XCJmaWx0ZXItZ3JvdXAtdGl0bGVcIj5QYXJ0bmVyc2hpcCBUeXBlPC9oMz4nICtcbiAgICAgICAgJzx1bCBjbGFzcz1cImZpbHRlci1ncm91cC1vcHRpb25zXCI+Jyk7XG4gICAgICAgIHBhcnRuZXJzaGlwcy5nZXRVbmlxdWVSZXN1bHRzKHBhcnRuZXJzaGlwVGFncykuZm9yRWFjaChmdW5jdGlvbihwYXJ0bmVyc2hpcCkge1xuICAgICAgICAgIHBhcnRuZXJzaGlwcy5hZGRSZWZpbmVtZW50SXRlbShwYXJ0bmVyc2hpcCwgJ3BhcnRuZXJzaGlwLXR5cGUnKTtcbiAgICAgICAgfSk7XG4gICAgJChmaWx0ZXJQYXJlbnRDb250YWluZXIpLmFwcGVuZCgnPC91bD48L2Rpdj4nKTtcblxuICAgICAgICAkKGZpbHRlclBhcmVudENvbnRhaW5lcikuYXBwZW5kKCc8ZGl2IGlkPVwiY29uY2VudHJhdGlvblwiIGNsYXNzPVwiZmlsdGVyLWdyb3VwXCIgY2xhc3M9XCJvcGVuZWRcIj4nICtcbiAgICAgICAgICAnPGgzIGNsYXNzPVwiZmlsdGVyLWdyb3VwLXRpdGxlXCI+Q29uY2VudHJhdGlvbjwvaDM+JyArXG4gICAgICAgICAgICAnPHVsIGNsYXNzPVwiZmlsdGVyLWdyb3VwLW9wdGlvbnNcIj4nKTtcbiAgICAgICAgICAgIHBhcnRuZXJzaGlwcy5nZXRVbmlxdWVSZXN1bHRzKGNvbmNlbnRyYXRpb25UYWdzKS5mb3JFYWNoKGZ1bmN0aW9uKGNvbmNlbnRyYXRpb24pIHtcbiAgICAgICAgICAgICAgcGFydG5lcnNoaXBzLmFkZFJlZmluZW1lbnRJdGVtKGNvbmNlbnRyYXRpb24sICdjb25jZW50cmF0aW9uJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgJChmaWx0ZXJQYXJlbnRDb250YWluZXIpLmFwcGVuZCgnPC91bD48L2Rpdj4nKTtcblxuICAgICAgICAkKGZpbHRlclBhcmVudENvbnRhaW5lcikuYXBwZW5kKCc8ZGl2IGlkPVwidGVjaG5vbG9neVwiIGNsYXNzPVwiZmlsdGVyLWdyb3VwXCIgY2xhc3M9XCJvcGVuZWRcIj4nICtcbiAgICAgICAgICAnPGgzIGNsYXNzPVwiZmlsdGVyLWdyb3VwLXRpdGxlXCI+VGVjaG5vbG9neTwvaDM+JyArXG4gICAgICAgICAgICAnPHVsIGNsYXNzPVwiZmlsdGVyLWdyb3VwLW9wdGlvbnNcIj4nKTtcbiAgICAgICAgICAgIHBhcnRuZXJzaGlwcy5nZXRVbmlxdWVSZXN1bHRzKHRlY2hub2xvZ3lUYWdzKS5mb3JFYWNoKGZ1bmN0aW9uKHRlY2hub2xvZ3kpIHtcbiAgICAgICAgICAgICAgcGFydG5lcnNoaXBzLmFkZFJlZmluZW1lbnRJdGVtKHRlY2hub2xvZ3ksICd0ZWNobm9sb2d5Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgJChmaWx0ZXJQYXJlbnRDb250YWluZXIpLmFwcGVuZCgnPC91bD48L2Rpdj4nKTtcblxuICAgICAgICAkKGZpbHRlclBhcmVudENvbnRhaW5lcikuYXBwZW5kKCc8ZGl2IGlkPVwiY2VydGlmaWNhdGlvblwiIGNsYXNzPVwiZmlsdGVyLWdyb3VwXCIgY2xhc3M9XCJvcGVuZWRcIj4nICtcbiAgICAgICAgICAnPGgzIGNsYXNzPVwiZmlsdGVyLWdyb3VwLXRpdGxlXCI+Q2VydGlmaWNhdGlvbjwvaDM+JyArXG4gICAgICAgICAgICAnPHVsIGNsYXNzPVwiZmlsdGVyLWdyb3VwLW9wdGlvbnNcIj4nKTtcbiAgICAgICAgICAgIHBhcnRuZXJzaGlwcy5nZXRVbmlxdWVSZXN1bHRzKGNlcnRpZmljYXRpb25UYWdzKS5mb3JFYWNoKGZ1bmN0aW9uKGNlcnRpZmljYXRpb24pIHtcbiAgICAgICAgICAgICAgcGFydG5lcnNoaXBzLmFkZFJlZmluZW1lbnRJdGVtKGNlcnRpZmljYXRpb24sICdjZXJ0aWZpY2F0aW9uJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgJChmaWx0ZXJQYXJlbnRDb250YWluZXIpLmFwcGVuZCgnPC91bD48L2Rpdj4nKTtcblxuICAgICAgICAkKGZpbHRlclBhcmVudENvbnRhaW5lcikuYXBwZW5kKCc8ZGl2IGlkPVwiZGVncmVlXCIgY2xhc3M9XCJmaWx0ZXItZ3JvdXBcIiBjbGFzcz1cIm9wZW5lZFwiPicgK1xuICAgICAgICAgICc8aDMgY2xhc3M9XCJmaWx0ZXItZ3JvdXAtdGl0bGVcIj5EZWdyZWU8L2gzPicgK1xuICAgICAgICAgICAgJzx1bCBjbGFzcz1cImZpbHRlci1ncm91cC1vcHRpb25zXCI+Jyk7XG4gICAgICAgICAgICBwYXJ0bmVyc2hpcHMuZ2V0VW5pcXVlUmVzdWx0cyhkZWdyZWVUYWdzKS5mb3JFYWNoKGZ1bmN0aW9uKGRlZ3JlZSkge1xuICAgICAgICAgICAgICBwYXJ0bmVyc2hpcHMuYWRkUmVmaW5lbWVudEl0ZW0oZGVncmVlLCAnZGVncmVlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgJChmaWx0ZXJQYXJlbnRDb250YWluZXIpLmFwcGVuZCgnPC91bD48L2Rpdj4nKTtcbiAgfSxcbiAgYWRkUmVmaW5lbWVudEl0ZW06IGZ1bmN0aW9uIGFkZFJlZmluZW1lbnRJdGVtKHRhZywgaWQpXG4gIHtcbiAgICAkKCcjJyArIGlkICsgJz4gdWwnKS5hcHBlbmQoJzxsaSBkYXRhLWZpbHRlcj1cIicgKyB0YWcgKyAnXCI+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImZpbHRlci1jaGVja2JveFwiPjwvZGl2PicgK1xuICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImZpbHRlci10aXRsZVwiPicgKyB0YWcgKyAnPC9kaXY+JyArXG4gICAgICAgICAgJzwvbGk+Jyk7XG4gIH0sXG4gIGZpbHRlclJlc3VsdHNCeUFscGhhYmV0OiBmdW5jdGlvbiBmaWx0ZXJSZXN1bHRzQnlBbHBoYWJldCgpIHtcblxuICAgICQoJy5tb2JpbGUtYWxwaGEtdHJpZ2dlcicpLmNsaWNrKGZ1bmN0aW9uKCl7XG4gICAgICAkKCcubW9iaWxlLWFscGhhLWxpc3QnKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAkKHRoaXMpLm5leHQoKS5maW5kKCdhJykuYWRkQ2xhc3MoJ21vYmlsZS1hY3RpdmUnKTtcbiAgICB9KVxuXG4gICAgdmFyIF9hbHBoYWJldHMgPSAkKCcuYWxwaGFiZXQgPiB1bCA+IGxpID4gYScpO1xuXG4gICAgX2FscGhhYmV0cy5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciB2YWx1ZSA9ICQodGhpcykuYXR0cignZGF0YS1hbHBoYScpLnRvTG93ZXJDYXNlKCk7XG4gICAgICB2YXIgaGFzaCA9ICcjJyArIHZhbHVlO1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBoYXNoO1xuICAgIH0pO1xuICB9LFxuICBmaWx0ZXJSZXN1bHRzQnlSZWZpbmVtZW50OiBmdW5jdGlvbiBmaWx0ZXJSZXN1bHRzQnlSZWZpbmVtZW50KCkge1xuXG4gICAgJCgnLmZpbHRlci10b2dnbGUnKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgaWYoJCh0aGlzKS5oYXNDbGFzcygnYWN0aXZlJykpIHtcbiAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJy5maWx0ZXItY29sdW1uJykuc2xpZGVVcCg0MDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJy5maWx0ZXItY29sdW1uJykuc2xpZGVEb3duKDQwMCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgX3JlZmluZW1lbnRzID0gJCgnLmZpbHRlci1ncm91cCA+IHVsID4gbGknKTtcblxuICAgIF9yZWZpbmVtZW50cy5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2YWx1ZSA9ICQodGhpcykuYXR0cignZGF0YS1maWx0ZXInKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgdmFyIGFjdGl2ZUZpbHRlcnMgPSAnYWxsJztcblxuICAgICAgaWYodmFsdWUgIT0gJ2FsbCcpIHtcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKTtcbiAgICAgICAgJCgnW2RhdGEtZmlsdGVyPVwiYWxsXCJdJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICBhY3RpdmVGaWx0ZXJzID0gJyc7XG5cbiAgICAgICAgLy8gc3RvcmUgYW55IHJlbWFpbmluZyBhY3RpdmUgZmlsdGVycyBpbiBhcnJheVxuICAgICAgICAgICAgJCgnW2RhdGEtZmlsdGVyXS5hY3RpdmUnKS5lYWNoKGZ1bmN0aW9uKGkpe1xuICAgICAgICAgICAgICB2YXIgdGhpc0FjdGl2ZUZpbHRlciA9ICQodGhpcykuYXR0cignZGF0YS1maWx0ZXInKTtcbiAgICAgICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICAgIGFjdGl2ZUZpbHRlcnMgPSBhY3RpdmVGaWx0ZXJzLmNvbmNhdChcIixcIiArIHRoaXNBY3RpdmVGaWx0ZXIpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFjdGl2ZUZpbHRlcnMgPSBhY3RpdmVGaWx0ZXJzLmNvbmNhdCh0aGlzQWN0aXZlRmlsdGVyKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC8vIGVzNiBtZXRob2QgYWN0aXZlRmlsdGVycyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZmlsdGVyXS5hY3RpdmUnKSkubWFwKGl0ZW0gPT4gaXRlbS5kYXRhc2V0LmZpbHRlcik7XG4gICAgICB9XG5cbiAgICAgIHZhciBoYXNoID0gJyMnICsgYWN0aXZlRmlsdGVycztcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gaGFzaDtcbiAgICB9KTtcbiAgfSxcbiAgICBnZXRVbmlxdWVSZXN1bHRzOiBmdW5jdGlvbiBnZXRVbmlxdWVSZXN1bHRzKGFycilcbiAgICB7XG4gICAgICB2YXIgdW5pcXVlQXJyYXkgPSBhcnIuZmlsdGVyKGZ1bmN0aW9uKGVsZW0sIHBvcywgYXJyKSB7XG4gICAgICAgIHJldHVybiBhcnIuaW5kZXhPZihlbGVtKSA9PSBwb3M7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHVuaXF1ZUFycmF5O1xuICAgIH0sXG4gICAgcmVzZXRXZWJQYXJ0OiBmdW5jdGlvbiByZXNldFdlYlBhcnQoKVxuICAgIHtcbiAgICAgIHZhciBjb250YWluZXIgPSAnI3BhcnRuZXJzaGlwLWNvbnRhaW5lcic7XG4gICAgICB2YXIgdGhpc2NvbnRhaW5lciA9ICQoY29udGFpbmVyKTtcbiAgICAgIHRoaXNjb250YWluZXIuZW1wdHkoKTtcbiAgICB9XG59XG4iLCJjb25zdCBsaXN0cyA9IHdpbmRvdy5saXN0cyA9IHJlcXVpcmUoJy4vbGlzdHMnKTtcbmNvbnN0IHV0aWxpdGllcyA9IHdpbmRvdy51dGlsaXRpZXMgPSByZXF1aXJlKCcuL3V0aWxpdGllcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvLyBza2VsZXRvbiBjb2RlIGZvciB3ZWIgcGFydFxuICBsb2FkOiBmdW5jdGlvbihvcHRpb25zKXtcbiAgICBsZXQgc2V0dGluZ3MgPSAkLmV4dGVuZCh0cnVlLCB7fSwge1xuICAgICAgdHJpZ2dlcjogJy53cC1yZXNvdXJjZXMnLFxuICAgICAgY29udGFpbmVyOiAnLnJlc291cmNlcy1jb250YWluZXInLFxuICAgICAgY29udGVudHR5cGVpZDogJzB4MDEwMEIwMzhDNkE5RUY0RjEwNDY4NzA4QTY0QUM5Mjg5RDhGJyAvLyByZXNvdXJjZXN3ZWJwYXJ0XG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICAoZnVuY3Rpb24oJCl7XG5cbiAgICAgIGxpc3RzLmJ1aWxkd2VicGFydCh7XG4gICAgICAgIHRyaWdnZXI6IHNldHRpbmdzLnRyaWdnZXIsXG4gICAgICAgIGNvbnRhaW5lcjogc2V0dGluZ3MuY29udGFpbmVyXG4gICAgICB9KTtcblxuICAgICAgJChzZXR0aW5ncy5jb250YWluZXIpLmVhY2goZnVuY3Rpb24oKXtcblxuICAgICAgICB2YXIgdGhpc0NvbnRhaW5lciA9ICQodGhpcyk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGFueSBwcmV2aW91c2x5LWZldGNoZWQgaXRlbXNcbiAgICAgICAgdGhpc0NvbnRhaW5lci5jaGlsZHJlbignLnJlc291cmNlLWl0ZW1zJykucmVtb3ZlKCk7XG5cbiAgICAgICAgaWYodGhpc0NvbnRhaW5lci5jbG9zZXN0KCcubXMtd2VicGFydHpvbmUtY2VsbCcpLmZpbmQoJy5tcy13ZWJwYXJ0LWNocm9tZS10aXRsZScpLnNpemUoKSA+IDApe1xuICAgICAgICAgIHZhciB3ZWJwYXJ0RGVzY3JpcHRpb24gPSB0aGlzQ29udGFpbmVyLmNsb3Nlc3QoJy5tcy13ZWJwYXJ0em9uZS1jZWxsJykuZmluZCgnLmpzLXdlYnBhcnQtdGl0bGVDZWxsJykuYXR0cigndGl0bGUnKS5zcGxpdCgnIC0gJylbMV07XG4gICAgICAgICAgaWYod2VicGFydERlc2NyaXB0aW9uLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgdGhpc0NvbnRhaW5lci5jbG9zZXN0KCcubXMtd2VicGFydHpvbmUtY2VsbCcpLmZpbmQoJ2gyLm1zLXdlYnBhcnQtdGl0bGVUZXh0JykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwid2VicGFydC1kZXNjcmlwdGlvblwiPicrd2VicGFydERlc2NyaXB0aW9uKSsnPC9kaXY+JztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBnZXQgbGlzdCBuYW1lXG4gICAgICAgIHZhciBsaXN0bmFtZSA9IHRoaXNDb250YWluZXIuY2xvc2VzdCgnLm1zLXdlYnBhcnR6b25lLWNlbGwnKS5maW5kKHNldHRpbmdzLnRyaWdnZXIpLmF0dHIoJ2RhdGEtbGlzdCcpO1xuXG4gICAgICAgIC8vIGdldCBsaXN0IGl0ZW1zXG4gICAgICAgIGlmKCFib25lcy5wYWdlLmVkaXRtb2RlKXtcbiAgICAgICAgICBsaXN0cy5nZXRMaXN0SXRlbXMoe1xuICAgICAgICAgICAgbGlzdG5hbWU6IGxpc3RuYW1lLFxuICAgICAgICAgICAgZmllbGRzOiAnVGl0bGUsRGVzYyxFbmFibGVkLExpbmtVUkwsU29ydE9yZGVyLElkLE9wZW5MaW5rSW5OZXdXaW5kb3cnLFxuICAgICAgICAgICAgb3JkZXJieTogJ1NvcnRPcmRlcidcbiAgICAgICAgICB9LGZ1bmN0aW9uKGl0ZW1zKXtcbiAgICAgICAgICAgIHZhciBpdGVtc2RhdGEgPSBpdGVtcy5kLnJlc3VsdHM7XG4gICAgICAgICAgICB2YXIgdGhpc2NvbnRhaW5lciA9IHRoaXNDb250YWluZXI7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICB2YXIgdGhpc1RpdGxlID0gaXRlbXNkYXRhW2ldLlRpdGxlO1xuICAgICAgICAgICAgICB2YXIgdGhpc0Rlc2M9IGl0ZW1zZGF0YVtpXS5EZXNjO1xuICAgICAgICAgICAgICB2YXIgdGhpc0VuYWJsZWQgPSBpdGVtc2RhdGFbaV0uRW5hYmxlZDtcbiAgICAgICAgICAgICAgdmFyIHRoaXNJRCA9IGl0ZW1zZGF0YVtpXS5JZDtcbiAgICAgICAgICAgICAgdmFyIG5ld1dpbmRvdyA9IGl0ZW1zZGF0YVtpXS5PcGVuTGlua0luTmV3V2luZG93O1xuXG4gICAgICAgICAgICAgIGlmKGl0ZW1zZGF0YVtpXS5EZXNjID09PSBudWxsKXtcbiAgICAgICAgICAgICAgICB0aGlzRGVzYyA9ICcnO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYodGhpc0VuYWJsZWQpe1xuICAgICAgICAgICAgICAgIGlmKGl0ZW1zZGF0YVtpXS5MaW5rVVJMICE9IG51bGwgJiYgaXRlbXNkYXRhW2ldLkxpbmtVUkwgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgdGhpc1VybCA9IGl0ZW1zZGF0YVtpXS5MaW5rVVJMLlVybDtcbiAgICAgICAgICAgICAgICAgIGlmKG5ld1dpbmRvdyl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNjb250YWluZXIuYXBwZW5kKCc8YSBocmVmPVwiJyt0aGlzVXJsKydcIiBjbGFzcz1cInJlc291cmNlLWl0ZW1cIiB0YXJnZXQ9XCJfYmxhbmtcIj48ZGl2IGNsYXNzPVwicmVzb3VyY2UtaW1hZ2UgcmVzb3VyY2UtaW1hZ2UtJyt0aGlzSUQrJ1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJyZXNvdXJjZS1jb250ZW50XCI+PGgyIGNsYXNzPVwicmVzb3VyY2UtdGl0bGVcIj4nK3RoaXNUaXRsZSsnPC9oMj48ZGl2IGNsYXNzPVwicmVzb3VyY2UtZGVzY1wiPicrdGhpc0Rlc2MrJzwvZGl2PjwvZGl2PjwvYT4nKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNjb250YWluZXIuYXBwZW5kKCc8YSBocmVmPVwiJyt0aGlzVXJsKydcIiBjbGFzcz1cInJlc291cmNlLWl0ZW1cIj48ZGl2IGNsYXNzPVwicmVzb3VyY2UtaW1hZ2UgcmVzb3VyY2UtaW1hZ2UtJyt0aGlzSUQrJ1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJyZXNvdXJjZS1jb250ZW50XCI+PGgyIGNsYXNzPVwicmVzb3VyY2UtdGl0bGVcIj4nK3RoaXNUaXRsZSsnPC9oMj48ZGl2IGNsYXNzPVwicmVzb3VyY2UtZGVzY1wiPicrdGhpc0Rlc2MrJzwvZGl2PjwvZGl2PjwvYT4nKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdGhpc2NvbnRhaW5lci5hcHBlbmQoJzxkaXYgY2xhc3M9XCJyZXNvdXJjZS1pdGVtXCI+PGRpdiBjbGFzcz1cInJlc291cmNlLWltYWdlIHJlc291cmNlLWltYWdlLScrdGhpc0lEKydcIj48L2Rpdj48ZGl2IGNsYXNzPVwicmVzb3VyY2UtY29udGVudFwiPjxoMiBjbGFzcz1cInJlc291cmNlLXRpdGxlXCI+Jyt0aGlzVGl0bGUrJzwvaDI+PGRpdiBjbGFzcz1cInJlc291cmNlLWRlc2NcIj4nK3RoaXNEZXNjKyc8L2Rpdj48L2Rpdj48L2Rpdj4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBsaXN0cy5nZXRMaXN0RmllbGRWYWx1ZXNIVE1MKHtcbiAgICAgICAgICAgICAgICBsaXN0bmFtZTogbGlzdG5hbWUsXG4gICAgICAgICAgICAgICAgZmllbGRzOiAnVGh1bWJuYWlsSW1hZ2UnLFxuICAgICAgICAgICAgICAgIGlkOiB0aGlzSURcbiAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZmllbGRzLGlkKXtcbiAgICAgICAgICAgICAgICB2YXIgdGhpc0ltYWdlID0gZmllbGRzLmQuVGh1bWJuYWlsSW1hZ2U7XG4gICAgICAgICAgICAgICAgaWYodGhpc0ltYWdlICE9IG51bGwpe1xuICAgICAgICAgICAgICAgICAgdGhpc0NvbnRhaW5lci5maW5kKCcucmVzb3VyY2UtaW1hZ2UtJytpZCkuYXBwZW5kKHRoaXNJbWFnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBsb2FkIGVkaXRvclxuICAgICAgbGlzdHMuZWRpdHdlYnBhcnQoe1xuICAgICAgICB0cmlnZ2VyOiBzZXR0aW5ncy50cmlnZ2VyLFxuICAgICAgICBjb250YWluZXI6IHNldHRpbmdzLmNvbnRhaW5lcixcbiAgICAgICAgY29udGVudHR5cGVpZDogc2V0dGluZ3MuY29udGVudHR5cGVpZFxuICAgICAgfSk7XG5cbiAgICB9KGpRdWVyeSkpO1xuICB9XG59O1xuIiwiLyohIHRhYmlmeS5qcyB2MS4wIHwgTUlUIExpY2Vuc2UgfCBodHRwczovL2dpdGh1Yi5jb20vb2xkcml2ZXJjcmVhdGl2ZS90YWJpZnkuanMgKi9cbihmdW5jdGlvbigkKXtcbiAgJC5mbi50YWJpZnkgPSBmdW5jdGlvbihvcHRpb25zKXtcblxuICAgIC8vIHNldHRpbmdzXG4gICAgdmFyIHNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sIHtcbiAgICAgIHNlbGVjdG9yOiB0aGlzLnNlbGVjdG9yLFxuICAgICAgZW5hYmxlZDogJCgnI01TT0xheW91dF9JbkRlc2lnbk1vZGUnKS52YWwoKSAhPSAnMScgPyB0cnVlIDogZmFsc2UsXG4gICAgICBwYW5lbDogJy5tcy13ZWJwYXJ0em9uZS1jZWxsJyxcbiAgICAgIGNvbnRhaW5lcjogJy5tcy13ZWJwYXJ0LXpvbmUnLFxuICAgICAgdGl0bGU6ICdoMi5tcy13ZWJwYXJ0LXRpdGxlVGV4dDplcSgwKScsXG4gICAgICBoaWRldGl0bGVzOiBmYWxzZSxcbiAgICAgIGNzc2NsYXNzOiAndWktdGFicycsXG4gICAgICByZXZlcnNlejogZmFsc2UsXG4gICAgICBvbmluaXQ6IGZhbHNlLFxuICAgICAgb25jaGFuZ2U6IGZhbHNlLFxuICAgICAgZGVzdHJveTogZmFsc2VcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIC8vIHRhYmlmeVxuICAgIHRoaXMuZWFjaChmdW5jdGlvbigpe1xuXG4gICAgICAvLyBnZXQgb2JqZWN0c1xuICAgICAgdmFyIHRyaWdnZXIgPSAkKHRoaXMpLmNsb3Nlc3Qoc2V0dGluZ3MucGFuZWwpO1xuICAgICAgdmFyIGNvbnRhaW5lciA9IHRyaWdnZXIuY2xvc2VzdChzZXR0aW5ncy5jb250YWluZXIpO1xuXG4gICAgICAvLyBkZXN0cm95P1xuICAgICAgaWYoc2V0dGluZ3MuZGVzdHJveSl7XG4gICAgICAgIGNvbnRhaW5lci50cmlnZ2VyKCd0YWJpZnktZGVzdHJveScpO1xuICAgICAgfVxuXG4gICAgICAvLyBjcmVhdGVcbiAgICAgIGVsc2Uge1xuXG4gICAgICAgIC8vIGluaXRcbiAgICAgICAgY29udGFpbmVyLm9uKCd0YWJpZnktaW5pdCcsIGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAvLyBhZGQgY2xhc3Nlc1xuICAgICAgICAgIGNvbnRhaW5lci5hZGRDbGFzcyhzZXR0aW5ncy5jc3NjbGFzcyk7XG5cbiAgICAgICAgICAvLyA8dWw+XG4gICAgICAgICAgdmFyIHVsID0gJCgnPHVsIGNsYXNzPVwiJyArIHNldHRpbmdzLmNzc2NsYXNzICsgJy1uYXZcIiAvPicpO1xuXG4gICAgICAgICAgLy8gcGFuZWxzXG4gICAgICAgICAgdmFyIHRhYkNvbnRhaW5lcnMgPSAwO1xuICAgICAgICAgIGNvbnRhaW5lci5maW5kKHNldHRpbmdzLnBhbmVsKS5lYWNoKGZ1bmN0aW9uKGkpe1xuXG4gICAgICAgICAgICAvLyBnZXQgcGFuZWxcbiAgICAgICAgICAgIHZhciBwYW5lbCA9ICQodGhpcyk7XG5cbiAgICAgICAgICAgIC8vIG5vdCB0cmlnZ2VyP1xuICAgICAgICAgICAgaWYoIXBhbmVsLmlzKHRyaWdnZXIpKXtcblxuICAgICAgICAgICAgICAvLyBhZGQgY2xhc3Nlc1xuICAgICAgICAgICAgICBwYW5lbC5hZGRDbGFzcyhzZXR0aW5ncy5jc3NjbGFzcyArICctcGFuZWwnKTtcblxuICAgICAgICAgICAgICAvLyBpZFxuICAgICAgICAgICAgICB2YXIgaWQgPSAncGFuZWwnICsgKGkgKyAxKTtcbiAgICAgICAgICAgICAgcGFuZWwuYXR0cignaWQnLCBpZCk7XG5cbiAgICAgICAgICAgICAgLy8gdGl0bGVcbiAgICAgICAgICAgICAgdmFyIGxhYmVsID0gJ05vIHRpdGxlJztcbiAgICAgICAgICAgICAgdmFyIHRpdGxlID0gcGFuZWwuZmluZChzZXR0aW5ncy50aXRsZSk7XG5cbiAgICAgICAgICAgICAgLy8gZm91bmQgdGl0bGU/XG4gICAgICAgICAgICAgIGlmKHRpdGxlLnNpemUoKSA+IDApe1xuXG4gICAgICAgICAgICAgICAgLy8gdGl0bGUgdGV4dD9cbiAgICAgICAgICAgICAgICB2YXIgdGl0bGV0ZXh0ID0gdGl0bGUudGV4dCgpO1xuICAgICAgICAgICAgICAgIGlmKHRpdGxldGV4dC5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgICAgICAgIGxhYmVsID0gdGl0bGV0ZXh0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGhpZGUgdGl0bGU/XG4gICAgICAgICAgICAgICAgaWYoc2V0dGluZ3MuaGlkZXRpdGxlcyl7XG4gICAgICAgICAgICAgICAgICB0aXRsZS5hZGRDbGFzcyhzZXR0aW5ncy5jc3NjbGFzcyArICctaGlkZGVuJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyA8bGk+XG4gICAgICAgICAgICAgIHZhciBsaSA9ICQoJzxsaT48YSBocmVmPVwiIycgKyBpZCArICdcIj48c3Bhbj4nICsgbGFiZWwgKyAnPC9zcGFuPjwvYT48L2xpPicpO1xuXG4gICAgICAgICAgICAgIC8vIDxhPlxuICAgICAgICAgICAgICBsaS5jaGlsZHJlbignYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuXG4gICAgICAgICAgICAgICAgLy8gcHJldmVudCBoYXNoIGluIHVybFxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgIC8vIHRhcmdldFxuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTtcblxuICAgICAgICAgICAgICAgIC8vIGNoYW5nZVxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci50cmlnZ2VyKCd0YWJpZnktY2hhbmdlJywgWyB0YXJnZXQgXSk7XG5cbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgLy8gYWN0aXZlIHBhbmVsP1xuICAgICAgICAgICAgICBpZih0YWJDb250YWluZXJzID09IDApe1xuICAgICAgICAgICAgICAgIHBhbmVsLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICBsaS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgdGFiQ29udGFpbmVycysrO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gYWRkIHRvIDx1bD5cbiAgICAgICAgICAgICAgdWwuYXBwZW5kKGxpKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB0cmlnZ2VyXG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICBwYW5lbC5hZGRDbGFzcyhzZXR0aW5ncy5jc3NjbGFzcyArICctaGlkZGVuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIHJldmVyc2Ugei1pbmRleD9cbiAgICAgICAgICBpZihzZXR0aW5ncy5yZXZlcnNleil7XG5cbiAgICAgICAgICAgIC8vIGdldCA8bGk+J3NcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IHVsLmNoaWxkcmVuKCdsaScpO1xuXG4gICAgICAgICAgICAvLyB6LWluZGV4XG4gICAgICAgICAgICBpdGVtcy5lYWNoKGZ1bmN0aW9uKGkpe1xuICAgICAgICAgICAgICAkKHRoaXMpLmNzcygnei1pbmRleCcsIGl0ZW1zLnNpemUoKSAtIGkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBhZGQgdGFic1xuICAgICAgICAgIGNvbnRhaW5lci5wcmVwZW5kKHVsKTtcblxuICAgICAgICAgIC8vIG9uaW5pdD9cbiAgICAgICAgICBpZih0eXBlb2Yoc2V0dGluZ3Mub25pbml0KSA9PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgICAgIHNldHRpbmdzLm9uaW5pdCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBjaGFuZ2VcbiAgICAgICAgY29udGFpbmVyLm9uKCd0YWJpZnktY2hhbmdlJywgZnVuY3Rpb24oZSwgdGFyZ2V0KXtcblxuICAgICAgICAgIC8vIGRlYWN0aXZhdGUgbGlua3NcbiAgICAgICAgICBjb250YWluZXIuY2hpbGRyZW4oJ3VsOmVxKDApJykuY2hpbGRyZW4oJ2xpJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gICAgICAgICAgLy8gZGVhY3RpdmF0ZSBwYW5lbHNcbiAgICAgICAgICBjb250YWluZXIuZmluZChzZXR0aW5ncy5wYW5lbCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gICAgICAgICAgLy8gYWN0aXZhdGUgbGlua1xuICAgICAgICAgIGNvbnRhaW5lci5maW5kKCdhW2hyZWY9XCInICsgdGFyZ2V0ICsgJ1wiXScpLnBhcmVudCgnbGknKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cbiAgICAgICAgICAvLyBhY3RpdmF0ZSBwYW5lbFxuICAgICAgICAgICQodGFyZ2V0KS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gZGVzdHJveVxuICAgICAgICBjb250YWluZXIub24oJ3RhYmlmeS1kZXN0cm95JywgZnVuY3Rpb24oKXtcblxuICAgICAgICAgIC8vIHJlbW92ZSBjbGFzc2VzXG4gICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNsYXNzKHNldHRpbmdzLmNzc2NsYXNzKTtcblxuICAgICAgICAgIC8vIHJlbW92ZSBwYW5lbHNcbiAgICAgICAgICBjb250YWluZXIuZmluZChzZXR0aW5ncy5wYW5lbCkucmVtb3ZlQXR0cignaWQnKS5yZW1vdmVDbGFzcyhzZXR0aW5ncy5jc3NjbGFzcyArICctcGFuZWwgYWN0aXZlJyk7XG5cbiAgICAgICAgICAvLyByZW1vdmUgPHVsPlxuICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbigndWw6ZXEoMCknKS5yZW1vdmUoKTtcblxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBlbmFibGVkP1xuICAgICAgICBpZihzZXR0aW5ncy5lbmFibGVkKXtcblxuICAgICAgICAgIC8vIGluaXRcbiAgICAgICAgICBjb250YWluZXIudHJpZ2dlcigndGFiaWZ5LWluaXQnKTtcblxuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgLy8gZG9uZVxuICAgIHJldHVybiB0aGlzO1xuXG4gIH07XG59KGpRdWVyeSkpO1xuIiwiY29uc3QgbGlzdHMgPSB3aW5kb3cubGlzdHMgPSByZXF1aXJlKCcuL2xpc3RzJyk7XG5jb25zdCB1dGlsaXRpZXMgPSB3aW5kb3cudXRpbGl0aWVzID0gcmVxdWlyZSgnLi91dGlsaXRpZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gc2tlbGV0b24gY29kZSBmb3Igd2ViIHBhcnRcbiAgbG9hZDogZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgbGV0IHNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sIHtcbiAgICAgIHRyaWdnZXI6ICcud3AtdGlsZXMnLFxuICAgICAgY29udGFpbmVyOiAnLnRpbGVzLWNvbnRhaW5lcicsXG4gICAgICBjb250ZW50dHlwZWlkOiAnMHgwMTAwNkVFNkE5MDJEMDBERDE0MDk5OUExMjZCRkRGOUVFRUEnIC8vIHRpbGVzd2VicGFydFxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgKGZ1bmN0aW9uKCQpe1xuXG4gICAgICBsaXN0cy5idWlsZHdlYnBhcnQoe1xuICAgICAgICB0cmlnZ2VyOiBzZXR0aW5ncy50cmlnZ2VyLFxuICAgICAgICBjb250YWluZXI6IHNldHRpbmdzLmNvbnRhaW5lclxuICAgICAgfSk7XG5cbiAgICAgICQoc2V0dGluZ3MuY29udGFpbmVyKS5lYWNoKGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgdmFyIHRoaXNDb250YWluZXIgPSAkKHRoaXMpO1xuXG4gICAgICAgIGlmKHRoaXNDb250YWluZXIuY2xvc2VzdCgnLm1zLXdlYnBhcnR6b25lLWNlbGwnKS5maW5kKCcubXMtd2VicGFydC1jaHJvbWUtdGl0bGUnKS5zaXplKCkgPiAwKXtcbiAgICAgICAgICB2YXIgd2VicGFydERlc2NyaXB0aW9uID0gdGhpc0NvbnRhaW5lci5jbG9zZXN0KCcubXMtd2VicGFydHpvbmUtY2VsbCcpLmZpbmQoJy5qcy13ZWJwYXJ0LXRpdGxlQ2VsbCcpLmF0dHIoJ3RpdGxlJykuc3BsaXQoJyAtICcpWzFdO1xuICAgICAgICAgIGlmKHdlYnBhcnREZXNjcmlwdGlvbi5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgIHRoaXNDb250YWluZXIuY2xvc2VzdCgnLm1zLXdlYnBhcnR6b25lLWNlbGwnKS5maW5kKCdoMi5tcy13ZWJwYXJ0LXRpdGxlVGV4dCcpLmFwcGVuZCgnPGRpdiBjbGFzcz1cIndlYnBhcnQtZGVzY3JpcHRpb25cIj4nK3dlYnBhcnREZXNjcmlwdGlvbikrJzwvZGl2Pic7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVtb3ZlIGFueSBwcmV2aW91c2x5LWZldGNoZWQgaXRlbXNcbiAgICAgICAgdGhpc0NvbnRhaW5lci5jaGlsZHJlbignYS50aWxlcy1saW5rJykucmVtb3ZlKCk7XG5cbiAgICAgICAgLy8gZ2V0IGxpc3QgbmFtZVxuICAgICAgICB2YXIgbGlzdG5hbWUgPSB0aGlzQ29udGFpbmVyLmNsb3Nlc3QoJy5tcy13ZWJwYXJ0em9uZS1jZWxsJykuZmluZChzZXR0aW5ncy50cmlnZ2VyKS5hdHRyKCdkYXRhLWxpc3QnKTtcblxuICAgICAgICAvLyBnZXQgbGlzdCBpdGVtc1xuICAgICAgICBpZighYm9uZXMucGFnZS5lZGl0bW9kZSl7XG4gICAgICAgICAgbGlzdHMuZ2V0TGlzdEl0ZW1zKHtcbiAgICAgICAgICAgIGxpc3RuYW1lOiBsaXN0bmFtZSxcbiAgICAgICAgICAgIGZpZWxkczogJ1RpdGxlLEVuYWJsZWQsTGlua1VSTCxTb3J0T3JkZXIsRGVzYyxPcGVuTGlua0luTmV3V2luZG93JyxcbiAgICAgICAgICAgIG9yZGVyYnk6ICdTb3J0T3JkZXInXG4gICAgICAgICAgfSwgZnVuY3Rpb24oaXRlbXMpe1xuICAgICAgICAgICAgdmFyIGl0ZW1zZGF0YSA9IGl0ZW1zLmQucmVzdWx0cztcbiAgICAgICAgICAgIHZhciB0aGlzY29udGFpbmVyID0gdGhpc0NvbnRhaW5lcjtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXNkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIHZhciB0aGlzVGl0bGUgPSBpdGVtc2RhdGFbaV0uVGl0bGU7XG4gICAgICAgICAgICAgIHZhciB0aGlzRGVzYyA9IGl0ZW1zZGF0YVtpXS5EZXNjO1xuICAgICAgICAgICAgICB2YXIgdGhpc0VuYWJsZWQgPSBpdGVtc2RhdGFbaV0uRW5hYmxlZDtcbiAgICAgICAgICAgICAgdmFyIHRoaXNMaW5rVVJMID0gaXRlbXNkYXRhW2ldLkxpbmtVUkw7XG4gICAgICAgICAgICAgIHZhciBuZXdXaW5kb3cgPSBpdGVtc2RhdGFbaV0uT3BlbkxpbmtJbk5ld1dpbmRvdztcblxuICAgICAgICAgICAgICBpZihpdGVtc2RhdGFbaV0uRGVzYyA9PT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgdGhpc0Rlc2MgPSAnJztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmKHRoaXNFbmFibGVkKXtcbiAgICAgICAgICAgICAgICBpZihuZXdXaW5kb3cpe1xuICAgICAgICAgICAgICAgICAgdGhpc2NvbnRhaW5lci5hcHBlbmQoJzxhIGhyZWY9XCInK3RoaXNMaW5rVVJMLlVybCsnXCIgYWx0PVwiJyt0aGlzVGl0bGUrJ1wiIGNsYXNzPVwidGlsZXMtbGluayB0aWxlcy1saW5rLScraSU2KydcIiB0YXJnZXQ9XCJfYmxhbmtcIj48c3BhbiBjbGFzcz1cInRpbGVzLWxpbmstdGV4dFwiPjxzcGFuIGNsYXNzPVwidGlsZXMtbGluay10aXRsZVwiPicrdGhpc1RpdGxlKyc8L3NwYW4+PHNwYW4gY2xhc3M9XCJ0aWxlcy1saW5rLWRlc2NcIj4nK3RoaXNEZXNjKyc8L3NwYW4+PC9zcGFuPjwvYT4nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdGhpc2NvbnRhaW5lci5hcHBlbmQoJzxhIGhyZWY9XCInK3RoaXNMaW5rVVJMLlVybCsnXCIgYWx0PVwiJyt0aGlzVGl0bGUrJ1wiIGNsYXNzPVwidGlsZXMtbGluayB0aWxlcy1saW5rLScraSU2KydcIj48c3BhbiBjbGFzcz1cInRpbGVzLWxpbmstdGV4dFwiPjxzcGFuIGNsYXNzPVwidGlsZXMtbGluay10aXRsZVwiPicrdGhpc1RpdGxlKyc8L3NwYW4+PHNwYW4gY2xhc3M9XCJ0aWxlcy1saW5rLWRlc2NcIj4nK3RoaXNEZXNjKyc8L3NwYW4+PC9zcGFuPjwvYT4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICB9KTtcblxuICAgICAgLy8gbG9hZCBlZGl0b3JcbiAgICAgIGxpc3RzLmVkaXR3ZWJwYXJ0KHtcbiAgICAgICAgdHJpZ2dlcjogc2V0dGluZ3MudHJpZ2dlcixcbiAgICAgICAgY29udGFpbmVyOiBzZXR0aW5ncy5jb250YWluZXIsXG4gICAgICAgIGNvbnRlbnR0eXBlaWQ6IHNldHRpbmdzLmNvbnRlbnR0eXBlaWRcbiAgICAgIH0pO1xuXG4gICAgfShqUXVlcnkpKTtcbiAgfVxufTtcbiIsImNvbnN0IGxpc3RzID0gd2luZG93Lmxpc3RzID0gcmVxdWlyZSgnLi9saXN0cycpO1xuY29uc3QgdXRpbGl0aWVzID0gd2luZG93LnV0aWxpdGllcyA9IHJlcXVpcmUoJy4vdXRpbGl0aWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8vIHNrZWxldG9uIGNvZGUgZm9yIHdlYiBwYXJ0XG4gIGxvYWQ6IGZ1bmN0aW9uKG9wdGlvbnMpe1xuICAgIGxldCBzZXR0aW5ncyA9ICQuZXh0ZW5kKHRydWUsIHt9LCB7XG4gICAgICB0cmlnZ2VyOiAnLndwLXVuaXZlcnNpdGllcycsXG4gICAgICBjb250YWluZXI6ICcudW5pdmVyc2l0aWVzLWNvbnRhaW5lcicsXG4gICAgICBjb250ZW50dHlwZWlkOiAnMHgwMTAwOUUyQUI0MzYwNDJFNTI0Rjg3QzcyOUQ5QzBDNTU1NDknIC8vdW5pdmVyc2l0eXdlYnBhcnRcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIChmdW5jdGlvbigkKXtcblxuICAgICAgbGlzdHMuYnVpbGR3ZWJwYXJ0KHtcbiAgICAgICAgdHJpZ2dlcjogc2V0dGluZ3MudHJpZ2dlcixcbiAgICAgICAgY29udGFpbmVyOiBzZXR0aW5ncy5jb250YWluZXJcbiAgICAgIH0pO1xuXG4gICAgICAkKHNldHRpbmdzLmNvbnRhaW5lcikuZWFjaChmdW5jdGlvbigpe1xuXG4gICAgICAgIHZhciB0aGlzQ29udGFpbmVyID0gJCh0aGlzKTtcblxuICAgICAgICAvLyByZW1vdmUgYW55IHByZXZpb3VzbHktZmV0Y2hlZCBpdGVtc1xuICAgICAgICB0aGlzQ29udGFpbmVyLmZpbmQoJy5jb250YWluZXInKS5yZW1vdmUoKTtcblxuICAgICAgICAvLyBnZXQgbGlzdCBuYW1lXG4gICAgICAgIHZhciBsaXN0bmFtZSA9IHRoaXNDb250YWluZXIuY2xvc2VzdCgnLm1zLXdlYnBhcnR6b25lLWNlbGwnKS5maW5kKHNldHRpbmdzLnRyaWdnZXIpLmF0dHIoJ2RhdGEtbGlzdCcpO1xuXG4gICAgICAgIC8vIGdldCBsaXN0IGl0ZW1zXG4gICAgICAgIGlmKCFib25lcy5wYWdlLmVkaXRtb2RlKXtcbiAgICAgICAgICBsaXN0cy5nZXRMaXN0SXRlbXMoe1xuICAgICAgICAgICAgbGlzdG5hbWU6IGxpc3RuYW1lLFxuICAgICAgICAgICAgZmllbGRzOiAnVGl0bGUsRW5hYmxlZCxMaW5rVVJMLFNvcnRPcmRlcixDb21pbmdTb29uLE9wZW5MaW5rSW5OZXdXaW5kb3cnLFxuICAgICAgICAgICAgb3JkZXJieTogJ1NvcnRPcmRlcidcbiAgICAgICAgICB9LCBmdW5jdGlvbihpdGVtcyl7XG4gICAgICAgICAgICBpZih0aGlzQ29udGFpbmVyLmNsb3Nlc3QoJy5tcy13ZWJwYXJ0em9uZS1jZWxsJykuZmluZCgnLm1zLXdlYnBhcnQtY2hyb21lLXRpdGxlJykuc2l6ZSgpID4gMCl7XG4gICAgICAgICAgICAgIHRoaXNDb250YWluZXIuY2xvc2VzdCgnLm1zLXdlYnBhcnR6b25lLWNlbGwnKS5maW5kKCcubXMtd2VicGFydC1jaHJvbWUtdGl0bGUnKS5oaWRlKCk7XG4gICAgICAgICAgICAgIHZhciB3ZWJwYXJ0VGl0bGUgPSB0aGlzQ29udGFpbmVyLmNsb3Nlc3QoJy5tcy13ZWJwYXJ0em9uZS1jZWxsJykuZmluZCgnLmpzLXdlYnBhcnQtdGl0bGVDZWxsJykuYXR0cigndGl0bGUnKS5zcGxpdCgnIC0gJylbMF07XG4gICAgICAgICAgICAgIHZhciB3ZWJwYXJ0RGVzY3JpcHRpb24gPSB0aGlzQ29udGFpbmVyLmNsb3Nlc3QoJy5tcy13ZWJwYXJ0em9uZS1jZWxsJykuZmluZCgnLmpzLXdlYnBhcnQtdGl0bGVDZWxsJykuYXR0cigndGl0bGUnKS5zcGxpdCgnIC0gJylbMV07XG4gICAgICAgICAgICAgIGlmKHdlYnBhcnRUaXRsZS50b0xvd2VyQ2FzZSgpICE9ICd1bnRpdGxlZCcpe1xuICAgICAgICAgICAgICAgIGlmKHdlYnBhcnREZXNjcmlwdGlvbiAhPSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgICAgICAgdmFyIHdlYnBhcnRIZWFkaW5nID0gJzxoMT4nK3dlYnBhcnRUaXRsZSsnPC9oMT48ZGl2IGNsYXNzPVwidW5pdmVyc2l0eS1kZXNjcmlwdGlvblwiPicrd2VicGFydERlc2NyaXB0aW9uKyc8L2Rpdj4nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICB2YXIgd2VicGFydEhlYWRpbmcgPSAnPGgxPicrd2VicGFydFRpdGxlKyc8L2gxPic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciB3ZWJwYXJ0SGVhZGluZyA9ICcnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2YXIgd2VicGFydEhlYWRpbmcgPSAnPGgxPkZ1bmN0aW9uYWwgVW5pdmVyc2l0aWVzPC9oMT4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGl0ZW1zZGF0YSA9IGl0ZW1zLmQucmVzdWx0cztcbiAgICAgICAgICAgIHRoaXNDb250YWluZXIuYXBwZW5kKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+Jyt3ZWJwYXJ0SGVhZGluZysnPHVsLz48L2Rpdj4nKTtcbiAgICAgICAgICAgIHZhciB0aGlzY29udGFpbmVyID0gdGhpc0NvbnRhaW5lci5maW5kKCd1bCcpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtc2RhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgdmFyIHRoaXNUaXRsZSA9IGl0ZW1zZGF0YVtpXS5UaXRsZTtcbiAgICAgICAgICAgICAgdmFyIHRoaXNFbmFibGVkID0gaXRlbXNkYXRhW2ldLkVuYWJsZWQ7XG4gICAgICAgICAgICAgIHZhciB0aGlzTGlua1VSTCA9IGl0ZW1zZGF0YVtpXS5MaW5rVVJMO1xuICAgICAgICAgICAgICB2YXIgdGhpc0NvbWluZ1Nvb24gPSBpdGVtc2RhdGFbaV0uQ29taW5nU29vbjtcbiAgICAgICAgICAgICAgdmFyIG5ld1dpbmRvdyA9IGl0ZW1zZGF0YVtpXS5PcGVuTGlua0luTmV3V2luZG93O1xuXG4gICAgICAgICAgICAgIGlmKHRoaXNFbmFibGVkKXtcbiAgICAgICAgICAgICAgICBpZih0aGlzQ29taW5nU29vbil7XG4gICAgICAgICAgICAgICAgICB0aGlzY29udGFpbmVyLmFwcGVuZCgnPGxpIGNsYXNzPVwidW5pdmVyc2l0eS1saW5rXCI+PHNwYW4gY2xhc3M9XCJkaXNhYmxlZFwiPjxzcGFuIGNsYXNzPVwidW5pdmVyc2l0eS1saW5rLXRleHRcIj4nK3RoaXNUaXRsZSsnPHNwYW4gY2xhc3M9XCJjb21pbmctc29vbi10ZXh0XCI+Q29taW5nIFNvb248L3NwYW4+PC9zcGFuPjwvc3Bhbj48L2xpPicpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZihuZXdXaW5kb3cpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzY29udGFpbmVyLmFwcGVuZCgnPGxpIGNsYXNzPVwidW5pdmVyc2l0eS1saW5rXCI+PGEgaHJlZj1cIicrdGhpc0xpbmtVUkwuVXJsKydcIiBhbHQ9XCInK3RoaXNUaXRsZSsnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+PHNwYW4gY2xhc3M9XCJ1bml2ZXJzaXR5LWxpbmstdGV4dFwiPicrdGhpc1RpdGxlKyc8L3NwYW4+PC9hPjwvbGk+Jyk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzY29udGFpbmVyLmFwcGVuZCgnPGxpIGNsYXNzPVwidW5pdmVyc2l0eS1saW5rXCI+PGEgaHJlZj1cIicrdGhpc0xpbmtVUkwuVXJsKydcIiBhbHQ9XCInK3RoaXNUaXRsZSsnXCI+PHNwYW4gY2xhc3M9XCJ1bml2ZXJzaXR5LWxpbmstdGV4dFwiPicrdGhpc1RpdGxlKyc8L3NwYW4+PC9hPjwvbGk+Jyk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgLy8gbG9hZCBlZGl0b3JcbiAgICAgIGxpc3RzLmVkaXR3ZWJwYXJ0KHtcbiAgICAgICAgdHJpZ2dlcjogc2V0dGluZ3MudHJpZ2dlcixcbiAgICAgICAgY29udGFpbmVyOiBzZXR0aW5ncy5jb250YWluZXIsXG4gICAgICAgIGNvbnRlbnR0eXBlaWQ6IHNldHRpbmdzLmNvbnRlbnR0eXBlaWRcbiAgICAgIH0pO1xuXG4gICAgfShqUXVlcnkpKTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8vIGFkZCBhbnkgdXRpbGl0eSBjbGFzc2VzIGhlcmVcbiAgbG9hZEV4ZWN1dGVSZXF1ZXN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgIEV4ZWN1dGVPckRlbGF5VW50aWxTY3JpcHRMb2FkZWQoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2NyaXB0YmFzZSA9IF9zcFBhZ2VDb250ZXh0SW5mby5zaXRlQWJzb2x1dGVVcmwgKyBcIi9fbGF5b3V0cy8xNS9cIjtcblxuICAgICAgICAkLmdldFNjcmlwdChzY3JpcHRiYXNlICsgXCJTUC5SZXF1ZXN0RXhlY3V0b3IuanNcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdXRpbGl0aWVzLmxvZ1RvQ29uc29sZSh7XG4gICAgICAgICAgICAgIG1lc3NhZ2U6IFwicmVxdWVzdCBleGVjdXRvciBpcyBub3cgbG9hZGVkXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sIFwic3AuanNcIik7XG4gIH0sXG4gIGxvZ1RvQ29uc29sZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIGxldCBzZXR0aW5ncyA9ICQuZXh0ZW5kKHRydWUsIHt9LCB7XG4gICAgICAgIG1lc3NhZ2U6ICcnXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhzZXR0aW5ncy5tZXNzYWdlKTtcbiAgfSxcbiAgcmVzcG9uc2l2ZUltYWdlczogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGxldCBzZXR0aW5ncyA9ICQuZXh0ZW5kKHRydWUsIHt9LCB7XG4gICAgICBpbWFnZTogJy5yZXNwb25zaXZlLWltYWdlJ1xuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgJChzZXR0aW5ncy5pbWFnZSkuZWFjaChmdW5jdGlvbigpe1xuICAgICAgbGV0IHRoaXNQYXJlbnQgPSAkKHRoaXMpLnBhcmVudCgpO1xuICAgICAgbGV0IHRoaXNJbWFnZSA9ICQodGhpcyk7XG4gICAgICBsZXQgY2hlY2tFeGlzdCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICBpZigkKHRoaXNJbWFnZSkud2lkdGgoKSAhPSAwICYmIHRoaXNQYXJlbnQubGVuZ3RoICE9IDApIHtcbiAgICAgICAgICAgdGhpc1BhcmVudC5hZGRDbGFzcygncmVzcG9uc2l2ZS1pbWFnZS1jb250YWluZXInKTtcbiAgICAgICAgICAgbGV0IGltYWdlUmF0aW8gPSAkKHRoaXNJbWFnZSkud2lkdGgoKS8kKHRoaXNJbWFnZSkuaGVpZ2h0KCk7XG4gICAgICAgICAgIGxldCBjb250YWluZXJSYXRpbyA9ICQodGhpc1BhcmVudCkud2lkdGgoKS8kKHRoaXNQYXJlbnQpLmhlaWdodCgpO1xuXG4gICAgICAgICAgIGlmKGltYWdlUmF0aW8gPiBjb250YWluZXJSYXRpbyl7XG4gICAgICAgICAgICAgJCh0aGlzSW1hZ2UpLndpZHRoKCdhdXRvJykuaGVpZ2h0KCcxMDAlJyk7XG4gICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgJCh0aGlzSW1hZ2UpLndpZHRoKCcxMDAlJykuaGVpZ2h0KCdhdXRvJyk7XG4gICAgICAgICAgIH1cblxuICAgICAgICAgICBjbGVhckludGVydmFsKGNoZWNrRXhpc3QpO1xuXG4gICAgICAgICB9XG4gICAgICB9LCAxMDApO1xuXG4gICAgfSk7XG4gIH0sXG4gIHNob3dJZk5vdEVtcHR5OiBmdW5jdGlvbihvcHRpb25zKXtcbiAgICBsZXQgc2V0dGluZ3MgPSAkLmV4dGVuZCh0cnVlLCB7fSwge1xuICAgICAgZWxlbWVudDogJycsXG4gICAgICBzaG93RWxlbWVudDogJydcbiAgICB9LCBvcHRpb25zKTtcblxuICAgICQoc2V0dGluZ3MuZWxlbWVudCkuZWFjaChmdW5jdGlvbigpe1xuICAgICAgbGV0IHRoaXN0ZXh0ID0gJCh0aGlzKS50ZXh0KCkudHJpbSgpO1xuXG4gICAgICBpZihzZXR0aW5ncy5zaG93RWxlbWVudCl7XG4gICAgICAgIGlmKHRoaXN0ZXh0Lmxlbmd0aCA+IDApe1xuICAgICAgICAgICQoc2V0dGluZ3Muc2hvd0VsZW1lbnQpLnNob3coKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYodGhpc3RleHQubGVuZ3RoID4gMCl7XG4gICAgICAgICAgJCh0aGlzKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgc2l0ZUJyZWFkY3J1bWI6IGZ1bmN0aW9uKCl7XG4gICAgbGV0IHJvb3RBYnNvbHV0ZSA9IF9zcFBhZ2VDb250ZXh0SW5mby5zaXRlQWJzb2x1dGVVcmw7XG4gICAgbGV0IHJvb3RSZWxhdGl2ZSA9IF9zcFBhZ2VDb250ZXh0SW5mby5zaXRlU2VydmVyUmVsYXRpdmVVcmw7XG4gICAgbGV0IHRoaXNTaXRlID0gX3NwUGFnZUNvbnRleHRJbmZvLndlYlNlcnZlclJlbGF0aXZlVXJsO1xuICAgIGxldCB0aGlzU2l0ZVRpdGxlID0gX3NwUGFnZUNvbnRleHRJbmZvLndlYlRpdGxlO1xuICAgIGxldCB3ZWJzQXJyYXkgPSB0aGlzU2l0ZS5yZXBsYWNlKHJvb3RSZWxhdGl2ZSsnLycsICcnKS5zcGxpdCgnLycpO1xuICAgIHdlYnNBcnJheS5wb3AoKTtcblxuICAgIGlmKHRoaXNTaXRlICE9IHJvb3RSZWxhdGl2ZSl7XG4gICAgICAkKCdoZWFkZXIgaDIuYnJhbmQnKS5hZGRDbGFzcygndW5pdmVyc2l0eS1icmFuZCcpO1xuICAgICAgJCgnaGVhZGVyIC5icmVhZGNydW1iLXRpdGxlJykuYXBwZW5kKCc8c3BhbiBjbGFzcz1cImJyZWFkY3J1bWItc2VwYXJhdG9yIGxhc3Qtc2VwYXJhdG9yXCI+Jm5ic3A7LyZuYnNwOzwvc3Bhbj48c3BhbiBjbGFzcz1cImxhc3QtYnJlYWRjcnVtYlwiPjxhIGhyZWY9XCInK3RoaXNTaXRlKydcIj4nK3RoaXNTaXRlVGl0bGUrJzwvYT48L3NwYW4+Jyk7XG5cbiAgICAgIGZvcih2YXIgaT0wOyBpIDwgd2Vic0FycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCB0aGlzVVJMID0gcm9vdEFic29sdXRlKycvJyt3ZWJzQXJyYXlbaV07XG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgJ2FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uO29kYXRhPXZlcmJvc2UnLFxuICAgICAgICAgICAgXCJYLVJlcXVlc3REaWdlc3RcIjogYm9uZXMuZGlnZXN0XG4gICAgICAgICAgfSxcbiAgICAgICAgICB1cmw6IHRoaXNVUkwgKyAnL19hcGkvd2ViL3RpdGxlJyxcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBsZXQgcGFyZW50U2l0ZVRpdGxlID0gZGF0YS5kLlRpdGxlO1xuICAgICAgICAgICAgJCgnPHNwYW4gY2xhc3M9XCJicmVhZGNydW1iLXNlcGFyYXRvclwiPiZuYnNwOy8mbmJzcDs8L3NwYW4+PHNwYW4gY2xhc3M9XCJicmVhZGNydW1iLWl0ZW1cIj48YSBocmVmPVwiJyt0aGlzVVJMKydcIj4nK3BhcmVudFNpdGVUaXRsZSsnPC9hPjwvc3Bhbj4nKS5pbnNlcnRCZWZvcmUoJy5sYXN0LXNlcGFyYXRvcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBzY3JvbGxBY3Rpb246IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHZpZXdwb3J0ID0gJCh3aW5kb3cpO1xuICAgIHZhciBib2R5ID0gJCgnYm9keScpO1xuICAgIHZhciBzY3JvbGxib2R5ID0gJCgnI3M0LXdvcmtzcGFjZScpO1xuICAgIHZhciB3aCA9IHZpZXdwb3J0LmhlaWdodCgpO1xuICAgIHZhciBzdCA9IHdoIC8gNDtcblxuICAgIC8vIHNjcm9sbFxuICAgIHNjcm9sbGJvZHkub24oJ3Njcm9sbCcsIGZ1bmN0aW9uKCl7XG4gICAgXHR2YXIgdCA9ICQodGhpcykuc2Nyb2xsVG9wKCk7XG4gICAgXHRpZih0ID4gc3Qpe1xuICAgIFx0XHRib2R5LmFkZENsYXNzKCdzY3JvbGwtZG93bicpO1xuICAgIFx0fVxuICAgIFx0ZWxzZXtcbiAgICBcdFx0Ym9keS5yZW1vdmVDbGFzcygnc2Nyb2xsLWRvd24nKTtcbiAgICBcdH1cbiAgICB9KTtcbiAgICBzY3JvbGxib2R5LnRyaWdnZXIoJ3Njcm9sbCcpO1xuXG4gICAgJCgnW2RhdGEtc2Nyb2xsXScpLm9uKCdjbGljaycsZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgcmliYm9uSGVpZ2h0ID0gJCgnI3N1aXRlQmFyRGVsdGEnKS5vdXRlckhlaWdodCgpICsgJCgnI3M0LXJpYmJvbnJvdycpLm91dGVySGVpZ2h0KCk7XG4gICAgICB2YXIgY29udGVudE9mZnNldCA9ICQoJyNzNC1ib2R5Q29udGFpbmVyJykub2Zmc2V0KCkudG9wO1xuICAgICAgdmFyIHRoaXNFbGVtZW50ID0gJCh0aGlzKS5hdHRyKCdkYXRhLXNjcm9sbCcpO1xuICAgICAgdmFyIHNjcm9sbHRvbG9jYXRpb24gPSAkKCcuJyt0aGlzRWxlbWVudCkub2Zmc2V0KCkudG9wIC0gY29udGVudE9mZnNldCAtIDczO1xuXG4gICAgICAkKFwiI3M0LXdvcmtzcGFjZVwiKS5zdG9wKCkuYW5pbWF0ZSh7XG4gICAgICAgICAgc2Nyb2xsVG9wOiBzY3JvbGx0b2xvY2F0aW9uXG4gICAgICB9KTtcblxuICAgIH0pO1xuXG4gIH1cbn1cbiJdfQ==
