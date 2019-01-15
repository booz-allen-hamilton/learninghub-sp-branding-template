const lists = window.lists = require('./lists');
const utilities = window.utilities = require('./utilities');

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
  load: function(){

    partnerships.resetWebPart();
    partnerships.buildWebPart();

     var checkExist = setInterval(function() {
        if($('.partnership-item').size() != 0) {
          partnerships.buildRefinement();
          partnerships.filterResultsByAlphabet();
          partnerships.filterResultsByRefinement();

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
            var _contentRows = $('.partnership-item');
            var _count = 0;

            _contentRows.hide();

            $('.mobile-alpha-list').removeClass('active');
            $('.alphabet > ul > li > a').removeClass('mobile-active');

            if(hash.length === 0 || hash === 'all') {
              _refinements.removeClass('active');
              $('[data-filter="all"]').addClass('active');
              _alphabets.removeClass('active');
              $('[data-alpha="all"]').addClass('active');
              _contentRows.fadeIn(400);
              _count = _contentRows.size();
            } else {
              if(hash.length === 1){
                _refinements.removeClass('active');
                $('[data-filter="all"]').addClass('active');
                _alphabets.removeClass('active');
                $('[data-alpha="all"]').removeClass('active');
                $('[data-alpha-filter="'+hash+'"]').fadeIn(400);
                $('[data-alpha="'+hash+'"]').addClass('active');
                _count = $('[data-alpha-filter="'+hash+'"]').size();
              } else {
                _alphabets.removeClass('active');
                $('[data-alpha="all"]').addClass('active');
                _refinements.removeClass('active');

                // store filters in array
                var activeFilters = hash.split(',');

                // show results based on active filter array
                _contentRows.each(function(i) {
                  var theseTags = [];

                  $(this).find('.tags span').each(function(){
                    theseTags.push(this);
                  })

                  var _cellText = theseTags.map(item => item.textContent);

                  var thisContains = activeFilters.every(function(val){
                    return _cellText.indexOf(val) >= 0;
                  });

                  /*for (var filteritem of activeFilters) {
                    $('[data-filter="'+filteritem+'"]').addClass('active');
                  }*/

                  var arrayLength = activeFilters.length;
                  for (var i = 0; i < arrayLength; i++) {
                    var filteritem = activeFilters[i];
                    $('[data-filter="'+filteritem+'"]').addClass('active');
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
      thiscontainer.append('<div class="partnership-results-column col-md-9">');
          // Render alphabet navigation
          $(resultsParentContainer).append('<div class="alpha-filter">');

            partnerships.buildAlphabet();

          $(resultsParentContainer).append('</div>');
          // Render results panel
          $(resultsParentContainer).append('<div class="results">');

            // Render results
            lists.getListItems({
              listname: 'Partnerships', //listname,
              fields: 'Title,Desc,HTMLDescription,Enabled,LinkURL,Certification,Concentration,Degree,PartnershipType,Technology,Id,OpenLinkInNewWindow',
              orderby: 'Title'
            },function(items){
              var itemsdata = items.d.results;
              for (var i = 0; i < itemsdata.length; i++) {
                var thisTitle = itemsdata[i].Title;
                var thisDesc = itemsdata[i].Desc;
                var thisHTML = itemsdata[i].HTMLDescription;
                var thisEnabled = itemsdata[i].Enabled;
                var thisID = itemsdata[i].Id;
                var newWindow = itemsdata[i].OpenLinkInNewWindow;

                var letter = thisTitle.toLowerCase().substring(0,1);
                var finalDescription = '';
                var thisTitleBuild = '<div class="title">'+thisTitle+'</div>';

                if(thisDesc != undefined || thisDesc != null){
                  finalDescription = '<div class="description">'+thisDesc+'</div>';
                } else {
                  if(thisHTML != undefined || thisHTML != null){
                    var thisHTMLtext = $('<div>'+thisHTML+'</div>').text().trim().replace(/\u200B/g,'').replace(/ /g, '').length;
                    if(thisHTMLtext != 0){
                      if(thisHTMLtext > 300) {
                        finalDescription = '<div class="description"><div class="desc-inner trimmed">'+thisHTML+'<br/><a href="#" class="description-less-link description-toggle-link">View Less</a></div><div class="description-overlay"></div><a href="#" class="description-more-link description-toggle-link">View More</a></div>';
                      } else {
                        finalDescription = '<div class="description">'+thisHTML+'</div>';
                      }
                    }
                  }
                }

                if(thisEnabled){

                  if(itemsdata[i].LinkURL != null && itemsdata[i].LinkURL != undefined) {
                    var thisUrl = itemsdata[i].LinkURL.Url;
                    if(newWindow){
                      thisTitleBuild = '<div class="title"><a href="' + thisUrl + '" class="partnership-title" target="_blank">' + thisTitle + '</a></div>'
                    } else {
                      thisTitleBuild = '<div class="title"><a href="' + thisUrl + '" class="partnership-title">' + thisTitle + '</a></div>'
                    }
                  }

                  var sParent = '<div class="partnership-item" data-alpha-filter="'+letter+'">' +
                    thisTitleBuild +
                    finalDescription +
                    '<div class="tags">';
                  var items = '';

                  if(itemsdata[i].PartnershipType.results.length >= 1 && itemsdata[i].PartnershipType.results != undefined)
                  {
                    var partnershipTypeArr = itemsdata[i].PartnershipType.results;

                    for(var j=0; j < partnershipTypeArr.length; j++) {
                      var thisPartnershipType = partnershipTypeArr[j].Label;
                      items += '<span>' + thisPartnershipType + '</span>';
                      partnershipTags.push(thisPartnershipType);
                    }

                  }

                  if(itemsdata[i].Concentration.results.length >= 1 && itemsdata[i].Concentration.results != undefined)
                  {

                    for(var j=0; j < itemsdata[i].Concentration.results.length; j++) {
                      var thisConcentration = itemsdata[i].Concentration.results[j].Label;
                      items += '<span>' + thisConcentration + '</span>';
                      concentrationTags.push(thisConcentration);
                    }

                  }

                  if(itemsdata[i].Technology.results.length >= 1 && itemsdata[i].Technology.results != undefined)
                  {
                    for(var j=0; j < itemsdata[i].Technology.results.length; j++) {
                      var thisTechnology = itemsdata[i].Technology.results[j].Label;
                      items += '<span>' + thisTechnology + '</span>';
                      technologyTags.push(thisTechnology);
                    }
                  }

                  if(itemsdata[i].Certification.results.length  >= 1 && itemsdata[i].Certification.results != undefined)
                  {
                    for(var j=0; j < itemsdata[i].Certification.results.length; j++) {
                      var thisCertification = itemsdata[i].Certification.results[j].Label;
                      items += '<span>' + thisCertification + '</span>';
                      certificationTags.push(thisCertification);
                    }
                  }

                  if(itemsdata[i].Degree.results.length  >= 1 && itemsdata[i].Degree.results != undefined)
                  {
                    for(var j=0; j < itemsdata[i].Degree.results.length; j++) {
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
      $('#partnership-container').prepend('<div class="alpha-filter"><div class="alphabet mobile-alphabet"><div class="mobile-alpha-trigger"><span class="arrow"><i class="fa fa-angle-down" aria-hidden="true"></i></span></div>' +
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
    partnershipTags.sort();
    concentrationTags.sort();
    technologyTags.sort();
    certificationTags.sort();
    degreeTags.sort();

    $(filterParentContainer).append('<div id="all-filter" class="filter-group" class="opened">' +
      '<ul class="filter-group-options"><li data-filter="all" class="active"><div class="filter-checkbox"></div><div class="filter-title">VIEW ALL</div></li></ul></div>');

    $(filterParentContainer).append('<div id="partnership-type" class="filter-group" class="opened">' +
      '<h3 class="filter-group-title">Partnership Type</h3>' +
        '<ul class="filter-group-options">');
        partnerships.getUniqueResults(partnershipTags).forEach(function(partnership) {
          partnerships.addRefinementItem(partnership, 'partnership-type');
        });
    $(filterParentContainer).append('</ul></div>');

        $(filterParentContainer).append('<div id="concentration" class="filter-group" class="opened">' +
          '<h3 class="filter-group-title">Concentration</h3>' +
            '<ul class="filter-group-options">');
            partnerships.getUniqueResults(concentrationTags).forEach(function(concentration) {
              partnerships.addRefinementItem(concentration, 'concentration');
            });
        $(filterParentContainer).append('</ul></div>');

        $(filterParentContainer).append('<div id="technology" class="filter-group" class="opened">' +
          '<h3 class="filter-group-title">Technology</h3>' +
            '<ul class="filter-group-options">');
            partnerships.getUniqueResults(technologyTags).forEach(function(technology) {
              partnerships.addRefinementItem(technology, 'technology');
            });
        $(filterParentContainer).append('</ul></div>');

        $(filterParentContainer).append('<div id="certification" class="filter-group" class="opened">' +
          '<h3 class="filter-group-title">Certification</h3>' +
            '<ul class="filter-group-options">');
            partnerships.getUniqueResults(certificationTags).forEach(function(certification) {
              partnerships.addRefinementItem(certification, 'certification');
            });
        $(filterParentContainer).append('</ul></div>');

        $(filterParentContainer).append('<div id="degree" class="filter-group" class="opened">' +
          '<h3 class="filter-group-title">Degree</h3>' +
            '<ul class="filter-group-options">');
            partnerships.getUniqueResults(degreeTags).forEach(function(degree) {
              partnerships.addRefinementItem(degree, 'degree');
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
      var container = '#partnership-container';
      var thiscontainer = $(container);
      thiscontainer.empty();
    }
}
