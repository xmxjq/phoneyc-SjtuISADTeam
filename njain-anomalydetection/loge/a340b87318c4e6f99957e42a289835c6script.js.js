
                        
        var userRTL = false;
      ;;
var DOM = (document.getElementById);
if (DOM) var Detect = new BrowserDetector();


/**
 * Author: Chris Wetherell
 * BrowserDetector (object)
 *
 * A class for detecting version 5 browsers by the Javascript objects 
 * they support and not their user agent strings (which can be 
 * spoofed).
 *
 * Warning: Though slow to develop, browsers may begin to add 
 * DOM support in later versions which might require changes to this 
 * file.
 *
 * Warning: No one lives forever.  Presumably.
 *
 * Typical usage:
 * Detect = new BrowserDetector();
 * if (Detect.IE()) //IE-only code...
 */
function BrowserDetector()
{

  //IE 4+
  this.IE = function()
  {
    try {
      return this.Run(document.all && !document.contains)!=false;
    } catch(e) {
      /* IE 5.01 doesn't support the 'contains' object and 
         fails the first test */
      if (document.all) return true;
      return false;
    }
  }
  
  //IE 5.5+
  this.IE_5_5_newer = function()
  {
    try { 
      return this.Run(this.IE() && Array.prototype.pop && !this.OPERA())!=false;
    } catch(e) {return false;}
  }
  
  //IE 5, Macintosh
  this.IE_5_Mac = function()
  {
      try {
        return (true == undefined);
      } catch(e) {
        return (
          document.all
          && document.getElementById 
          && !document.mimeType
          && !this.OPERA()
        )!=false;
      }
  }

  //Opera 7+
  this.OPERA = function()
  {
    try { 
      return this.Run(window.opera)!=false;
    } catch(e) {return false;}
  }

  //Gecko, actually Mozilla 1.2+
  this.MOZILLA = function()
  {
    try { 
      return this.Run(
          document.implementation
          && document.implementation.createDocument
          && !document.contains
          && !this.OPERA()
          )!=false;
    } catch(e) {return false;}
  }

  //Safari
  this.SAFARI = function()
  {
    try {
      return this.Run(
          document.implementation
          && document.implementation.createDocument
          && document.contains
          )!=false;
      } catch(e) {return false;}
  }

  //Any browser which supports the W3C DOM
  this.DOM = function()
  {
    return (document.getElementById);
  }

  this.Run = function(test)
  {
    if (test==undefined) {
      return false;
    } else {
      return test;
    }
  }

  // This uses useragent for finer detection. If people spoof it, it's their
  // own fault when things break
  this.geckoVersion = function() {
    var matches = navigator.userAgent.match(/Gecko\/(\d*)/);
    if (matches && matches.length > 1) {
      return matches[1];
    }
    
    return null;
  }
}

;;// Copyright 2004-2006 Google Inc.
// All Rights Reserved.
//
// msamuel@google.com


// Provides functions for sending messages back to the server

/** a serial number assigned to messages used to correlate log messages that are
  * written when the message is sent with messages generated when a response is
  * received.
  * @private
  */
var goo_msg_id_counter = 0;

if ('undefined' == typeof log) {
  log = function () { }
}

/** Helper function to get the status of a request object */
function Goo_GetStatus(req) {
  var status = -1;
  try {
    status = req.status;
  } catch (ex) {
    // firefox may throw an exception when you access request values
  }
  return status;
}

/** Helper function to get the status text of a request object */
function Goo_GetStatusText(req) {
  var status = null;
  try {
    status = req.statusText;
  } catch (ex) {
    // firefox may throw an exception when you access request values
  }
  return status;
}

/** callback called when a response is received.
  * @private
  */
function Goo_HandleResponse(req, msg_id, sendTime, handler) {
  if (req.readyState == XML_READY_STATE_COMPLETED) {
    var process = true;
    if (handler) {
      try {
        // compare to false so that functions without a return value will not
        // skip processing.  The result of a non-returning function is
        // undefined.
        process = !(false === (handler)(req));
      } catch (e) {
        log('Message (' + msg_id + ') handling failed: ' + e);
        throw e;
      }
    }

    var status = Goo_GetStatus(req);

    if (200 === status) {  // 200 is HTTP response OK
      log('Message (' + msg_id + ') received after ' +
          (new Date().getTime() - sendTime) + ' ms');
      try {
        var start = new Date().getTime();
        if (process && req.responseText.length) {
          eval(req.responseText);  // eval result unused
        }
        log('Message (' + msg_id + ') processing took ' +
            (new Date().getTime() - start) + ' ms');
      } catch (e) {
        log('Message (' + msg_id + ') processing failed: ' + e);
        alert(e + '\n' + e.stack + '\n\n' + req.responseText);
        throw e;
      }
    } else if (204 == status) {  // 204 is No Content
      log('Message (' + msg_id + ') received after ' +
          (new Date().getTime() - sendTime) + ' ms');
    } else {  // handle error codes and redirects
      log('Message (' + msg_id + ') failed with response ' +
          status + ' ' + Goo_GetStatusText(req) + ' after ' +
          (new Date().getTime() - sendTime) + ' ms.');
    }
  }
}

