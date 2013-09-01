// Filename: app.js
define([
    'jquery',
    'underscore',
    'views/mainview/mainview',
    'backbone',
    'jquery.cookie',
], function($, _, MainView){

    var modules = [
        {
            'id': 'MainView',
            'divContainer': '#MainView'
        }
    ];

    function loadModule(module, queryParam){

            _.each(modules, function(moduleItem){
                if( moduleItem.id == module.moduleId  ){

                    if(!module.rendered){
                            module.render(queryParam);
                    }else{
                        try{//in case the function refreshRender does not exist at the module
                            module.refreshRender();
                        }catch(e){
                            // console.log(e)
                        }
                    }
                    $(moduleItem.divContainer).show();
                }else{
                    $(moduleItem.divContainer).hide();
                }

            });

    }

    var App = {

        initialize: function(){
            this.routePaths();
        },

        routePaths: function(){

            var AppRouter = Backbone.Router.extend({
                routes: {
                    "*actions": "defaultRoute"
                }
            });

            var app_router = new AppRouter;

            window.App_router = app_router;

            app_router.on('route:defaultRoute', function(actions) {
                loadModule(MainView);
            });

            Backbone.history.start();

        }
    };

    return App;
});