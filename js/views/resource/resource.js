define(function(require){

    var $ = require('jquery'),
    pretemplate = require('text!templates/resource/resource.html'),
    styles = require('text!templates/resource/style'),
    _ = require('underscore'),
    jira = require('jira');

    var dataControl = require('views/global/global');

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
            $('.resource[resource-name="'+data.name+'"]').find('.assigned').text('Assigned: ' + $(data.issues).size())

            if($(data.issues).size() > 0){
                $('.resource[resource-name="'+data.name+'"]').find('.assigned').addClass('label-success');
            }else{
                $('.resource[resource-name="'+data.name+'"]').find('.assigned').removeClass('label-success');
            }


            // $('.resource[resource-name="'+data.name+'"]').find('.points').text('Points: ' + data.points)
            
            if(puntos != $('.resource[resource-name="'+data.name+'"]').find('.progress-bar').attr('puntos')){

                $('.resource[resource-name="'+data.name+'"]').find('.progress-bar').stop(true,true).animate({
                    height:puntos + '%'
                },function(){
                    $(this).removeClass(function (index, css) {
                         return (css.match (/\bprogress-bar-\S+/g) || []).join(' ')
                     }).attr('puntos',puntos).find('span').text(data.points)// +" / "+pointLimit);

                    // $('.resource[resource-name="'+data.name+'"]').find('.points').removeClass(function (index, css) {
                    //      return (css.match (/\blabel-\S+/g) || []).join(' ')
                    //  })


                    if(puntos < 85){
                        // $('.resource[resource-name="'+data.name+'"]').find('.points').addClass('label-success')
                        $(this).addClass('progress-bar-success');
                    }else if(puntos >=85 && puntos <= 100){
                        // $('.resource[resource-name="'+data.name+'"]').find('.points').addClass('label-warning')
                        // $(this).removeClass('progress-bar-success');
                        $(this).addClass('progress-bar-warning');
                    }else if(puntos > 100){
                        // $('.resource[resource-name="'+data.name+'"]').find('.points').addClass('label-danger')
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
                var node = $('<div class="issue"><span>'+issue.key+' - </span><span>Estimate: '+issue.estimateStatistic.statFieldValue.value+'</span></div>')
                $(issues).append(node)
            })
        }

        return $(issues).wrap("<span></span>").parent().html();
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