/** sends a message to a service.  The result should be javascript which is
  * evaluated in the context of this document.
  *
  * @param service the url to hit.
  * @param params cgi params as an array of strings where even elements are
  *   keys and odd values are elements.
  * @param opt_data the request content or undefined.
  * @param opt_handler undefined, or an callback that should be called with the
  *   response object as it's single argument.  If the handler returns false
  *   then the body content will *not* be evaluated as javascript.
  */
function Goo_SendMessage(service, params, opt_data, opt_handler) {
  var query = '';
  if (params) {
    var delim = '';
    for (var i = 0; i < params.length;) {
      var name = params[i++],
         value = params[i++];
      query += delim + encodeURIComponent(name);
      delim = '&';
      if (null !== value && undefined !== value) {
        query += '=' + encodeURIComponent(value.toString());
      }
    }
  }
  // allocate an id used to correlate log messages
  var msg_id = ++goo_msg_id_counter;

  var transaction = XH_XmlHttpCreate();
  if (!transaction) return false;
  
  var transactionStart = new Date().getTime();
  var handlerClosure = function () {
    Goo_HandleResponse(transaction, msg_id, transactionStart, opt_handler);
  };
  var sep = (service.indexOf('?') >= 0) ? '&' : '?';
  var url = query.length ? service + sep + query : service;

  var method = opt_data !== undefined ? 'POST' : 'GET';
  var logmsg = url;
  for (var pos = logmsg.length + 1;
       (pos = logmsg.lastIndexOf('&', pos - 1)) >= 0;) {
    logmsg = logmsg.substring(0, pos) + '&amp;' + logmsg.substring(pos + 1);
  }
  log('Message (' + msg_id + ') sent: ' + method + ' <tt>' + logmsg + '</tt>.');

  if (opt_data !== undefined) {
    XH_XmlHttpPOST(transaction, url, opt_data.toString(), handlerClosure);
  } else {
    XH_XmlHttpGET(transaction, url, handlerClosure);
  }
}

/** posts a message to a service.  The result should be javascript which is
  * evaluated in the context of this document.
  *
  * @param service the url to hit.
  * @param params cgi params as an array of strings where even elements are
  *   keys and odd values are elements.
  * @param opt_handler undefined, or an callback that should be called with the
  *   response object as it's single argument.  If the handler returns false
  *   then the body content will *not* be evaluated as javascript.
  */
function Goo_PostMessage(service, params, opt_handler) {
  var query = '';
  if (params) {
    var delim = '';
    for (var i = 0; i < params.length;) {
      var name = params[i++],
         value = params[i++];
      query += delim + encodeURIComponent(name);
      delim = '&';
      if (null !== value && undefined !== value) {
        query += '=' + encodeURIComponent(value.toString());
      }
    }
  }
  // allocate an id used to correlate log messages
  var msg_id = ++goo_msg_id_counter;

  var transaction = XH_XmlHttpCreate();
  var transactionStart = new Date().getTime();
  var handlerClosure = function () {
    Goo_HandleResponse(transaction, msg_id, transactionStart, opt_handler);
  };

  var logmsg = service;
  for (var pos = logmsg.length + 1;
       (pos = logmsg.lastIndexOf('&', pos - 1)) >= 0;) {
    logmsg = logmsg.substring(0, pos) + '&amp;' + logmsg.substring(pos + 1);
  }
  log('Message (' + msg_id + ') sent: POST <tt>' + logmsg + '</tt>.');

  // XH_XmlHttpPost automatically sets content type to
  // application/x-www-form-urlencoded
  XH_XmlHttpPOST(transaction, service, query, handlerClosure);
}
;;// Copyright 2004-2006 Google Inc.
// All Rights Reserved.
//
// A bunch of XML HTTP recipes used to do RPC from within javascript from
// Gagan Saksena's wiki page
// http://wiki/twiki/bin/view/Main/JavaScriptRecipes

/** Candidate Active X types.
  * @private
  */
var _XH_ACTIVE_X_IDENTS = [
  "MSXML2.XMLHTTP.5.0", "MSXML2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0",
  "MSXML2.XMLHTTP", "MICROSOFT.XMLHTTP.1.0", "MICROSOFT.XMLHTTP.1",
  "MICROSOFT.XMLHTTP" ];
