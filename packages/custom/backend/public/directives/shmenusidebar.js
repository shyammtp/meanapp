(function() {
    'use strict';

    function shMenuSidebar($timeout) { 
        return {
            restrict : 'E',
            templateUrl : 'backend/views/'+theme+'/page/sidebar/menus.html',
            link : function(scope,element,attrs) {  
                $timeout(function(){
                     window.$('.push-sidebar').click(function(){
                        var hidden = window.$('.sidebar');
                        
                        if (hidden.hasClass('visible')){
                            hidden.removeClass('visible');
                            window.$('.page-inner').removeClass('sidebar-visible');
                        } else {
                            hidden.addClass('visible');
                            window.$('.page-inner').addClass('sidebar-visible');
                        }
                        
                            window.$('.push-sidebar i').toggleClass("icon-arrow-left");
                            window.$('.push-sidebar i').toggleClass("icon-arrow-right");
                    });
                    window.$('.sidebar .accordion-menu li .sub-menu').slideUp(0);
                    window.$('.sidebar .accordion-menu li.open .sub-menu').slideDown(0);
                    window.$('.small-sidebar .sidebar .accordion-menu li.open .sub-menu').hide(0);
                    window.$('.sidebar .accordion-menu > li.droplink > a').click(function(){
                       
                        if(!(window.$('body').hasClass('small-sidebar'))&&(!window.$('body').hasClass('page-horizontal-bar'))&&(!window.$('body').hasClass('hover-menu'))) {
                        
                        var menu = window.$('.sidebar .menu'),
                            sidebar = window.$('.page-sidebar-inner'),
                            page = window.$('.page-content'),
                            sub = window.$(this).next(),
                            el = window.$(this);
                        
                        menu.find('li').removeClass('open');
                        window.$('.sub-menu').slideUp(200, function() {
                            sidebarAndContentHeight();
                        });
                        sidebarAndContentHeight();
                        
                        if (!sub.is(':visible')) {
                            window.$(this).parent('li').addClass('open');
                            window.$(this).next('.sub-menu').slideDown(200, function() {
                                sidebarAndContentHeight();
                            });
                        } else {
                            sub.slideUp(200, function() {
                                sidebarAndContentHeight();
                            });
                        }
                        return false;
                        };
                        
                        if((window.$('body').hasClass('small-sidebar'))&&(window.$('body').hasClass('page-sidebar-fixed'))) {
                            
                        var menu = window.$('.sidebar .menu'),
                            sidebar = window.$('.page-sidebar-inner'),
                            page = window.$('.page-content'),
                            sub = window.$(this).next(),
                            el = window.$(this);
                        
                        menu.find('li').removeClass('open');
                        window.$('.sub-menu').slideUp(200, function() {
                            sidebarAndContentHeight();
                        });
                        sidebarAndContentHeight();
                        
                        if (!sub.is(':visible')) {
                            window.$(this).parent('li').addClass('open');
                            window.$(this).next('.sub-menu').slideDown(200, function() {
                                sidebarAndContentHeight();
                            });
                        } else {
                            sub.slideUp(200, function() {
                                sidebarAndContentHeight();
                            });
                        }
                        return false;
                        };
                    });
                    
                    window.$('.sidebar .accordion-menu .sub-menu li.droplink > a').click(function(){
                        
                        var menu = window.$(this).parent().parent(),
                            sidebar = window.$('.page-sidebar-inner'),
                            page = window.$('.page-content'),
                            sub = window.$(this).next(),
                            el = window.$(this);
                        
                        menu.find('li').removeClass('open');
                        sidebarAndContentHeight();
                        
                        if (!sub.is(':visible')) {
                            window.$(this).parent('li').addClass('open');
                            window.$(this).next('.sub-menu').slideDown(200, function() {
                                sidebarAndContentHeight();
                            });
                        } else {
                            sub.slideUp(200, function() {
                                sidebarAndContentHeight();
                            });
                        }
                        return false;
                    });
                });

                // Makes .page-inner height same as .page-sidebar height
                var sidebarAndContentHeight = function () {
                    var content = window.$('.page-inner'),
                        sidebar = window.$('.page-sidebar'),
                        body = window.$('body'),
                        height,
                        footerHeight = window.$('.page-footer').outerHeight(),
                        pageContentHeight = window.$('.page-content').height();
                    
                        content.attr('style', 'min-height:' + sidebar.height() + 'px !important');
                    if (body.hasClass('page-sidebar-fixed')) {
                        height = sidebar.height() + footerHeight;
                    } else {
                        height = sidebar.height() + footerHeight;
                        if (height  < window.$(window).height()) {
                            height = window.$(window).height();
                        }
                    };
                    
                    if (height >= content.height()) {
                        content.attr('style', 'min-height:' + height + 'px !important');
                    };
                    if(body.hasClass('page-horizontal-bar')){
                        content.attr('style', 'min-height:' + window.$(window).height() + 'px !important' );
                    };
                    if((!sidebar.length)&&(!window.$('.navbar').length)) {
                        content.attr('style', 'min-height:' + pageContentHeight + 'px !important' );
                    }
                };
                
                sidebarAndContentHeight();
                
                window.onresize = sidebarAndContentHeight; 

                
            }

        }
    }

    angular
        .module('mean.backend')
        .directive('shmenuSidebar', shMenuSidebar);
    
        shMenuSidebar.$inject = ['$timeout'];
})();
