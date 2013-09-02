define(function(require){

    var $ = require('jquery'),
    //baseUrl = "http://planning.cloudhub.io/";
    baseUrl = "http://localhost:8081/";

    require('jquery.base64');

    var jira = {

        _rapidBoardId: 53,
        
        _issueLookup : null,
        
        getUrl: function() {
            return baseUrl.replace('{id}',this._rapidBoardId);
        },

        getBoardUsers:function(){
            return   $.ajax({
                  type:'GET',
                  url: baseUrl + 'getBoardUsers',
                  dataType: "json"
            });
        },

        getBoardConfig:function(){
            return   $.ajax({
                  type:'GET',
                  url: baseUrl + 'getConfig',
                  dataType: "json"
            });
        },
        
        getData: function(rapidBoard){
            return   $.ajax({
                  type:'GET',
                  url: baseUrl + 'getIssues?rapidBoard='+rapidBoard,
                  dataType: "json"
            });
        },

        getLastPoints:function(rapidBoard){
            return   $.ajax({
                  type:'GET',
                  url: baseUrl + 'getLastPoints?rapidBoard=' + rapidBoard,
                  dataType: "json"
            }); 
        },

        getUserProfile:function(username){
            return   $.ajax({
                  type:'GET',
                  url: baseUrl + 'getUserProfile?un=' + username,
                  dataType: "json"
            });
        },

        getBacklogIssues: function(data){
            var result = [];
            var marker = data.markers[0].afterIssueKey;
            var flag = 0;
            $(data.issues).each(function(){
                if(this.key != marker && flag == 0){
                    result.push(this);
                }else if(this.key == marker && flag == 0){
                    result.push(this);
                    flag = 1
                }else{
                    return false;
                }
            })
            return result;
        }
        /*,

        _data: null,
        
        invalidate: function () {
            this._data = null;
        },
        
        _getData: function () {
            
            if (this._data)
                return  this._data;
                
            var this$ = this;
            
            return $.get({
                url:this._getUrl(),
                handleAs: "json" ,
                headers: { "Content-Type": "application/json"}
            }).then(function(data) {
                this$._setData(data);
                return data;
            });;
        },
        
        _setData: function (data) {
        
            this._data = data;
            
            //Build a lookup table for accessing issues.
            var lookup = {};
            
            array.forEach(data.issues,function(item,index) {
                lookup[item.key] = index;
            });
            
            this._issueLookup = lookup;
        },
        
        getPendingSprints: function () 
        {
            var this$ = this;
            return when(this._getData(),
                function (data) {
                    var d = this$._data;
                    return d.markers;
                }
            );
        },
        
        _getMarkerIndex: function(sprintId) {
            var markers = this._data.markers;
            for(var i=0; i < markers.length; i++) {
                if (markers[i].id == sprintId)
                    return i;
            }
            return -1;
        },
        
        _getIssuesForMarker: function(markerIndex) {
            var startIndex = 0;
            var endIndex = 0;
            
            if (markerIndex > 0)
                startIndex = this._issueLookup[this._data.markers[markerIndex-1].afterIssueKey]+1;
            endIndex = this._issueLookup[this._data.markers[markerIndex].afterIssueKey];
            return this._data.issues.slice(startIndex,endIndex+1);
            
        },
        
        _calcLoadingData: function (issues) {
        
            var assignees = {};
            
            array.forEach(issues, function(value, index) {
                var id = value.assignee;
                //Attempt to look up assignee
                var assignee = assignees[id];
                //if none found initialize record and add it.
                if (! assignee) {
                    assignee = { id: id, name:value.assigneeName, storyPoints: 0, timeRemaining: 0, noStoryPointsCount: 0, noTimeRemainingCount:0};
                    assignees[id] = assignee;
                }
                var sp = value.estimateStatistic.statFieldValue.value;
                if (sp)
                    assignee.storyPoints += sp;
                else
                    assignee.noStorePointsCount++;
                    
                var tr = value.trackingStatistic.statFieldValue.value;
                if (tr) {
                    //decode to days here.
                    tr = tr / 3600 / 5.5;
                    assignee.timeRemaining += tr;
                } else {
                    assignee.noTimeRemainingCount++;
                }
                
            });
            
            var data = [];
            for(var assignee in assignees) {
                data.push(assignees[assignee]);
            }
            return data;
        },
        
        getMarkerLoading: function(sprintId) {
            var markerIndex = this._getMarkerIndex(sprintId);
            var issues = this._getIssuesForMarker(markerIndex);
            return this._calcLoadingData(issues);
        }*/

    };

    return jira;

});