/** The active x identifier used for ie.
 * @private
 */
var _xh_ieProgId = undefined;

// Domain for XmlHTTPRequest.readyState
var XML_READY_STATE_UNINITIALIZED  = 0;
var XML_READY_STATE_LOADING        = 1;
var XML_READY_STATE_LOADED         = 2;
var XML_READY_STATE_INTERACTIVE    = 3;
var XML_READY_STATE_COMPLETED      = 4;

/** initialize the private state used by other functions.
  * @private
  */
function _XH_XmlHttpInit() {
  // Nobody (on the web) is really sure which of the progid's listed is totally
  // necessary. It is known, for instance, that certain installations of IE will
  // not work with only Microsoft.XMLHTTP, as well as with MSXML2.XMLHTTP.
  // Safest course seems to be to do this -- include all known progids for
  // XmlHttp.
  if (typeof XMLHttpRequest == 'undefined' &&
      typeof ActiveXObject != 'undefined') {
    for (var i = 0; i < _XH_ACTIVE_X_IDENTS.length; i++) {
      var candidate = _XH_ACTIVE_X_IDENTS[i];

      try {
        new ActiveXObject(candidate);
        _xh_ieProgId = candidate;
        break;
      } catch (e) {
        // do nothing; try next choice
      }
    }
  }
}

_XH_XmlHttpInit();

/** create and return an xml http request object that can be passed to
  * {@link #XH_XmlHttpGET} or {@link #XH_XmlHttpPOST}.
  */
function XH_XmlHttpCreate() {
  if (_xh_ieProgId !== undefined) {
    return new ActiveXObject(_xh_ieProgId);
  } else if (window.XMLHttpRequest) {
    return new window.XMLHttpRequest();
  } else {
    return null;
  }
}

/** send a get request.
  * @param xmlhttp as from {@link XH_XmlHttpCreate}.
  * @param url the service to contact
  * @param handler function called when the response is received.
  */
function XH_XmlHttpGET(xmlhttp, url, handler) {
  xmlhttp.onreadystatechange = handler;
  xmlhttp.open("GET", url, true);
  _XH_XmlHttpSend(xmlhttp, null);
}

/** send a post request.
  * @param xmlhttp as from {@link XH_XmlHttpCreate}.
  * @param url the service to contact
  * @param data the request content.
  * @param handler function called when the response is received.
  */
function XH_XmlHttpPOST(xmlhttp, url, data, handler) {
  xmlhttp.onreadystatechange = handler;
  xmlhttp.open("POST", url, true);
  xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xmlhttp.setRequestHeader("Content-Length", data.length);
  _XH_XmlHttpSend(xmlhttp, data);
}

/** @private */
function _XH_XmlHttpSend(xmlhttp, data) {
  try {
    xmlhttp.send(data);
  } catch (e) {
    // you may want to log/debug this error
    // one that you should be aware of is e.number == -2146697208,
    // which occurs when the 'Languages...' setting in IE is empty.
    log('XMLHttpSend failed ' + e.toString() + '<br>' + e.stack);
    throw e;
  }
}
;;// Copyright 2005 Google, Inc. All rights reserved.

/**
 * @fileoverview
 *
 * A general solution for creating asynchronous animations by
 * manipulating CSS attributes of DOM nodes. Steps for use:
 * <ol>
 * <li>Create an ANIM_Animation object, specifying duration,
 *     number of steps, and any initial delay.</li>
 * <li>Add animations to it with the <code>add...</code>
 *     methods.</li>
 * <li>Set begin and done handlers (optional)</li>
 * <li>Call <code>start()</code> and forget about it!</li>
 *
 * Compatible with Firefox 1.0, IE5+/Win, Safari 1.3+, Opera 8
 *
 * @author phopkins
 */

/**
 * Class for creating animations. An animation is usually made by
 * interpolating a CSS style attribute between a starting and ending
 * value. This class provides helpers for modifying common attributes,
 * and a hook for a more general animation function.
 *
 * @param time Time, in milliseconds, the animation will take
 * @param steps Number of steps of animation to perform, with a higher
 *        number giving smoother animation
 * @param delay Time, in milliseconds, to wait before starting the animation
 *
 * @constructor
 */

function ANIM_Animation(time, steps, delay) {
  this._time = time;
  this._steps = steps;
  this._delay = delay;

  this._animationFunctions = [];
  this._beginHandler = null;
  this._doneHandler = null;

  this._timer = null;
};


/**
 * Include a color change as part of this animation. Color will be
 * linearly interpolated over the run of the animation.
 *
 * Color arguments are 3-element arrays of integers in the range
 * 0..255, representing values for red, green, and blue, respectively.
 *
 * @param el A DOM element to modify the color of
 * @param attr A string naming a CSS attribute whose value is a color
 * @param start Starting color
 * @param end Ending color
 */
