define(function(require){

    var $ = require('jquery'),
    pretemplate = require('text!templates/resource/resource.html'),
    styles = require('text!templates/resource/style'),
    _ = require('underscore'),
    jira = require('jira');

    var global = require('views/global/global');

    var dataControl =  global.dataControl;

    require('bootstrap');

    var pointLimit = 13;

    // var revertDrop = false;


    $.ajaxQ = (function(){
      var id = 0, Q = {};

      $(document).ajaxSend(function(e, jqx){
        jqx._id = ++id;
        Q[jqx._id] = jqx;
      });
      $(document).ajaxComplete(function(e, jqx){
        delete Q[jqx._id];
      });

      return {
        abortAll: function(){
          var r = [];
          $.each(Q, function(i, jqx){
            r.push(jqx._id);
            jqx.abort();
          });
          return r;
        }
      };

    })();

    $(document).keydown(function(e){
      if( e.keyCode == 27 )
        global.revertDrop = true;
        $('.resource').removeClass('droppable');
        $( '.ui-draggable-dragging' ).draggable( 'option',  'revert', true ).trigger( 'mouseup' );
    })

    var Resource = {

        renderUsers:function(users,container){
            $(users).each(function(){
                jira.getUserProfile(this).done(function(data){
                    var template = $(pretemplate);
                    var avatar = _.toArray(data.avatarUrls)[1]
                    $(template).find('.avatar').attr('style', 'background: url('+avatar+')').tooltip({
                        title:data.displayName,
                        trigger:'hover'
                    })
                    $(template).find('.name').text(data.displayName);
                    $(template).attr('resource-name',data.name);
                    $(template).find('.progress').popover({
                        html:true,
                        trigger:'click',
                        content:'Loading...'
                    }).on('show.bs.popover', function () {
                        $('.popover').parents('.resource').find('.progress').popover('hide');
                    }).on('shown.bs.popover', function () {
                        var user = $(this).parents('.resource').attr('resource-name');
                        updatePop(user)
                    })

                    $(template).droppable({
                        activate: function( event, ui ) {$(this).toggleClass('drop-active');},
                        drop: function(event, ui) {
                            $('.resource').toggleClass('drop-active').removeClass('drop-active-over');
                            $('.issues-container').toggleClass('drop-active').removeClass('drop-active-over')
                            var assignee = $(this).attr('resource-name');
                            var issueKey = $(global.issueKey).attr('issueKey');
                            if(global.revertDrop != true){
                                jira.assignIssue(assignee, issueKey).done(function(){
                                    global.dragging = false;
                                    global.issueKey = null;
                                }).fail(function(){
                                    global.dragging = false;
                                     $('.issues-container').removeClass('drop-active-over');
                                    $('.resource').removeClass('drop-active-over');
                                    $(this).removeClass('drop-active-over')
                                })
                            }else{
                                 $('.issues-container').removeClass('drop-active-over');
                                    $('.resource').removeClass('drop-active-over');
                                    $(this).removeClass('drop-active-over')
                                    global.dragging = false;
                            }
                        },
                        over: function( event, ui ) {
                            $('.issues-container').removeClass('drop-active-over');
                            $('.resource').removeClass('drop-active-over');
                            $(this).addClass('drop-active-over')
                        }
                    })
                    $(container).append(template);
                    $(container).find('.resource').sort(asc_sort).appendTo(container);
                })
            })
        },
        updateBar:function(data){
            var puntos = (data.points * 100) / pointLimit ;
            $('.resource[resource-name="'+data.name+'"]').find('.assigned').text('A ' + $(data.issues).size())

            if($(data.issues).size() > 0){
                $('.resource[resource-name="'+data.name+'"]').find('.assigned').addClass('label-success');
            }else{
                $('.resource[resource-name="'+data.name+'"]').find('.assigned').removeClass('label-success');
            }

            var toes =toEstimate(data.name)

            $('.resource[resource-name="'+data.name+'"]').find('.noes').text('E ' + toes);

            if(toes > 0){
                $('.resource[resource-name="'+data.name+'"]').find('.noes').addClass('label-warning');
            }else{
                $('.resource[resource-name="'+data.name+'"]').find('.noes').removeClass('label-warning');
            }



            if(puntos != $('.resource[resource-name="'+data.name+'"]').find('.progress-bar').attr('puntos')){

                $('.resource[resource-name="'+data.name+'"]').find('.progress-bar').stop(true,true).animate({
                    height:puntos + '%'
                },function(){
                    $(this).removeClass(function (index, css) {
                         return (css.match (/\bprogress-bar-\S+/g) || []).join(' ')
                     }).attr('puntos',puntos).find('span').text(data.points)// +" / "+pointLimit);
                    if(puntos < 85){
                        $(this).addClass('progress-bar-success');
                    }else if(puntos >=85 && puntos <= 100){
                        $(this).addClass('progress-bar-warning');
                    }else if(puntos > 100){
                        $(this).addClass('progress-bar-danger');
                    }
                })
                
            }
            if($('.resource[resource-name="'+data.name+'"]').find('.popover').size() > 0){
                updatePop(data.name);
            }

            $('.issue').draggable({
                start: function( event, ui ) {
                    $.ajaxQ.abortAll();
                    global.revertDrop = false;
                    global.dragging = true;
                    global.issueKey = this;

                },
                stop: function( event, ui ) {
                    if(global.revertDrop != true){
                        $(this).remove();
                    }
                }
            })
        }
    };


    function updatePop(user){
          var ap = popContent(user)
          var container = $('.resource[resource-name="'+user+'"]').find('.popover-content');
          $(container).html(ap);
    }

    function popContent(user){
        var issues = $('<div class="issues"></div>')

        if(!dataControl[user].issues){
            $(issues).text('Nothing assigned');
        }else if(dataControl[user].issues.length == 0){
            $(issues).text('Nothing assigned');
        }else{
            _.each(dataControl[user].issues,function(issue){

                var clas = (!issue.estimateStatistic.statFieldValue.value)?'label-warning':'label-default';
                var text = (!issue.estimateStatistic.statFieldValue.value)?'<span class="label label-warning">Estimate</span>':'Effort: ';
                var est = (!issue.estimateStatistic.statFieldValue.value)?'':issue.estimateStatistic.statFieldValue.value;
                var node = $('<div class="issue " issueKey="'+issue.key+'"><div class="grabber" style="background-color:'+issue.color+'"/><img src="' + issue.typeUrl + '" title="'+issue.typeName+'"></img> <img src="' + issue.priorityUrl+'" title="'+issue.priorityName+'"></img> <img src="'+issue.statusUrl+'"></img> <span>' + issue.key + ' - '+text+' </span> <span class="badge badge-info">'+est+'</span></div>') //</span><span class="badge badge-info">'+est+'</span><
                $(issues).append(node)

            })
        }

        return $(issues).wrap("<span></span>").parent().html();
    }

    function toEstimate(user){
    var val = 0;
       if(dataControl[user].issues.length == 0){
            // $(issues).text('Nothing assigned');
        }else{
            _.each(dataControl[user].issues,function(issue){
                if(!issue.estimateStatistic.statFieldValue.value){
                    val += 1;
                }
            })
        }

        return val;

    }

    function asc_sort(a, b){
        return ($(b).attr('resource-name')) < ($(a).attr('resource-name')) ? 1 : -1;    
    }

    function attachStyles(){

        loaded= false;
        $('style').each(function(){
            if($(this).attr('sof') == "resource"){
                loaded = true;
            }
        })
        if(!loaded){
            $('body').append($(styles));
        }
    }

    attachStyles()
    return Resource;

});