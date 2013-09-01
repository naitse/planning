define(function(require){

    var $ = require('jquery'),
    syncTemplate = require('text!templates/mainview/mainview.html'),
    styles = require('text!templates/mainview/style'),
    _ = require('underscore'),
    jira = require('jira'),
    sprintIssues = [],
    unassignedIssues = [],
    people = [
        'dario.carabajal',
        'sebastian.gramano',
        'christopher.mordue',
        'dmitry.spasibenko',
        'konstantin.babushkin',
        'yulia.savinkova',
        'jlim',
        'farolfo',
        'diego.fernandez',
        'fernando.federico'
    ],
    rcont = '#resources-load',
    rapidBoard,
    resource = require('views/resource/resource');
    dataControl = require('views/global/global');

    $(people).each(function(){
        dataControl[this] = persona({nombre:this.toString(),assigned:0,points:0})
    })

    var MainView = {
        moduleId: "MainView",

        rendered: false,

        render: function(){
            if(!this.rendered){
                $("#pannel-wrapper").append(syncTemplate);
                attachStyles();
                attachE();
                jira.getBoardConfig().done(function(data){
                    rapidBoard = data.rapidBoard;
                    initialize();
                    resource.renderUsers(people,rcont);
                    
                })
                this.rendered = true;
            }
        }

    };

    function initialize(){
           jira.getData(rapidBoard).done(function(data){
                sprintIssues = jira.getBacklogIssues(data)
                manageData()
           })
    }

    function updateUnassignedBar(){
        var width = (unassignedIssues.length * 100) / sprintIssues.length;
        $('#remaining-unassigned').find('.unassigned').text(unassignedIssues.length);
        $('#remaining-unassigned').find('.total').text(sprintIssues.length);
        $('.remaining-issues .progress-bar').css('width',width + '%');
    }

    function updateOveralBar(){
        var overal = 0;
        $(sprintIssues).each(function(){
            if (this.estimateStatistic.statFieldValue.value){
                overal += this.estimateStatistic.statFieldValue.value
            }
        })
        $('#overal-points').text(overal);
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
        var monitor = setTimeout(initialize(),15000);

    }

    function attachE(){
    }

    function attachStyles(){
        loaded= false;
        
        $('style').each(function(){
            if($(this).attr('sof') == "mainview"){
                loaded = true;
            }
        })
        if(!loaded){
            $('body').append($(styles));
        }
        

    }

    function persona(args){
        return {
            name:args.nombre,
            assigned:args.assigned,
            points:args.points,
            issues:[]
        }
    }

    return MainView;

});