ANIM_Animation.prototype.addColorChange = function(el, attr, start, end) {
  var animationFunction = function(mix) {
    var colorArray = [0, 0, 0];
    
    for (var i = 0; i < 3; ++i) {
      // simple linear interpolation
      colorArray[i] = (1.0 - mix) * start[i] + mix * end[i];
    }
    
    el.style[attr] = ANIM_arrayToColor(colorArray);
  };

  this.addAnimationFunction(animationFunction);
};


/**
 * Include movement as part of this animation. Linearly interpolates a
 * CSS length attribute over the run of the animation.
 *
 * @param el A DOM element to modify a length attribute of
 * @param attr A string naming a CSS attribute whose value is a length
 * @param start Integer for starting length, in pixels
 * @param end Integer for ending length, in pixels
 */
ANIM_Animation.prototype.addMovement = function(el, attr, start, end) {
  var animationFunction = function(mix) {
    el.style[attr] = ANIM_numToPixels((1.0 - mix) * start + mix * end);
  };

  this.addAnimationFunction(animationFunction);
};


/**
 * Include a general animation function in this animation. The
 * provided function will be called with values increasing from 0 to
 * 1.0 during the animation.
 *
 * @param animationFunction A function of 1 argument
 */
ANIM_Animation.prototype.addAnimationFunction = function(animationFunction) {
  this._animationFunctions[this._animationFunctions.length] =
    animationFunction;
};


/**
 * Set a function to be called after the initial delay, right before
 * animation starts. When the handler is called, 'this' will refer to
 * this Animation object.
 *
 * @param beginHandler A function of no arguments
 */
ANIM_Animation.prototype.setBeginHandler = function(beginHandler) {
  this._beginHandler = beginHandler;
};


/**
 * Set a function to be called after animation finishes. When the
 * handler is called, 'this' will refer to this Animation object. If
 * the animation is stopped before it completes, this function will
 * not be called.
 *
 * @param doneHandler A function of no arguments
 */
ANIM_Animation.prototype.setDoneHandler = function(doneHandler) {
  this._doneHandler = doneHandler;
};


/**
 * Helper that calls all registered animation functions with the provided argument.
 *
 * @param mix Float between 0 and 1, inclusive
 */
ANIM_Animation.prototype._callAnimationFunctions = function(mix) {
  for(var i = 0; i < this._animationFunctions.length; ++i) {
    this._animationFunctions[i](mix);
  }
};


/**
 * Start the animation. This method asynchronously waits the delay
 * specified in the constructor, then begins the animation. It calls
 * the beginHandler immediately before animation starts, and calls the
 * endHandler immediately after.
 *
 * @see #setBeginHandler
 * @see #setEndHandler
 * @see #stop
 */
ANIM_Animation.prototype.start = function() {
  var obj = this;

  var nextStep = 0;
  var startTime = 0;

  var animationLoop = function() {
    var currentStep = nextStep;
    ++nextStep;
    
    // where we are in the animation, between 0 and 1
    var currentMix = currentStep / obj._steps;
    var nextMix = nextStep / obj._steps;
    
    obj._callAnimationFunctions(currentMix);
    
    if (nextStep <= obj._steps) {
      // delay is calculated as the difference between the current
      // time and where we should be, as calculated by looking at when
      // we started and how long we should be taking

      var curTime = new Date().getTime();
      var nextTime = startTime + Math.floor(obj._time * nextMix);
      var delay = Math.max(0, nextTime - curTime);

      obj._timer = window.setTimeout(animationLoop, delay);
    } else {
      obj._timer = null;

      if (obj._doneHandler) {
        obj._doneHandler();
      }
    }
  };

  var beginAnimation = function() {
    if (obj._beginHandler) {
      obj._beginHandler();
    }

    startTime = new Date().getTime();
    animationLoop();
  };

  this._timer = window.setTimeout(beginAnimation, this._delay);
};


/**
 * Stops an animation in progress. Note that this will prevent the
 * endHandler from being called.
 */
ANIM_Animation.prototype.stop = function() {
  if (this._timer) {
    window.clearTimeout(this._timer);
  }
};


/**
 * Utility function to convert an array-representation of a color to a
 * string representation suitable for assigning to a style attribute.
 *
 * @param arr A 3-element array of numbers, 0..255, representing the values for
 *        the red, green, and blue channels of the color. Floating point
 *        values are allowed, but will be truncated to an integer in the output.
 * @returns A string representing the RGB color
 */
