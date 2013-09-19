define(function(require){

    var $ = require('jquery'),
    syncTemplate = require('text!templates/mainview/mainview.html'),
    styles = require('text!templates/mainview/style'),
    stylesb = require('text!templates/mainview/styleb'),
    _ = require('underscore'),
    jira = require('jira'),
    sprintIssues = [],
    init = false,
    unassignedIssues = [],
    people =[],
    rcont = '#resources-load',
    rapidBoard,
    resource = require('views/resource/resource');
    

    var global = require('views/global/global');

    var dataControl =  global.dataControl;

    var MainView = {
        moduleId: "MainView",

        rendered: false,

        render: function(book){
            console.log(book)
            if(!this.rendered){

                $("#pannel-wrapper").append(syncTemplate);
                
                if (typeof book != 'undefined'){
                    attachStyles('b');
                    global.styles = 'b';
                    resource.attachStyles(global.styles);
                    $('.page-header').remove();
                    $('iframe').attr('src','https://www.mulesoft.org/jira/secure/RapidBoard.jspa?rapidView=53&view=planning');
                    // adjustBook();
                    // var close = $('<div class="closeBook"><i class="glyphicon glyphicon-remove"></i></div>').click(function(){
                    //     $('iframe', window.parent.document).hide()
                    // })
                    // $('body').append(close)
                }else{
                    attachStyles('');
                    global.styles = '';
                }

                attachStyles();
                attachE();
                jira.getBoardConfig().done(function(data){
                    rapidBoard = data[0].rapidBoard;
                    $(data).each(function(){
                        people.push(this.username);
                        dataControl[this.username] = persona({nombre:this.username.toString(),assigned:0,points:0})  
                    })
                    initialize();
                    resource.renderUsers(people,rcont,adjustIssues);
                    adjustIssues();
                })
                this.rendered = true;
            }
        }

    };

    function initialize(){
            complete = false
           jira.getData(rapidBoard).done(function(data){
                sprintIssues = jira.getBacklogIssues(data)
                manageData()
                init = true
                monitoring();
           }).fail(function(){
                monitoring();
           })
           if(init == false){
               jira.getLastPoints(rapidBoard).done(function(data){
                    var data = data.content
                    $('#last-points').text(data.total);
                    $('#last-points-incompleted').text(data.incompleted).parents('.label').addClass(function(){return v = (parseInt(data.incompleted) > 0)?'label-warning':'label-info';});
                    $('#last-points-completed').text(data.completed);
               })
           }
    }

    function monitoring(){
        var monitor = setTimeout(function(){
            if(global.dragging == false ){
                initialize()
            }else{
                monitoring()  
            }

        },2000);
    }

    function updateUnassignedBar(){
        var width = (unassignedIssues.length * 100) / sprintIssues.length;
        $('#remaining-unassigned').find('.unassigned').text(unassignedIssues.length);
        $('#total-issues').find('.total').text(sprintIssues.length);
    }

    function updateOveralBar(){
        var overal = 0;
        var unoveral = 0;
        $(sprintIssues).each(function(){
            if (this.estimateStatistic.statFieldValue.value){
                overal += this.estimateStatistic.statFieldValue.value
            }
        })
        $(unassignedIssues).each(function(){
            if (this.estimateStatistic.statFieldValue.value){
                unoveral += this.estimateStatistic.statFieldValue.value
            }
        })
        $('#overal-points').text(overal);
        $('#unoveral-points').text(unoveral);
    }

    function manageData(){

        _.each(_.keys(dataControl),function(key){
            dataControl[key].issues = _.where(sprintIssues, {assignee: key});
            dataControl[key].assigned = dataControl[key].issues.length
            var points = 0;
            $(dataControl[key].issues).each(function(){
                if (this.estimateStatistic.statFieldValue.value){
                    points += this.estimateStatistic.statFieldValue.value
                }
            })
            dataControl[key].points =  points;
            resource.updateBar(dataControl[key])
        })

        unassignedIssues = _.filter(sprintIssues, function(obj){ if(!obj.assignee){ return obj;} });
        updateUnassignedBar();
        updateOveralBar();
        $('.nav-stacked li.active a').click()

    }

    function attachE(){
        $('.issues-container').droppable({
            activate: function( event, ui ) {$(this).toggleClass('drop-active');},
            drop: function(event, ui) {
                $('.resource').toggleClass('drop-active').removeClass('drop-active-over');
                $('.issues-container').toggleClass('drop-active').removeClass('drop-active-over');
                var assignee = '-1';
                var issueKey = $(global.issueKey).attr('issueKey');
                if(global.revertDrop != true){
                    jira.assignIssue(assignee, issueKey).done(function(){
                        global.dragging = false;
                        global.issueKey = null;
                    }).fail(function(){
                        $('.issues-container').removeClass('drop-active-over')
                        $('.resource').removeClass('drop-active-over');
                        $(this).removeClass('drop-active-over')
                        global.dragging = false;
                    })
                }else{
                        $('.issues-container').removeClass('drop-active-over')
                        $('.resource').removeClass('drop-active-over');
                        $(this).removeClass('drop-active-over')
                        global.dragging = false;
                }
            },
            over: function( event, ui ) {
                $('.issues-container').removeClass('drop-active-over')
                $('.resource').removeClass('drop-active-over');
                $(this).addClass('drop-active-over')
           }
        });

        $('.nav-stacked a').click(function(e){
            e.preventDefault()
            $('.nav-stacked li').removeClass('active');
            $(this).parents('li').addClass('active');
        })

        $('.nav-stacked a#total-issues').click(function(e){
            e.preventDefault()
            var content = setIssueContent(sprintIssues);
            $('.issues-container').html(content);
        })

        $('.nav-stacked a#remaining-unassigned').click(function(e){
            e.preventDefault()
            var content = setIssueContent(unassignedIssues);
            $('.issues-container').html(content);
        })


        $('.refresh-iframe').click(function(){
            $('iframe').attr('src',$('iframe').attr('src'))
        })

    }

    function attachStyles(type){
        loaded= false;
        
        $('style').each(function(){
            if($(this).attr('sof') == "mainview"){
                loaded = true;
            }
        })
        if(!loaded){

            var style = (type == 'b')?stylesb:styles;

            $('body').append($(style));
        }
        

    }

    function setIssueContent(_array){

        var issues = $('<div class="issues"></div>')

        _.each(_array,function(issue){
                var clas = (!issue.estimateStatistic.statFieldValue.value)?'label-warning':'label-default';
                var text = (!issue.estimateStatistic.statFieldValue.value)?' | Estimate |':'Effort: ';
                var est = (!issue.estimateStatistic.statFieldValue.value)?'':issue.estimateStatistic.statFieldValue.value;
                var node = $('<div class="issue " issueKey="'+issue.key+'"><div class="grabber" style="background-color:'+issue.color+'"/><img src="' + issue.typeUrl + '" title="'+issue.typeName+'"></img> <img src="' + issue.priorityUrl+'" title="'+issue.priorityName+'"></img> <img src="'+issue.statusUrl+'"></img> <span>' + issue.key + ' </span><span class="summary"> '+issue.summary+'</span></div>') //</span><span class="badge badge-info">'+est+'</span><
                node.draggable({
                handle: '.grabber',
                start: function( event, ui ) {
                    $.ajaxQ.abortAll();
                    global.revertDrop = false;
                    global.dragging = true;
                    global.issueKey = this;
                    $(this).find('.summary').hide().parents('.issue')
                    .css({
                        width:150,
                        overflow:'hidden'
                    })

                },
                stop: function( event, ui ) {
                    if(global.revertDrop != true){
                        $(this).remove();
                    }else{
                        $(this).find('.summary').show().parents('.issue').css({
                            width:'100%',
                            overflow:'hidden'
                         })
                    }
                }
            })
                $(issues).append(node)
            })

        return issues;
    }


    function persona(args){
        return {
            name:args.nombre,
            assigned:args.assigned,
            points:args.points,
            issues:[]
        }
    }

    $(window).resize(adjustIssues);



    function adjustIssues(initial){
        // initial = initial || 8;
        var left = $('.tabs').width()
        var parent = $('.tabs').parents('div').width()
        if (global.styles == ''){
            $('.issues-container').css('width', parent - 248 );
        }else{
            var pa = $('#resources-load').width()
            var inner = $('.resource').size() * 70
            $('.issues-container').css('width', pa - inner );
        }
    }


    return MainView;

});