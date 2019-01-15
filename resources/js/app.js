/**
 *
 * Place your custom JavaScript into this file.
 *
 * SPBones uses ES6 JavaScript, which is compiled down to client-ready ES5 by
 * running the included Gulp Propeller script.
 *
 */

// bones
const bones = window.bones = require('./bones')

//const lists = window.lists = require('./list-functions');
const lists = window.lists = require('./lists')

//utilities
const utilities = window.utilities = require('./utilities')

//carousel
$.carousel = require('./carousel').carousel

// load web parts
const resources = window.resources = require('./resources')
const universities = window.universities = require('./universities')
const news = window.news = require('./news')
const bahcarousel = window.bahcarousel = require('./bahcarousel')
const tiles = window.tiles = require('./tiles')
const partnerships = window.partnerships = require('./partnerships')
const learningplans = window.learningplans = require('./learningplans')
const tabify = window.tabify = require('./tabify')
const eandsuplans = window.eandsuplans = require('./eandsuplans')
const analyticsu = window.analyticsu = require('./analyticsu')

// responsive image map
const imagemap = window.imagemap = require('./imagemap')

// is scrolled
utilities.scrollAction()

// load SP.executor
utilities.loadExecuteRequestor()

// resources
if($('.wp-resources').size() > 0){
  resources.load()
}

// universities
if($('.wp-universities').size() > 0){
  universities.load()
}

// news carousel
if($('.wp-news').size() > 0){
  news.load()
}

// hero carousel
if($('.wp-carousel').size() > 0){
  bahcarousel.load()
}

// tiles
if($('.wp-tiles').size() > 0){
  tiles.load()
}

// partnerships
if($('.wp-partnerships').size() > 0){
  partnerships.load()
}

// Learning Plans
if($('.wp-learningplans').not('#wp-eandsuplans').not('#wp-analyticsu').size() > 0){
  learningplans.load()
}

// EandSU Plans
if($('#wp-eandsuplans').size() > 0){
  eandsuplans.load()
}

// AnalyticsU Plans
if($('#wp-analyticsu').size() > 0){
  analyticsu.load()
}

// tabify
$('.wp-tabs').tabify()


// image maps
if($('.triangle-container').size() > 0){
  imagemap.load({
    container: '.triangle-container',
    originalwidth: 1600
  })
}

// responsive images
utilities.responsiveImages()
utilities.responsiveImages({
  image: '.hero-image img'
})

// show if not empty
utilities.showIfNotEmpty({
  element: '.grey-bar-text .ms-rtestate-field',
  showElement: '.grey-container'
})
utilities.showIfNotEmpty({
  element: '.grey-bar-zone',
  showElement: '.grey-container'
})
utilities.showIfNotEmpty({
  element: 'aside',
  showElement: 'aside'
})

// blur menu
/*
$(document).on('click', function(e){
  if(!$(e.target).is('#togglemenu')){
    $('#togglemenu').trigger('click');
  }
});
*/

// breadcrumb nav
utilities.siteBreadcrumb()

//related sites
lists.getListItems({
  listname: 'Related Sites',
  siteurl: bones.sitecollection.url,
  fields: 'Title,Enabled,LinkURL,SortOrder,OpenLinkInNewWindow',
  orderby: 'SortOrder'
}, function(items){
  var itemsdata = items.d.results
  var relatedcontainer = $('#related-sites')
  for (var i = 0; i < itemsdata.length; i++) {
    var thisTitle = itemsdata[i].Title
    var thisEnabled = itemsdata[i].Enabled
    var thisLinkURL = itemsdata[i].LinkURL
    var newWindow = itemsdata[i].OpenLinkInNewWindow

    if(thisEnabled){
      if(newWindow){
        relatedcontainer.append('<div class="related-site-link"><a href="'+thisLinkURL.Url+'" alt="'+thisTitle+'" target="_blank">'+thisTitle+'</a></div>')
      } else {
        relatedcontainer.append('<div class="related-site-link"><a href="'+thisLinkURL.Url+'" alt="'+thisTitle+'">'+thisTitle+'</a></div>')
      }
    }
  }
})

//footer contact info
lists.getListItems({
  listname: 'Footer Contact Info',
  siteurl: bones.sitecollection.url,
  fields: 'Title,HTMLDescription,SortOrder',
  orderby: 'SortOrder'
}, function(items){
  var itemsdata = items.d.results
  var footercontainer = $('.footer-contact-info')
  for (var i = 0; i < itemsdata.length; i++) {
    var thisTitle = itemsdata[i].Title
    var thisDescription = itemsdata[i].HTMLDescription

    footercontainer.append('<div class="footer-contact-item"><h4 class="footer-info-heading">'+thisTitle+'</h4><div class="info">'+thisDescription+'</div></div>')
  }
})

//footer bottom links
lists.getListItems({
  listname: 'Footer Bottom Links',
  siteurl: bones.sitecollection.url,
  fields: 'Title,Enabled,LinkURL,SortOrder',
  orderby: 'SortOrder'
}, function(items){
  var itemsdata = items.d.results
  var relatedcontainer = $('.footer-bottom-container')
  for (var i = 0; i < itemsdata.length; i++) {
    var thisTitle = itemsdata[i].Title
    var thisEnabled = itemsdata[i].Enabled
    var thisLinkURL = itemsdata[i].LinkURL

    if(thisEnabled){
      relatedcontainer.append('<a href="'+thisLinkURL.Url+'" alt="'+thisTitle+'">'+thisTitle+'</a>')
    }
  }
})

// scrolling issue resolved - no ribbon/suitebar problems
$(window).load(function(){
  if($('#s4-ribbonrow').size()==0){
    $('#s4-workspace').height($(window).height()).width($(window).width()).addClass('no-ribbon')
  }
})
$(window).resize(function(){
  if($('#s4-ribbonrow').size()==0){
    $('#s4-workspace').height($(window).height()).width($(window).width()).addClass('no-ribbon')
  }
})

// page title html
$('.hero-text-content').html($('.hero-text-content').text()).css('display','block')

// global nav links open in new window
$('header nav a:not([href^="'+bones.web.url+'"]):not([href^="/"])').attr('target','_blank')

// accordions
if(!bones.page.editmode){
  $('.bah-accordion').accordion({
    heightStyle: 'content',
    collapsible: true,
    active: false
  }).closest('.ms-webpartzone-cell').addClass('wp-accordion-cell')
}

// SAMPLE: create list then add content type - Test Code
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