function ANIM_arrayToColor(arr) {
  return "rgb(" + Math.floor(arr[0]) +
         ", " + Math.floor(arr[1]) +
         ", " + Math.floor(arr[2]) + ")";
};


/**
 * Utility function to convert an integer into a length suitable for
 * assigning to a style attribute.
 *
 * @param num An integer number of pixels
 * @returns A string representing the length in pixels
 */
function ANIM_numToPixels(num) {
  return Math.floor(num) + "px";
};



;;// Copyright 2005 Google, Inc. All rights reserved.

/**
 * @fileoverview
 *
 * Two classes to support animated lists of links to blogs for the
 * Explore Blogs section of the Blogger homepage.
 *
 * Compatible with Firefox 1.0, IE5+/Win, Safari 1.3+, Opera 8
 *
 * @author phopkins
 */


/**
 * Abstract base class for an unordered list of links to
 * blogs. Contains default style and timing values and utilities for
 * accessing list elements and links.
 *
 * @constructor
 */
function BLOG_LinkList() {
  this._listId = "";

  // Colors are RGB
  // Time and delay are in milliseconds
  // Distances are in pixels

  this.BACKGROUND_COLOR = [255, 255, 255];
  this.LINK_COLOR = [0, 0, 255];
  this.OLD_LINK_COLOR = [255, 0, 255];

  this.HIDE_TIME = 300;
  this.HIDE_STEPS = 10;
  this.HIDE_DELAY = 0;
  this.HIDE_DISTANCE = 0;

  this.SHOW_TIME = 300;
  this.SHOW_STEPS = 10;
  this.SHOW_DELAY = 0;
  this.SHOW_DISTANCE = 0;
}

// We can't keep references to the DOM nodes in the object without
// risking a memory leak in IE. LinkList objects may be referenced by
// onclick handlers, so they cannot in turn reference DOM notes.

/**
 * Get the DOM node for this object's list.
 *
 * @return DOMElement
 */
BLOG_LinkList.prototype.getList = function() {
  return document.getElementById(this._listId);
};

/**
 * Get the list items out of this list.
 *
 * @return Array of <li> elements
 */
BLOG_LinkList.prototype.getItems = function() {
  var list = this.getList();
  var retArray = [];

  for (var child = list.firstChild; child; child = child.nextSibling) {
    if (child.nodeType == 1 && child.nodeName == "LI") {
      retArray[retArray.length] = child;
    }
  }

  return retArray;
};

/**
 * Get the primary (first) links out of this list.
 *
 * @return Array of <a> elements
 */
BLOG_LinkList.prototype.getLinks = function() {
  var retArray = [];
  var items = this.getItems();

  for (var i in items) {
    var item = items[i];
    for (var child = item.firstChild; child; child = child.nextSibling) {
      if (child.nodeType == 1 && child.nodeName == "A") {
        retArray[retArray.length] = child;
        break;
      }
    }
  }

  return retArray;
};

/**
 * Tweak the styles of the list to enable later animation.
 *
 * The initial style for the link lists fixes a height that only shows
 * one list item and hides the overflow so the others aren't
 * seen. This specifies that the first list item should be visible,
 * then acivates the "yesscript" class on the list, so that it can
 * change to a style that keeps overflows visible but doesn't display
 * the other elements.
 *
 * @param numItems Number of list items to keep visible
 */
BLOG_LinkList.prototype._fixStyle = function(numItems) {
  var list = this.getList();
  var items = this.getItems();

  for (var i = 0; i < numItems && i < items.length; ++i) {
    items[i].style.display = "block";
  }

  var needsClass = true;
  var classes = list.className.split(" ");

  for (var c in classes) {
    if (c == "yesscript") {
      needsClass = false;
      break;
    }
  }
  
  if (needsClass) {
    list.className += " yesscript";
  }
};




/**
 * Link list with "web clip" style arrow buttons that cycle among the
 * list elements.
 *
 * @param listId String with the id of the list to use
 * @param buttonHolderId String with the id of a container to hold the arrow 
 *   controls
 *
 * @constructor
 */
function BLOG_ClipList(listId, buttonHolderId) {
  this.LEFT_BUTTON_SRC = "";
  this.LEFT_BUTTON_ALT = "";
  this.LEFT_BUTTON_TITLE = "";
  this.LEFT_BUTTON_CLASS = "btn-left";

  this.RIGHT_BUTTON_SRC = "";
  this.RIGHT_BUTTON_ALT = "";
  this.RIGHT_BUTTON_TITLE = "";
  this.RIGHT_BUTTON_CLASS = "btn-right";

  this._currentIndex = 0;
  this._listId = listId;
  this._buttonHolderId = buttonHolderId;
}

BLOG_ClipList.prototype = new BLOG_LinkList();


