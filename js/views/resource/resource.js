define(function(require){

    var $ = require('jquery'),
    pretemplate = require('text!templates/resource/resource.html'),
    styles = require('text!templates/resource/style'),
    _ = require('underscore'),
    jira = require('jira');

    var dataControl = require('views/global/global').dataControl;

    require('bootstrap');

    var pointLimit = 13;

    var Resource = {

        renderUsers:function(users,container){
            $(users).each(function(){
                jira.getUserProfile(this).done(function(data){
                    var template = $(pretemplate);
                    var avatar = _.toArray(data.avatarUrls)[1]
                    $(template).find('.avatar').attr('style', 'background: url('+avatar+')').hover(function(){
                        $(this).find('.name').show();
                    },
                    function(){
                        $(this).find('.name').hide();  
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
        }
    };


    function updatePop(user){
          var ap = popContent(user)
          var container = $('.resource[resource-name="'+user+'"]').find('.popover-content');
          $(container).html(ap);
    }

    function popContent(user){
        var issues = $('<div class="issues"></div>')

        if(dataControl[user].issues.length == 0){
            $(issues).text('Nothing assigned');
        }else{
            _.each(dataControl[user].issues,function(issue){
                var clas = (!issue.estimateStatistic.statFieldValue.value)?'label-warning':'label-default';
                var text = (!issue.estimateStatistic.statFieldValue.value)?' | Estimate |':'Effort: ';
                var est = (!issue.estimateStatistic.statFieldValue.value)?'':issue.estimateStatistic.statFieldValue.value;
                var node = $('<h4><div class="issue label '+clas+'"><span>'+issue.key+' - '+text+'</span><span class="badge badge-info">'+est+'</span></div></h4>')
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