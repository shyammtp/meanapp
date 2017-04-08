jQuery( document ).ready(function() {
    // Toggle Search
    jQuery('.show-search').click(function(){
        jQuery('.search-form').css('margin-top', '0');
        jQuery('.search-input').focus();
    });
    
    jQuery('.close-search').click(function(){
        jQuery('.search-form').css('margin-top', '-70px');
    });
    
    // Fullscreen
    function toggleFullScreen() {
        if ((document.fullScreenElement && document.fullScreenElement !== null) ||  
            (!document.mozFullScreen && !document.webkitIsFullScreen)) {
            if (document.documentElement.requestFullScreen) {  
                document.documentElement.requestFullScreen();  
            } else if (document.documentElement.mozRequestFullScreen) {  
                document.documentElement.mozRequestFullScreen(); 
            } else if (document.documentElement.webkitRequestFullScreen) {
                document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
            }  
        } else {  
            if (document.cancelFullScreen) {  
                document.cancelFullScreen();  
            } else if (document.mozCancelFullScreen) {  
                document.mozCancelFullScreen();  
            } else if (document.webkitCancelFullScreen) {  
                document.webkitCancelFullScreen();  
            }  
        }  
    }
    
    // Waves
    Waves.displayEffect();
    
    // tooltips
     
    
    // Switchery
    var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
    
    elems.forEach(function(html) {
        var switchery = new Switchery(html, { color: '#23B7E5' });
    });
    
    // Element Blocking
    function blockUI(item) {    
        jQuery(item).block({
            message: '<img src="assets/images/reload.gif" width="20px" alt="">',
            css: {
                border: 'none',
                padding: '0px',
                width: '20px',
                height: '20px',
                backgroundColor: 'transparent'
            },
            overlayCSS: {
                backgroundColor: '#fff',
                opacity: 0.9,
                cursor: 'wait'
            }
        });
    }
    
    function unblockUI(item) {
        jQuery(item).unblock();
    }  
    
    // Panel Control
    jQuery('.panel-collapse').click(function(){
        jQuery(this).closest(".panel").children('.panel-body').slideToggle('fast');
    });
    
    jQuery('.panel-reload').click(function() { 
        var el = jQuery(this).closest(".panel").children('.panel-body');
        blockUI(el);
        window.setTimeout(function () {
            unblockUI(el);
        }, 1000);
    
    }); 
    
    jQuery('.panel-remove').click(function(){
        jQuery(this).closest(".panel").hide();
    });
    
    // Push Menu
    jQuery('.push-sidebar').click(function(){
        var hidden = jQuery('.sidebar');
        
        if (hidden.hasClass('visible')){
            hidden.removeClass('visible');
            jQuery('.page-inner').removeClass('sidebar-visible');
        } else {
            hidden.addClass('visible');
            jQuery('.page-inner').addClass('sidebar-visible');
        }
        
            jQuery('.push-sidebar i').toggleClass("icon-arrow-left");
            jQuery('.push-sidebar i').toggleClass("icon-arrow-right");
    });
    
    // sortable
     
    // Uniform
    var checkBox = jQuery("input[type=checkbox]:not(.switchery), input[type=radio]:not(.no-uniform)");
    if (checkBox.length > 0) {
        checkBox.each(function() {
            jQuery(this).uniform();
        });
    };
    
    // .toggleAttr() Function
    jQuery.fn.toggleAttr = function(a, b) {
        var c = (b === undefined);
        return this.each(function() {
            if((c && !jQuery(this).is("["+a+"]")) || (!c && b)) jQuery(this).attr(a,a);
            else jQuery(this).removeAttr(a);
        });
    };
    
    // Sidebar Menu
    var parent, ink, d, x, y;
    jQuery('.sidebar .accordion-menu li .sub-menu').slideUp(0);
    jQuery('.sidebar .accordion-menu li.open .sub-menu').slideDown(0);
    jQuery('.small-sidebar .sidebar .accordion-menu li.open .sub-menu').hide(0);
    jQuery('.sidebar .accordion-menu > li.droplink > a').click(function(){
        
        if(!(jQuery('body').hasClass('small-sidebar'))&&(!jQuery('body').hasClass('page-horizontal-bar'))&&(!jQuery('body').hasClass('hover-menu'))) {
        
        var menu = jQuery('.sidebar .menu'),
            sidebar = jQuery('.page-sidebar-inner'),
            page = jQuery('.page-content'),
            sub = jQuery(this).next(),
            el = jQuery(this);
        
        menu.find('li').removeClass('open');
        jQuery('.sub-menu').slideUp(200, function() {
            sidebarAndContentHeight();
        });
        sidebarAndContentHeight();
        
        if (!sub.is(':visible')) {
            jQuery(this).parent('li').addClass('open');
            jQuery(this).next('.sub-menu').slideDown(200, function() {
                sidebarAndContentHeight();
            });
        } else {
            sub.slideUp(200, function() {
                sidebarAndContentHeight();
            });
        }
        return false;
        };
        
        if((jQuery('body').hasClass('small-sidebar'))&&(jQuery('body').hasClass('page-sidebar-fixed'))) {
            
        var menu = jQuery('.sidebar .menu'),
            sidebar = jQuery('.page-sidebar-inner'),
            page = jQuery('.page-content'),
            sub = jQuery(this).next(),
            el = jQuery(this);
        
        menu.find('li').removeClass('open');
        jQuery('.sub-menu').slideUp(200, function() {
            sidebarAndContentHeight();
        });
        sidebarAndContentHeight();
        
        if (!sub.is(':visible')) {
            jQuery(this).parent('li').addClass('open');
            jQuery(this).next('.sub-menu').slideDown(200, function() {
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
    
    jQuery('.sidebar .accordion-menu .sub-menu li.droplink > a').click(function(){
        
        var menu = jQuery(this).parent().parent(),
            sidebar = jQuery('.page-sidebar-inner'),
            page = jQuery('.page-content'),
            sub = jQuery(this).next(),
            el = jQuery(this);
        
        menu.find('li').removeClass('open');
        sidebarAndContentHeight();
        
        if (!sub.is(':visible')) {
            jQuery(this).parent('li').addClass('open');
            jQuery(this).next('.sub-menu').slideDown(200, function() {
                sidebarAndContentHeight();
            });
        } else {
            sub.slideUp(200, function() {
                sidebarAndContentHeight();
            });
        }
        return false;
    });
    
    // Small Fixed Sidebar
    var onSidebarHover = function() {
        jQuery('.small-sidebar.page-sidebar-fixed:not(.page-horizontal-bar) .page-sidebar').mouseenter(function(){
            jQuery('body:not(.page-horizontal-bar) .navbar').addClass('hovered-sidebar');
            jQuery('.small-sidebar.page-sidebar-fixed:not(.page-horizontal-bar) .navbar .logo-box a span').html(jQuery('.navbar .logo-box a span').text() == smTxt ? str : smTxt);
        });
        jQuery('.small-sidebar.page-sidebar-fixed:not(.page-horizontal-bar) .page-sidebar').mouseleave(function(){
            jQuery('body:not(.page-horizontal-bar) .navbar').removeClass('hovered-sidebar');
    jQuery('.small-sidebar.page-sidebar-fixed:not(.page-horizontal-bar) .navbar .logo-box a span').html(jQuery('.navbar .logo-box a span').text() == smTxt ? str : smTxt);
        });
    };
    
    onSidebarHover();
    
    // Makes .page-inner height same as .page-sidebar height
    var sidebarAndContentHeight = function () {
        var content = jQuery('.page-inner'),
            sidebar = jQuery('.page-sidebar'),
            body = jQuery('body'),
            height,
            footerHeight = jQuery('.page-footer').outerHeight(),
            pageContentHeight = jQuery('.page-content').height();
        
            content.attr('style', 'min-height:' + sidebar.height() + 'px !important');
        if (body.hasClass('page-sidebar-fixed')) {
            height = sidebar.height() + footerHeight;
        } else {
            height = sidebar.height() + footerHeight;
            if (height  < jQuery(window).height()) {
                height = jQuery(window).height();
            }
        };
        
        if (height >= content.height()) {
            content.attr('style', 'min-height:' + height + 'px !important');
        };
        if(body.hasClass('page-horizontal-bar')){
            content.attr('style', 'min-height:' + jQuery(window).height() + 'px !important' );
        };
        if((!sidebar.length)&&(!jQuery('.navbar').length)) {
            content.attr('style', 'min-height:' + pageContentHeight + 'px !important' );
        }
    };
    
    sidebarAndContentHeight();
    
    window.onresize = sidebarAndContentHeight;
    
    // Slimscroll
    /*jQuery('.slimscroll').slimscroll({
        allowPageScroll: true
    });
    */
    // Layout Settings
    var fixedHeaderCheck = document.querySelector('.fixed-header-check'),
        fixedSidebarCheck = document.querySelector('.fixed-sidebar-check'),
        horizontalBarCheck = document.querySelector('.horizontal-bar-check'),
        toggleSidebarCheck = document.querySelector('.toggle-sidebar-check'),
        boxedLayoutCheck = document.querySelector('.boxed-layout-check'),
        compactMenuCheck = document.querySelector('.compact-menu-check'),
        hoverMenuCheck = document.querySelector('.hover-menu-check'),
        defaultOptions = function() {
            
            if((jQuery('body').hasClass('small-sidebar'))&&(toggleSidebarCheck.checked == 1)){
                toggleSidebarCheck.click();
            }
        
            if((jQuery('body').hasClass('page-header-fixed'))&&(fixedHeaderCheck.checked == 1)){
                fixedHeaderCheck.click();
            }
        
            if((jQuery('body').hasClass('page-sidebar-fixed'))&&(fixedSidebarCheck.checked == 1)){
                fixedSidebarCheck.click();
            }
        
            if((jQuery('body').hasClass('page-horizontal-bar'))&&(horizontalBarCheck.checked == 1)){
                horizontalBarCheck.click();
            }
        
            if(!(jQuery('body').hasClass('compact-menu'))&&(compactMenuCheck.checked == 0)){
                compactMenuCheck.click();
            }
        
            if((jQuery('body').hasClass('hover-menu'))&&(hoverMenuCheck.checked == 1)){
                hoverMenuCheck.click();
            }
        
            if((jQuery('.page-content').hasClass('container'))&&(boxedLayoutCheck.checked == 1)){
                boxedLayoutCheck.click();
            }
           
            sidebarAndContentHeight();
        },
        str = jQuery('.navbar .logo-box a span').text(),
        smTxt = (str.slice(0,1)),
        collapseSidebar = function() {
            jQuery('body').toggleClass("small-sidebar");
            jQuery('.navbar .logo-box a span').html(jQuery('.navbar .logo-box a span').text() == smTxt ? str : smTxt);
            sidebarAndContentHeight();
            jQuery('.sidebar-toggle i').toggleClass("icon-arrow-left");
            jQuery('.sidebar-toggle i').toggleClass("icon-arrow-right");
            onSidebarHover();
        },
        fixedHeader = function() {
            if((jQuery('body').hasClass('page-horizontal-bar'))&&(jQuery('body').hasClass('page-sidebar-fixed'))&&(jQuery('body').hasClass('page-header-fixed'))){
                fixedSidebarCheck.click();
                alert("Static header isn't compatible with a fixed horizontal nav mode. I will set a static mode on the horizontal nav.");
            onSidebarHover();
            };
            jQuery('body').toggleClass('page-header-fixed');
            sidebarAndContentHeight();
            onSidebarHover();
        },
        fixedSidebar = function() {
            if((jQuery('body').hasClass('page-horizontal-bar'))&&(!jQuery('body').hasClass('page-sidebar-fixed'))&&(!jQuery('body').hasClass('page-header-fixed'))){
                fixedHeaderCheck.click();
                alert("Fixed horizontal nav isn't compatible with a static header mode. I will set a fixed mode on the header.");
            };
            if((jQuery('body').hasClass('hover-menu'))&&(!jQuery('body').hasClass('page-sidebar-fixed'))){
                hoverMenuCheck.click();
                alert("Fixed sidebar isn't compatible with a hover menu mode. I will set an accordion mode on the menu.");
            };
            jQuery('body').toggleClass('page-sidebar-fixed');
            if (jQuery('body').hasClass('.page-sidebar-fixed')) {
                /*jQuery('.page-sidebar-inner').slimScroll({
                    destroy:true
                });*/
            };
            //jQuery('.page-sidebar-inner').slimScroll();
            sidebarAndContentHeight();
            onSidebarHover();
        },
        horizontalBar = function() {
            jQuery('.sidebar').toggleClass('horizontal-bar');
            jQuery('.sidebar').toggleClass('page-sidebar');
            jQuery('body').toggleClass('page-horizontal-bar');
            if((jQuery('body').hasClass('page-sidebar-fixed'))&&(!jQuery('body').hasClass('page-header-fixed'))){
                fixedHeaderCheck.click();
                alert("Static header isn't compatible with a fixed horizontal nav mode. I will set a static mode on the horizontal nav.");
            };
            sidebarAndContentHeight();
            onSidebarHover();
        },
        boxedLayout = function() {
            jQuery('.page-content').toggleClass('container');
            jQuery('.search-form').toggleClass('boxed-layout-search');
            jQuery('.search-form .input-group').toggleClass('container');
            sidebarAndContentHeight();
            onSidebarHover();
        },
        compactMenu = function() {
            jQuery('body').toggleClass('compact-menu');
            sidebarAndContentHeight();
            onSidebarHover();
        },
        hoverMenu = function() {
            if((!jQuery('body').hasClass('hover-menu'))&&(jQuery('body').hasClass('page-sidebar-fixed'))){
                fixedSidebarCheck.click();
                alert("Fixed sidebar isn't compatible with a hover menu mode. I will set a static mode on the sidebar.");
            onSidebarHover();
            };
            jQuery('body').toggleClass('hover-menu');
            sidebarAndContentHeight();
            onSidebarHover();
        };
    
    // Logo text on Collapsed Sidebar
    jQuery('.small-sidebar .navbar .logo-box a span').html(jQuery('.navbar .logo-box a span').text() == smTxt ? str : smTxt);
    
    
    if( !jQuery('.theme-settings').length ) {
        jQuery('.sidebar-toggle').click(function() {
            collapseSidebar();
        });
    };
    
    if( jQuery('.theme-settings').length ) {
    fixedHeaderCheck.onchange = function() {
        fixedHeader();
    };
    
    fixedSidebarCheck.onchange = function() {
        fixedSidebar();
    };
    
    horizontalBarCheck.onchange = function() {
        horizontalBar();
    };
    
    toggleSidebarCheck.onchange = function() {
        collapseSidebar();
    };
        
    compactMenuCheck.onchange = function() {
        compactMenu();
    };
        
    hoverMenuCheck.onchange = function() {
        hoverMenu();
    };
        
    boxedLayoutCheck.onchange = function() {
        boxedLayout();
    };
    
    
    // Sidebar Toggle
    jQuery('.sidebar-toggle').click(function() {
        toggleSidebarCheck.click();
    });
    
    // Reset options
    jQuery('.reset-options').click(function() {
        defaultOptions();
    });
    
    // Fixed Sidebar Bug
    if(!(jQuery('body').hasClass('page-sidebar-fixed'))&&(fixedSidebarCheck.checked == 1)){
        jQuery('body').addClass('page-sidebar-fixed');
    }
    
    if((jQuery('body').hasClass('page-sidebar-fixed'))&&(fixedSidebarCheck.checked == 0)){
        jQuery('.fixed-sidebar-check').prop('checked', true);
    }
    
    // Fixed Header Bug
    if(!(jQuery('body').hasClass('page-header-fixed'))&&(fixedHeaderCheck.checked == 1)){
        jQuery('body').addClass('page-header-fixed');
    }
    
    if((jQuery('body').hasClass('page-header-fixed'))&&(fixedHeaderCheck.checked == 0)){
        jQuery('.fixed-header-check').prop('checked', true);
    }
    
    // horizontal bar Bug
    if(!(jQuery('body').hasClass('page-horizontal-bar'))&&(horizontalBarCheck.checked == 1)){
        jQuery('body').addClass('page-horizontal-bar');
        jQuery('.sidebar').addClass('horizontal-bar');
        jQuery('.sidebar').removeClass('page-sidebar');
    }
    
    if((jQuery('body').hasClass('page-horizontal-bar'))&&(horizontalBarCheck.checked == 0)){
        jQuery('.horizontal-bar-check').prop('checked', true);
    }
    
    // Toggle Sidebar Bug
    if(!(jQuery('body').hasClass('small-sidebar'))&&(toggleSidebarCheck.checked == 1)){
        jQuery('body').addClass('small-sidebar');
    }
    
    if((jQuery('body').hasClass('small-sidebar'))&&(toggleSidebarCheck.checked == 0)){
        jQuery('.horizontal-bar-check').prop('checked', true);
    }
    
    // Boxed Layout Bug
    if(!(jQuery('.page-content').hasClass('container'))&&(boxedLayoutCheck.checked == 1)){
        jQuery('.toggle-sidebar-check').addClass('container');
    }
    
    if((jQuery('.page-content').hasClass('container'))&&(boxedLayoutCheck.checked == 0)){
        jQuery('.boxed-layout-check').prop('checked', true);
    }
        
    // Boxed Layout Bug
    if(!(jQuery('.page-content').hasClass('container'))&&(boxedLayoutCheck.checked == 1)){
        jQuery('.toggle-sidebar-check').addClass('container');
    }
    
    if((jQuery('.page-content').hasClass('container'))&&(boxedLayoutCheck.checked == 0)){
        jQuery('.boxed-layout-check').prop('checked', true);
    }
        
    // Boxed Layout Bug
    if(!(jQuery('.page-content').hasClass('container'))&&(boxedLayoutCheck.checked == 1)){
        jQuery('.toggle-sidebar-check').addClass('container');
    }
    
    if((jQuery('.page-content').hasClass('container'))&&(boxedLayoutCheck.checked == 0)){
        jQuery('.boxed-layout-check').prop('checked', true);
    }
    }
    
    // Chat Sidebar
    if(jQuery('.chat').length) {
        var menuRight = document.getElementById( 'cbp-spmenu-s1' ),
        showRight = document.getElementById( 'showRight' ),
        closeRight = document.getElementById( 'closeRight' ),
        menuRight2 = document.getElementById( 'cbp-spmenu-s2' ),
        closeRight2 = document.getElementById( 'closeRight2' ),
        body = document.body;
    
    showRight.onclick = function() {
        classie.toggle( menuRight, 'cbp-spmenu-open' );
    };
    
    closeRight.onclick = function() {
        classie.toggle( menuRight, 'cbp-spmenu-open' );
    };
    
    closeRight2.onclick = function() {
        classie.toggle( menuRight2, 'cbp-spmenu-open' );
    };
    
    jQuery('.showRight2').click(function() {
        classie.toggle( menuRight2, 'cbp-spmenu-open' );
    });
    
    jQuery(".chat-write form input").keypress(function (e) {
        if ((e.which == 13)&&(!jQuery(this).val().length == 0)) {
            jQuery('<div class="chat-item chat-item-right"><div class="chat-message">' + jQuery(this).val() + '</div></div>').insertAfter(".chat .chat-item:last-child");
            jQuery(this).val('');
        } else if(e.which == 13) {
            return;
        }
        /*jQuery('.chat').slimscroll({
            allowPageScroll: true
        });*/
    });
        }
});