/**
 * Fixes the style and adds the control buttons. Call once the style
 * constants are all set.
 */
BLOG_ClipList.prototype.init = function() {
  this._fixStyle(1);
  this._initButtons();
};


/**
 * Creates a image and link that will call the cycle method of this
 * object when clicked.
 *
 * @param src A string containing the source of the image
 * @param alt The alternate text for the image
 * @param title The title to give the new link
 * @param offset Argument that will be sent to cycle
 * @return DOM element of the link
 */
BLOG_ClipList.prototype._makeButton =
	function(src, alt, title, className, offset) {
  var img = document.createElement("img");
  img.setAttribute("src", src);
  img.setAttribute("alt", alt);
  img.className = className;

  var link = document.createElement("a");
  link.setAttribute("title", title);
  link.onclick = this.makeCycleClosure(offset);
  link.href = "#";
  link.appendChild(img);
  
  return link;
};


/**
 * Creates control buttons and appends them as children of the button
 * holder element.
 *
 * @see #_makeButton
 */
BLOG_ClipList.prototype._initButtons = function() {
  var holderDiv = document.getElementById(this._buttonHolderId);
  
  var leftBtn = this._makeButton(this.LEFT_BUTTON_SRC,
                                 this.LEFT_BUTTON_ALT,
                                 this.LEFT_BUTTON_TITLE,
                                 this.LEFT_BUTTON_CLASS,
                                 -1);

  var rightBtn = this._makeButton(this.RIGHT_BUTTON_SRC,
                                  this.RIGHT_BUTTON_ALT,
                                  this.RIGHT_BUTTON_TITLE,
                                  this.RIGHT_BUTTON_CLASS,
                                  1);
  
  holderDiv.appendChild(leftBtn);
  holderDiv.appendChild(rightBtn);
};


/**
 * Creates a closure that will call this object's cycle method with
 * the given argument. Suitable for use in an onclick handler. This
 * method is necessary to avoid accidentally capturing a DOM node in
 * the closure, which can lead to a memory leak in IE/Win.
 *
 * @param offset Argument to give to cycle
 * @return Function of no arguments that calls cycle with offset as
 *         its argument.
 *
 * @see #cycle
 */
BLOG_ClipList.prototype.makeCycleClosure = function(offset) {
  var cycleClosure = function() {
    arguments.callee.obj.cycle(offset);
    return false;
  };
  cycleClosure.obj = this;

  return cycleClosure;
};


/**
 * Shows either the next or previous item in the list. Correctly wraps,
 * so that showing the previous item when the first is visible will
 * show the last.
 * 
 * @param offset 1 or -1, indicating whether to show the next or previous
 *        item, respectively.
 */
BLOG_ClipList.prototype.cycle = function(offset) {
  var items = this.getItems();
  var links = this.getLinks();
  
  var currentItem = items[this._currentIndex];
  var currentLink = links[this._currentIndex];
  
  // we add items.length here because JavaScript modulo can be negative
  var nextIndex = (this._currentIndex + offset + items.length) % items.length;
  var nextItem = items[nextIndex];
  var nextLink = links[nextIndex];
  
  // Force current element to the top of the list. Otherwise, if this
  // element is lower on the list than what's being revealed, the
  // elements won't overlap correctly.
  currentItem.style.top = ANIM_numToPixels(0);
  currentItem.style.position = "absolute";
  currentItem.style.zIndex = 1;

  this._animateHide(currentItem, currentLink, offset);
  this._animateShow(nextItem, nextLink, offset);

  this._currentIndex = nextIndex;
};


/**
 * Animates hiding the specified item and link (which must be a child
 * of the item). Moves the item to the side and fades the link color
 * into the background.
 *
 * @param item DOM element for a list item to hide
 * @param link DOM element for item's link
 * @param offset 1 or -1, indicating the direction to move the element in
 */
BLOG_ClipList.prototype._animateHide = function(item, link, offset) {
  var animation = new ANIM_Animation(this.HIDE_TIME, this.HIDE_STEPS,
                                     this.HIDE_DELAY);
  
  animation.addColorChange(link, "color",
                           this.LINK_COLOR, this.BACKGROUND_COLOR);
  
  animation.addMovement(item, "left",
                        0, this.HIDE_DISTANCE * offset);
  
  animation.setDoneHandler(function() {
    item.style.display = "none";
    item.style.position = "relative";
    item.style.top = "";
    item.style.left = "";
  });
  
  animation.start();
};

/**
 * Animates showing the given item and link (which must be a child of
 * the item). Fades in the link from the background.
 *
 * @param item DOM element for a list item to hide
 * @param link DOM element for item's link
 * @param offset 1 or -1, indicating the direction to move the element from
 */
