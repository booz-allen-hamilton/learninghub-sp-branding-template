// required
const utilities = window.utilities = require('./utilities');

// add any list functions here
module.exports = {

  getListItems: function (options,success,error) {
    let settings = $.extend(true, {}, {
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
      url: settings.siteurl + '/_api/web/lists/getbytitle(\'' + settings.listname + '\')/Items?$top='+settings.limit+'&$orderby=' + settings.orderby + ' ' + settings.orderdirection + '&$select=' + settings.fields + '&$expand=' + settings.expand,
      success: function(items) {
        success(items);
      },
      error: function(items) {
      }
    });
  },
  getListFieldValuesHTML: function (options,success,error) {
    let settings = $.extend(true, {}, {
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
      url: settings.siteurl + '/_api/web/lists/getbytitle(\'' + settings.listname + '\')/Items('+settings.id+')/FieldValuesAsHTML?$select=' + settings.fields,
      success: function(fields,id) {
        success(fields,settings.id);
      },
      error: function(fields) {
      }
    });
  },
  createLists: function createLists(options) {
      let settings = $.extend(true, {}, {
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
          success: function(data) {
          },
          error: function(s,a, errMsg) {
          }
      });
  },
  addContentTypeToList: function addContentTypeToList(options) {
        let settings = $.extend(true, {}, {
          listName: '',
          siteUrl: bones.web.url,
          contentTypeId: ''
        }, options);

        var executor;

        executor = new SP.RequestExecutor(settings.siteUrl);
        executor.executeAsync({
            url: settings.siteUrl + "/_api/web/lists/getbytitle('" + settings.listName + "')/ContentTypes/AddAvailableContentType",
            method: "POST",
            body: JSON.stringify({ 'contentTypeId': settings.contentTypeId }),
            headers: {
                "content-type": "application/json; odata=verbose"
            },
            success: function(data) {
            },
            error: function(s,a, errMsg) {
            }
        });
    },
    getITEMContentType: function(options,success) {
      let settings = $.extend(true, {}, {
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
        success: function(item) {
          success(item);
        },
        error: function(item) {
        }
      });
    },
    removeContentTypeFromList: function removeContentTypeFromList(options) {
      let settings = $.extend(true, {}, {
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
        success: function(data) {
        },
        error: function(s,a, errMsg) {
        }
      });
  },
  createListWithContentType: function(options,btn,form,input) {
    let settings = $.extend(true, {}, {
      listName: '',
      siteUrl: bones.web.url,
      description: '',
      contentTypeId: ''
    }, options);

    // Create the list
    var listexecutor;

    listexecutor = new SP.RequestExecutor(settings.siteUrl);
    listexecutor.executeAsync({
        url: settings.siteUrl + "/_api/web/Lists",
        method: "POST",
        body: "{ '__metadata': { 'type': 'SP.List' }, 'AllowContentTypes': true, 'ContentTypesEnabled': true, 'BaseTemplate': 100, 'Description': '" + settings.description + "', 'Title':'" + settings.listName + "'}",
        headers: {
            "content-type": "application/json; odata=verbose"
        },
        success: function(data) {

           if(data.statusText == "Created") {
             btn.text('Configuring content type...');
           }

           // timeout to allow list to be created ready to update
           setTimeout(function () {
             var contenttypeexecutor;

             contenttypeexecutor = new SP.RequestExecutor(settings.siteUrl);
             contenttypeexecutor.executeAsync({
                 url: settings.siteUrl + "/_api/web/lists/getbytitle('" + settings.listName + "')/ContentTypes/AddAvailableContentType",
                 method: "POST",
                 body: JSON.stringify({ 'contentTypeId': settings.contentTypeId }),
                 headers: {
                     "content-type": "application/json; odata=verbose"
                 },
                 success: function(data) {

                    // timeout to allow content type(s) to be added ready to update
                    setTimeout(function () {

                      lists.getITEMContentType({
                        listname: settings.listName
                      },function(item){
                        var thisCT = item.d.results;

                        var removecontenttypeexecutor;

                        removecontenttypeexecutor = new SP.RequestExecutor(settings.siteUrl);
                        removecontenttypeexecutor.executeAsync({
                            url: settings.siteUrl + "/_api/web/lists/getbytitle('" + settings.listName + "')/ContentTypes('" + thisCT[0].Id.StringValue + "')/deleteObject()",
                            method: "POST",
                            headers: {
                                "content-type": "application/json; odata=verbose"
                            },
                            success: function(data) {
                            },
                            error: function(s,a, errMsg) {
                            }
                        });

                      });
                    }, 2000);
                 },
                 error: function(s,a, errMsg) {
                 }
             });

             if(status == 'error') {
               form.remove();
               return;
             }

             // update input
             input.val(settings.listName);
             input.trigger('change');

             // close new form
             form.remove();

           }, 5000)
        },
        error: function(s,a, errMsg) {
        }
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

    let settings = $.extend(true, {}, {
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
      success: function(data) {
      },
      error: function(s,a, errMsg) {
      }
    });
  },
  buildwebpart: function (options) {
    let settings = $.extend(true, {}, {
      trigger: '',
      container: ''
    }, options);

    var loadview = function(){
      $(settings.trigger).each(function(j){

        // get data
        var webpart = $(this);
        var body = webpart.parent();

        // get existing container
        var container = body.next(settings.container);

        // create container
        if(!container.size()){

          var containerclass = settings.container.substring(settings.container.indexOf('.')+1);

          container = $('<div class="'+containerclass+'"></div>');
          body.after(container);
        }

        // hide the body
        body.hide();

        // get list
        var list = '';
        if(webpart.is('[data-list]')) list = webpart.attr('data-list');

        // edit mode controls (first time setup only)
        if(bones.page.editmode && !container.children('.edit-mode-panel').size()){

          // disable content editor
          body.removeAttr('contenteditable').removeAttr('contenteditor');
          body.parent().removeAttr('rteredirect');

          // add edit panel
          container.append('<div class="edit-mode-panel"><div class="ms-formfieldlabelcontainer">List</div><div class="ms-formfieldvaluecontainer"><input class="webpart-list" type="text" value="'+list+'"/></div></div>');

        }

        // remove edit buttons
        container.find('.list-edit').remove();

        // no list?
        if(!list.length){
          return;
        }

        // edit list button
        if(bones.page.editmode){
          var editBtn = $('<button class="btn btn-sm list-edit" title="Add and edit links in this list"><i class="fa fa-pencil" aria-hidden="true"></i></button>');
          editBtn.on('click', function(e){
            e.preventDefault();
            var openDialog = function openDialog(){
              SP.UI.ModalDialog.showModalDialog({
                url: bones.web.url+'/Lists/'+list,
                autoSize: true,
                dialogReturnValueCallback: function(result, data){
                  if (result == SP.UI.DialogResult.OK) {
                    openDialog();
                  }
                  if (result == SP.UI.DialogResult.cancel) {
                  }
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
  editwebpart: function (options) {
    let settings = $.extend(true, {}, {
      trigger: '',
      container: '',
      contenttypeid: '',
      removecontenttypeid: ''
    }, options);

    // editor
    var loadeditor = function(){
      $(settings.container).find('input.webpart-list').each(function(){
        var input = $(this);
        var list = input.val().trim();

        // change
        input.on('change', function(){
          input.closest(settings.container).prev('div').find(settings.trigger).attr('data-list', $(this).val());
          lists.buildwebpart({
            trigger: settings.trigger,
            container: settings.container
          });
        });

        // create btn
        var createBtn = $('<button class="btn btn-sm webpart-list-create" title="Create a new list"><i class="fa fa-plus" aria-hidden="true"></i></button>');
        input.parent().append(createBtn);

        // create
        createBtn.on('click', function(e){
          e.preventDefault();

          // close form
          if($(this).next('.webpart-form').size() > 0){
            $(this).next('.webpart-form').remove();
          }

          // new form
          else{

            // create form
            var form = $('<div class="webpart-form"><input type="text" placeholder="New List Name"><button class="btn btn-sm">Create</button></div>');
            $(this).after(form);

            // submit
            form.children('button').on('click', function(e){
              e.preventDefault();

              // disabled?
              if($(this).is('[disabled]')){
                return;
              }

              // disable button
              var btn = $(this);
              btn.attr('disabled', 'disabled').text('Creating list...');

              // get new list name
              var listName = $(this).prev('input').val().trim();

              // sanitize list name
              listName = listName.replace(/[^A-Z|a-z|\d|\s]/g, '');

              // no list?
              if(!listName.length){
                form.remove();
                return;
              }

              // create list
              lists.createListWithContentType({
                listName: listName,
                description: listName,
                contentTypeId: settings.contenttypeid,
                removeContentTypeId: settings.removecontenttypeid
              },btn,form,input);

            });

          }

        });

      });
    };
    loadeditor();
  }
};
