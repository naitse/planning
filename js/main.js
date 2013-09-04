require.config({
  paths: {
    jquery: "libs/jquery/jQuery-1.8.3",
    bootstrap: "libs/bootstrap/js/bootstrap",
    jqueryui: "libs/jqueryui/jquery-ui-1.10.2.custom.min",
    underscore: "libs/underscore/underscore-min",
    backbone: "libs/backbone/backbone-min",
    // blockui: 'libs/blockui/jquery.blockUI',
    exporting: 'libs/highcharts/exporting',
    // highcharts: 'libs/highcharts/highcharts',
    'jquery.cookie': 'libs/jquerycookie/jquery.cookie',
    'jquery.base64': 'libs/jquery.base64/jquery.base64',
    'textext':'libs/textext/textext.min',
    'jquery.grid': 'libs/jquery.grid/jquery.handsontable.full',
    // barman: 'libs/barman/barman.min',
    // handlebars: 'libs/handlebars/handlebars',
    // PusherNotifier: 'libs/PusherNotifier/PusherNotifier',
    gritter: 'libs/gritter/js/jquery.gritter.min',
    jira:'controlers/jira/jira'
  },

  shim: {
  	bootstrap: {
  		deps: ['jqueryui']
  	},
  	jqueryui: {
  		deps: ['jquery']
  	},
    jira: {
        deps: ['jquery']
    },
    underscore:{
        exports: '_'
    },
    // blockui:{
    //   deps: ['jquery']
    // },
    backbone:{
        deps: ['jquery'],
        exports: 'Backbone'
    },
    exporting:{
        deps: ['highcharts']
    },
    'jquery.cookie':{
        deps: ['jquery']
    },
    'jquery.base64':{
        deps: ['jquery']
    },
    'textext':{
        deps: ['jquery','jqueryui']
    },
    'jquery.grid':{
        deps: ['jquery']
    }
    // handlebars: {
    //   exports: 'Handlebars'
    // }

  }
});

require(['app'], function(App){
  App.initialize();
});