BLOG_ClipList.prototype._animateShow = function(item, link, offset) {
  var animation = new ANIM_Animation(this.SHOW_TIME, this.SHOW_STEPS,
                                     this.SHOW_DELAY);
  
  animation.addColorChange(link, "color",
      this.BACKGROUND_COLOR, this.LINK_COLOR);

  if (this.SHOW_DISTANCE != 0) {
    animation.addMovement(item, "left", -this.SHOW_DISTANCE * offset, 0);
  }
  
  animation.setBeginHandler(function() {
    item.style.zIndex = 0;
    item.style.display = "block";
  });

  animation.setDoneHandler(function() {
    item.style.left = "";
  });

  animation.start();
};




/**
 * Link list that continuously cycles through its elements. After each
 * element is shown it gets moved to the bottom of the list. This
 * class also supports replacing the entire list without disturbing
 * the animation.
 *
 * @param listId String with the id of the list to use
 *
 * @constructor
 */
function BLOG_ScrollList(listId) {
  /**
   * How many list items to keep fully visible (not including the one 
   * that fades in) */
  this.SHOW_COUNT = 1;

  this._listId = listId;
  this._replacementList = null;
  this._discardCount = 0;
}

BLOG_ScrollList.prototype = new BLOG_LinkList();

/**
 * Fixes the style and starts the animation cycling.
 */
BLOG_ScrollList.prototype.init = function() {
  // +1 is because initially the bottom item is shown as well.
  this._fixStyle(this.SHOW_COUNT + 1);
  this._hideCurrent();
};

/**
 * Fades the next link in from the background color, and fades the
 * current link out to OLD_LINK_COLOR. When the animation finishes,
 * calls _hideCurrent.
 *
 * @see #_hideCurrent
 */
BLOG_ScrollList.prototype._showNext = function() {
  // If there is a list waiting to be inserted, do it here, when only
  // SHOW_COUNT elements are visible
  if (this._replacementList) {
    this._replaceList();
  }

  var list = this.getList();
  var items = this.getItems();
  var links = this.getLinks();

  if (items.length > this.SHOW_COUNT) {
    var currentItem = items[0];
    var currentLink = links[0];
    var nextItem = items[this.SHOW_COUNT];
    var nextLink = links[this.SHOW_COUNT];

    var animation = new ANIM_Animation(this.SHOW_TIME, this.SHOW_STEPS,
                                       this.SHOW_DELAY);

    animation.addColorChange(currentLink, "color",
                             this.LINK_COLOR, this.OLD_LINK_COLOR);

    animation.addColorChange(nextLink, "color",
                             this.BACKGROUND_COLOR, this.LINK_COLOR);

    animation.setBeginHandler(function() {
      nextItem.style.display = "block";
    });

    var done = function() {
      arguments.callee.obj._hideCurrent();
    };
    done.obj = this;
    animation.setDoneHandler(done);
    
    animation.start();
  }
};

/**
 * Fades the current link to the background color while it moves the
 * next link up on the page. Once this animation completes, calls
 * _showNext to show the next link.
 *
 * @see #_showNext
 */
BLOG_ScrollList.prototype._hideCurrent = function() {
  var list = this.getList();
  var items = this.getItems();
  var links = this.getLinks();
  
  if (items.length > this.SHOW_COUNT) {
    var currentItem = items[0];
    var currentLink = links[0];
    var nextItem = items[1];
    var nextLink = links[1];

    var animation = new ANIM_Animation(this.HIDE_TIME, this.HIDE_STEPS,
                                       this.HIDE_DELAY);
    
    animation.addColorChange(currentLink, "color",
                             this.OLD_LINK_COLOR, this.BACKGROUND_COLOR);

    if (this.HIDE_DISTANCE != 0 || this.SHOW_DISTANCE != 0) {
      animation.addMovement(currentItem, "top", 0,
          this.HIDE_DISTANCE + this.SHOW_DISTANCE);
      animation.addMovement(list, "top", 0, -this.SHOW_DISTANCE);
    }

    var done = function() {
      var obj = arguments.callee.obj;
      
      currentItem.style.top = "";
      currentItem.style.display = "none";
      list.style.top = "";
      
      // _keepTopItem is false if the list has just been replaced, in
      // which case we want to discard this old element rather than
      // move it to the bottom
      if (obj._discardCount > 0) {
        obj.getList().removeChild(currentItem);
        obj._discardCount--;
      } else {
        obj.getList().appendChild(currentItem);
      }
      
      obj._showNext();
    };
    done.obj = this;
    animation.setDoneHandler(done);

    animation.start();
  }
};


/**
 * Replaces the current list of links with a new list, at the earliest
 * opportunity.
 *
 * @param newList An HTML element that contains <li> nodes
 */
