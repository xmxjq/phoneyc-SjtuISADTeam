
                        
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-992684-1']);
  _gaq.push(['_setDomainName', 'google.com']);
  _gaq.push(['_addIgnoredRef', '.google.com']);
  _gaq.push(['_setCookiePath', '/accounts/']);
  _gaq.push(['_trackPageview', '/mail/gaia/homepage']);
  _gaq.push(['_cookiePathCopy', '/mail/help/']);
  (function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(ga);
  })();
;;<!--

function gaia_onLoginSubmit() {
  
  if (window.gaiacb_onLoginSubmit) {
    return gaiacb_onLoginSubmit();
  } else {
    return true;
  }
}

-->;;<!--
var gaia_loginForm;
if (document.getElementById) {
  gaia_loginForm = document.getElementById("gaia_loginform");
} else if (window.gaia_loginform) {
  gaia_loginForm = window.gaia_loginform;
}

var gaia_emailHasKeypress = false;
if (gaia_loginForm && gaia_loginForm.Email) {
  gaia_loginForm.Email.onkeypress = function() {
    gaia_emailHasKeypress = true;
  }
}

function gaia_setFocus() {
  if (gaia_loginForm) {
    if (gaia_loginForm.Email && !gaia_loginForm.Email.value) {
      gaia_loginForm.Email.focus();
    } else if (gaia_loginForm.Passwd && !gaia_emailHasKeypress) {
      gaia_loginForm.Passwd.focus();
    }
    
  }
}

gaia_setFocus();
-->;;
var BrowserSupport_={IsBrowserSupported:function(){var agt=navigator.userAgent.toLowerCase();var is_op=agt.indexOf("opera")!=-1;var is_ie=agt.indexOf("msie")!=-1&&document.all&&!is_op;var is_ie5=agt.indexOf("msie 5")!=-1&&document.all&&!is_op;var is_mac=agt.indexOf("mac")!=-1;var is_gk=agt.indexOf("gecko")!=-1;var is_sf=agt.indexOf("safari")!=-1;if(is_ie&&!is_op&&!is_mac){if(agt.indexOf("palmsource")!=
-1||agt.indexOf("regking")!=-1||agt.indexOf("windows ce")!=-1||agt.indexOf("j2me")!=-1||agt.indexOf("avantgo")!=-1||agt.indexOf(" stb")!=-1)return false;var v=BrowserSupport_.GetFollowingFloat(agt,"msie ");if(v!=null)return v>=5.5}if(is_gk&&!is_sf){var v=BrowserSupport_.GetFollowingFloat(agt,"rv:");if(v!=null)return v>=1.4;else{v=BrowserSupport_.GetFollowingFloat(agt,"galeon/");if(v!=null)return v>=
1.3}}if(is_sf){if(agt.indexOf("rv:3.14.15.92.65")!=-1)return false;var v=BrowserSupport_.GetFollowingFloat(agt,"applewebkit/");if(v!=null)return v>=312}if(is_op){if(agt.indexOf("sony/com1")!=-1)return false;var v=BrowserSupport_.GetFollowingFloat(agt,"opera ");if(v==null)v=BrowserSupport_.GetFollowingFloat(agt,"opera/");if(v!=null)return v>=8}if(agt.indexOf("pda; sony/com2")!=-1)return true;return false},
GetFollowingFloat:function(str,pfx){var i=str.indexOf(pfx);if(i!=-1){var v=parseFloat(str.substring(i+pfx.length));if(!isNaN(v))return v}return null},tz_path:";path=/"};if(window.location.href.toLowerCase().indexOf("google.com")>0)BrowserSupport_.tz_path+=";domain=.google.com";document.cookie="TZ="+(new Date).getTimezoneOffset()+BrowserSupport_.tz_path;var is_browser_supported=BrowserSupport_.IsBrowserSupported()
  ;;
<!--
FixForm();
// -->
;;