BLOG_ScrollList.prototype.updateList = function(newList) {
  this._replacementList = newList;
};


/**
 * Does the work of replacing the old list with a new one. Called just
 * before the next element is shown so as not to interfere with the
 * animation.
 */
BLOG_ScrollList.prototype._replaceList = function() {
  var list = this.getList();
  var items = list.getElementsByTagName("li");
  var newItems = this._replacementList.getElementsByTagName("li");

  // SHOW_COUNT items are currently visible, so keep them for now
  while(items.length > this.SHOW_COUNT) {
    list.removeChild(items[this.SHOW_COUNT]);
  }
  
  while(newItems.length > 0) {
    list.appendChild(newItems[0]);
  }

  // Mark the top SHOW_COUNT items as old, so they'll be thrown out
  // instead of cycled to the bottom of the list
  this._discardCount = this.SHOW_COUNT;
  this._replacementList = null;
};
;;// Copyright 2007 Google, Inc. All rights reserved.

/**
 * JS for Explore Blogs animation on /start
 *
 * Requires detect.js, xmlhttp.js, message.js, animation_common.js,
 * animation_explore.js
 */

/**
 * Given a linkList object, sets the background and link colors to match the
 * /start page.
 */
function BLOG_setupStartListStyle(linkList) {
  linkList.BACKGROUND_COLOR = [245, 237, 227]; // #F5EDE3
  linkList.LINK_COLOR = [51, 102, 204]; // #3366CC
  linkList.OLD_LINK_COLOR = [180, 180, 240]; // #B4B4F0
}

/**
 * Creates and initializes a ClipList for the Blogs of Note display
 */
function BLOG_setupBlogsOfNote() {
  window.ofNote = new BLOG_ClipList("of-note", "of-note-buttons", "of-note-more");

  BLOG_setupStartListStyle(ofNote);

  ofNote.HIDE_TIME = 250;
  ofNote.HIDE_STEPS = 10;
  ofNote.HIDE_DISTANCE = 40;

  ofNote.SHOW_TIME = 150;
  ofNote.SHOW_STEPS = 10;
  ofNote.SHOW_DELAY = 150;

  ofNote.LEFT_BUTTON_SRC = "/img/blank.gif";
  ofNote.LEFT_BUTTON_ALT = "";

  ofNote.RIGHT_BUTTON_SRC = "/img/blank.gif";
  ofNote.RIGHT_BUTTON_ALT = "";

  ofNote.init();
}

/**
 * Creates and initializes a new ScrollList for the recently updated posts.
 * Also starts the timer to load new blogs every minute.
 */
function BLOG_setupRecentlyUpdated() {
  window.updated = new BLOG_ScrollList("recently-updated");

  BLOG_setupStartListStyle(updated);

  updated.SHOW_TIME = 300;
  updated.SHOW_STEPS = 5;
  updated.SHOW_DELAY = 0;
  updated.SHOW_DISTANCE = 0;
  updated.SHOW_COUNT = 0;

  updated.HIDE_TIME = 300;
  updated.HIDE_STEPS = 5;
  // IE can't handle the vertical animation in RTL
  updated.HIDE_DISTANCE = (userRTL && Detect.IE()) ? 0 : 12;
  updated.HIDE_DELAY = 1200;

  updated.init();

  // start the timer to fire every minute, and also send off an immediate
  // request to prime the list beyond what was included statically
  window.setInterval(BLOG_fetchRecentlyUpdated, 60 * 1000);
  window.setTimeout(function() {
    BLOG_fetchRecentlyUpdated();
  }, 0);
}

/**
 * Handler for XmlHttpRequest that loads the output of /recent-list.g into the
 * header and list on the page.
 */
function BLOG_loadRecentlyUpdated(req) {
  if (req.status != 200) return false;

  var listHolder = document.getElementById("recently-updated-holder");
  var newListHolder = document.createElement("div");

  newListHolder.innerHTML = req.responseText;

  // update the list instead of replacing to keep the animation smooth
  window.updated.updateList(newListHolder);

  // replace the header in order to update the time
  var headerElement = listHolder.getElementsByTagName("h3")[0];
  var newHeaderElement = newListHolder.getElementsByTagName("h3")[0];
  headerElement.parentNode.replaceChild(newHeaderElement,
    headerElement);

  // don't eval JS
  return false;
}

/**
 * Make an XmlHttpRequest to get and load the latest recently updated blogs.
 */
function BLOG_fetchRecentlyUpdated() {
  Goo_SendMessage("recent-list.g",
      [ "timezoneOffset", "" + new Date().getTimezoneOffset(),
        "zx", "" + Math.random() ],
      undefined,
      BLOG_loadRecentlyUpdated);
}

;;