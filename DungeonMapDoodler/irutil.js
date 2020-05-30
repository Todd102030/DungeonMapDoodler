"use strict";
var ir = {
	checkmarkStr : "&#x2713;",
	addEvent : function(objOrId, evType, fn) {
		var obj = objOrId;
		if (typeof (obj) == "string") {
			obj = ir.get(objOrId);
		}
		if (obj.addEventListener) {
			obj.addEventListener(evType, fn, false);
		} else if (obj.attachEvent) {
			obj.attachEvent("on" + evType, fn);
		}
	},
	addOption : function(selectObj, value, text) {
		var opt = document.createElement("OPTION");
		opt.value = value;
		opt.text = text;
		selectObj.options.add(opt);
		return opt;
	},
	alertLog : function(messageForUser, exc, extraLogInfo) {
		ir.log(messageForUser + " : " + exc + " : " + extraLogInfo);
		alert(messageForUser);
	},
	bool : function(id,suppressLogIfNotFound) {
		return ir.isTrue(ir.v(id,suppressLogIfNotFound));
	},
	checkmark : function(boolExpr) {
		return ir.isTrue(boolExpr) ? ir.checkmarkStr : "";
	},
	clearSelect : function(sbIdOrObj, leaveAtTop) {
		var sb = typeof (sbIdOrObj) == "string" ? ir.get(sbIdOrObj) : sbIdOrObj;
		if (sb.options) {
			try {
				sb.options.length = leaveAtTop;
			} catch (nevermindDoItTheSlowWay) {
			}
			for (var i = sb.options.length - 1; i >= leaveAtTop; i--) {
				sb.options[i] = null;
			}
		}
	},
	clearTable : function(tbl, leaveAtTop, leaveAtBottom) {
		if (typeof (tbl) == "string") {
			tbl = ir.get(tbl);
		}
		leaveAtTop = leaveAtTop || 0;
		leaveAtBottom = leaveAtBottom || 0;
		while (tbl.rows.length > leaveAtTop + leaveAtBottom) {
			tbl.deleteRow(leaveAtTop);
		}
	},
	coalesce : function(/* varargs */) {
		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (arg == null) {
				continue;
			}
			if (isNaN(arg) && arg > "") {
				return arg;
			} else if (Number(arg) != 0) {
				return arg;
			}
		}
		return arguments[arguments.length - 1];
	},
	copy : function(obj) {
		if (null == obj || "object" != typeof obj) {
			return obj;
		}
		if (obj instanceof Date) {
			var result = new Date();
			result.setTime(obj.getTime());
			return result;
		}
		if (obj instanceof Array) {
			var result = [];
			for (var i = 0, len = obj.length; i < len; i++) {
				result[i] = ir.copy(obj[i]);
			}
			return result;
		}
		var result = {};
		for ( var property in obj) {
			if (obj.hasOwnProperty(property)) {
				result[property] = ir.copy(obj[property]);
			}
		}
		return result;
	},
	copyProperties : function(fromObj, toObj) {
		for ( var property in fromObj) {
			var value = fromObj[property];
	    if (fromObj.hasOwnProperty(property)) {
	      toObj[property] = value;
	    }
		}
	},
	digits : function(src) {
		if (src == null || src == "") {
			return "";
		}
		var result = "";
		for (var i = 0, z = src.length; i < z; i++) {
			var c = src.charAt(i);
			if (c >= '0' && c <= '9') {
				result += c;
			}
		}
		return result;
	},
	enable : function(id, boolOrNull) {
		var obj = ir.get(id);
		if (obj) {
			obj.disabled = !(boolOrNull == null ? true : boolOrNull);
		} else {
			ir.log("ir.enable() failed to find " + id);
		}
	},
	enhanceArray : function(a, wrapperFunc) {
		for (var i=0,z=a.length;i<z;i++) {
			a[i] = wrapperFunc(a[i]);
		}
	},
	evalNum : function(expression) {
		try {
			var result = new Function("return " + expression)();
			return isNaN(result) ? 0 : result;
		} catch (e) {
			ir.log("evalNum(" + expression + ") : " + e);
			return 0;
		}
	},
	evalObj : function(expression) {
		if (typeof (expression) == "object") {
			return expression;
		}
		expression = ir.trim(expression);// coerce to string & trim
		if (expression == "") {
			return {};
		}
		expression = "return (" + expression + ");";
		try {
			return new Function(expression)();
		} catch (e) {
			ir.log("ir.evalObj:" + e + " <- " + expression);
			return 0;
		}
	},
	exists : function(id) {
		var obj = document.getElementById(id);
		if (obj == null) {// could it be a radio button group?
			var objArr = document.getElementsByName(id);
			if (objArr && objArr.length > 0) {
				obj = objArr;
			}
		}
		return obj != null;
	},
	/**
	 * invokes passed function with parameters (element) for each element in
	 * array, returns array of elements for which function evaluates true
	 */
	filter : function(arr, fn) {
	  if (arr.filter) {
	    return arr.filter(fn);
	  }
		var result = [];
		for (var i = 0, z = arr.length; i < z; i++) {
			var ele = arr[i];
			if (fn(ele,i,arr)) {
				result.push(ele);
			}
		}
		return result;
	},
	/**
	 * invokes passed function with parameters (element) for each element in
	 * array, returns index of first element for which function evaluates true,
	 * else -1
	 * 
	 * @param array
	 * @param function(element)
	 *            {return boolean whether element is included;} eg. var
	 *            firstQualifyingIndex =
	 *            ir.find([{a:1,b:2},{a:3,b:1}],function(r){return r.a>r.b;});
	 */
	find : function(arr, fn) {
		for (var i = 0, z = arr.length; i < z; i++) {
		  var r = arr[i];
			if (fn(r)) {
				return i;
			}
		}
		return -1;
	},
  /**
   * invokes passed function with parameters (element) for each element in
   * array, returns first element for which function evaluates true,
   * else null
   * 
   * @param array
   * @param function(element)
   *            {return boolean whether element is included;} eg. var
   *            firstQualifyingIndex =
   *            ir.find([{a:1,b:2},{a:3,b:1}],function(r){return r.a>r.b;});
   */
  findElement : function(arr, fn) {
    var i = ir.find(arr,fn);
    return i == -1 ? null : arr[i];
  },
  focus : function(id) {// positions focus in element, moves caret to end
    var element = document.getElementById(id);
    if (element) {
      try {
        element.focus();
      } catch (exc) {
        window.status = "ir.focus failed to focus - " + exc;
      }
      if (element.value) {
        var pos = element.value.length;
        try {
          if (element.setSelectionRange) {
            element.setSelectionRange(pos, pos);
          } else {
            var range = element.createTextRange();
            range.move("character", pos);
            range.collapse(false);
            range.select();
          }
        } catch (exc) {
          window.status = "ir.focus failed to set caret position - " + exc;
        }
      }
    }
  },
  focusOnFirstControl : function() {
    if (null != document.forms[0]) {
      for (var i = 0; i < document.forms[0].elements.length; i++) {
        var o = document.forms[0].elements[i];
        try {
          if (-1 < "hiddenbuttonsubmit".indexOf(o.type)) {
            continue;
          }
          if (o.style.display == "none" || o.style.visibility == "hidden") {
            continue;
          }
          o.focus();
          window.status = "";
          return;
        } catch (e) {
          window.status = "focusOnFirstControl:" + e;
        }
      }
    }
  },
	/**
	 * ir.forEach invokes passed function with parameters (element,index,array) for each element
	 * in array
	 */
	forEach : function(arr, fn) {
	  if (arr.forEach){
	    return arr.forEach(fn);
	  }
		for (var i = 0, z = arr.length; i < z; i++) {
			fn(arr[i], i,arr);
		}
	},
	format : function(k /* ,args */) {// mimics java.text.MessageFormat.format
		try {
			var v = k;
			if (arguments != null) {
				if (arguments.length > 1) {
					for (var i = 1; i < arguments.length; i++) {
						var token = "{" + (i - 1) + "}";
						while (v.indexOf(token) > -1) {
							v = v.replace(token, arguments[i] + "");
						}
					}
				}
			}
			return v;
		} catch (e) {
			return k;
		}
	},
	get : function(idOrObj) {
		var o = idOrObj;
		if (typeof (o) == "string") {
			o = document.getElementById(idOrObj);
		}
		if (o == null) {
			var bn = document.getElementsByName(idOrObj);
			if (bn && bn.length > 0) {
				o = bn[0];
			}
		}
		return o;
	},
	/**
	 * returns the bounding rectangle for the passed element as:<br>
	 * {top:?,left:?,bottom:?,right:?,width:?,height:?}
	 */
	getBounds : function(elemOrId) {
		var elem = elemOrId;
		if (typeof (elem) == "string") {
			elem = document.getElementById(elemOrId);
			if (elem == null) {
				throw "ir.getBounds - element '" + elemOrId + "' not found on document.";
			}
		}
		// (1)
		var box = elem.getBoundingClientRect();
		var body = document.body;
		var docElem = document.documentElement;
		// (2)
		var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
		var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
		// (3)
		var clientTop = docElem.clientTop || body.clientTop || 0;
		var clientLeft = docElem.clientLeft || body.clientLeft || 0;
		// (4)
		var top = Math.round(box.top + scrollTop - clientTop);
		var left = Math.round(box.left + scrollLeft - clientLeft);
		return {
			top : top,
			left : left,
			bottom : top + box.height,
			right : left + box.width,
			width : box.width,
			height : box.height
		};
	},
	getChildren : function(eleOrId) {
		var result = [];
		function innerGet(node) {
			var children = node.childNodes;
			for (var i = 0, z = children.length; i < z; i++) {
				var c = children[i];
				result.push(c);
				if (c.hasChildNodes()) {
					innerGet(c);
				}
			}
		}
		innerGet(ir.get(eleOrId));
		return result;
	},
	/**
	 * returns characters after but not including the last slash, up to question
	 * mark query string marker
	 */
	getFileName : function(url) {
		if (url == null || url == "") {
			return "";
		}
		var qAt = url.lastIndexOf("?");
		if (qAt > -1) {
			url = url.substring(0, qAt);
		}
		var foundAt = url.lastIndexOf("/");
		if (foundAt == -1 || foundAt == url.length - 1) {
			return "";
		}
		return url.substring(foundAt + 1);
	},
	getForPrefix : function(sPfx) {
		var pfxLen = sPfx.length;
		var ret = [];
		var eles = document.forms[0].elements;
		for (var i = 0, len = eles.length; i < len; i++) {
			var ele = eles[i];
			if (ir.left(ele.id, pfxLen) == sPfx) {
				ret.push(ele);
			}
		}
		return ret;
	},
	/** getSet will get a value from a hash and return it.
	 * If the value is not found, it will insert a default and return the default
	 */
	getSet:function(hash,key,defaultValue){
	  var result = hash["" + key];
	  if (result == null) {
	    hash[""+key] = defaultValue;
	    result = defaultValue;
	  }
	  return result; 
	},
	hasUserMedia:function() {
		  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
		            navigator.mozGetUserMedia || navigator.msGetUserMedia);
	},
	hide : function(id) {
		var obj = ir.get(id);
		if (obj) {
			obj.style.display = "none";
		} else if (window.location.href.indexOf("localhost") > -1) {
			ir.log("ir.hide() failed to find " + id);
		}
	},
	/**finds Array.indexOf or with coercion or passed function
	* searchValOrFunc as a function must be: boolean equals(arrayElement)
	 */
	indexOf : function(a, searchValOrFunc) {
		if (a == null || a.length == 0 || searchValOrFunc == null) {
			return -1;
		}
		var searchFunc = searchValOrFunc;	
		if (typeof (searchValOrFunc) != "function") {
			try {
				var found = a.indexOf(searchValOrFunc);
				if (found > -1) {
					return found;
				}
			} catch (oldBrowserOrNeedsCoercionOrTrulyNotFound) {
			}
			searchFunc = function(element){return element==searchValOrFunc;};
		}
		for (var i = 0, len = a.length; i < len; i++) {
			if (searchFunc(a[i])) {
				return i;
			}
		}
		return -1;
	},
	isFalse : function(v) {
		return !ir.isTrue(v);
	},
	isInput : function(element) {
		return -1 < "INPUT|SELECT|TEXTAREA".indexOf(element.tagName);
	},
	isPhone:function(){
	  return /Mobi/.test(navigator.userAgent);
	},
	isTrue : function(v) {
		if (v == null) {
			return false;
		}
		if (isNaN(v)) {
			v = v + "  ";// coerce to string
			return ir.left(v, 1) == "t" || ir.left(v, 1) == "y" || ir.left(v, 2) == "on" || ir.left(v, 7) == "checked";
		}
		return Number(v) != 0;
	},
	/** joins elements while excluding blank and null ones */
	join : function(delim,elements) {
		var res = "";
		var del = "";
		for (var i = 1, len = arguments.length; i < len; i++) {
			if (arguments[i] > "") {
				res += del + arguments[i];
				del = delim || ",";
			}
		}
		return res;
	},
	left : function(s, len) {
		return (s + "").substr(0, Math.min((s + "").length, len));
	},
	leftEllipsis : function(s, len) {
		return (s + "").substr(0, Math.min((s + "").length, len)) 
			+ ((s+"").length > len ? "..." : "");
	},
	log : function(m) {// initStr
		if (window.console && window.console.log) {
			window.console.log(m);
		} else {
			window.status = m;
		}
	},
	lpad : function(sVal, chFill, nLen) {
		sVal += "";// coerce to a string
		var padTimes = Math.max(0, nLen - sVal.length);
		var sNew = "";
		for (var i = 0; i < padTimes; i++) {
			sNew += chFill;
		}
		return sNew + sVal;
	},
	ltrim : function(s) {
		return ("" + s).replace(/^\s+/,"");
	},
	/** returns milliseconds for the number of minutes requested */
	minMs:function(v){
	  return v * 60000;
	},
	n : function(v) {
		if (v == null || v == "") {
			return 0;
		}
		if (typeof (v) == "number") {
			return v;
		}
		v = v + "";
		v = v.replace(/,/g, '');
		if (isNaN(v)) {
			return 0;
		}
		return Number(v);
	},
	/**
	 * format number with commas, with optionalDecimalDigits if requested
	 */
	nc : function(x, decimals, showZero) {
		if (x == null || x == 0 || x == "") {
			return showZero ? "0" : "";
		}
		if (decimals == undefined) {
			decimals = 2;
		}
		var fillStr = "00000000000000000000000000000000000";
		var parts;
		if (decimals >= 0 && decimals < fillStr.length) {
			parts = ir.round(x, decimals).toString().split(".");
		} else {
			parts = x.toString().split(".");
		}
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		parts[1] = parts.length == 1 ? "" : parts[1];
		if (decimals >= 0 && decimals < fillStr.length) {
			parts[1] = (parts[1] + fillStr).substr(0, decimals);
		}
		var result = parts.join(".");
		if (result.charAt(result.length - 1) == '.') {
			result = result.substring(0, result.length - 1);
		}
		return result;
	},
	nz : function(num, returnIfZero, decimals) {
		if (ir.n(num) == 0) {
			return returnIfZero || "";
		}
		if (decimals != undefined) {
			return ir.n(num).toFixed(decimals);
		}
		return num;
	},
	pageName : function() {
		var n = window.location.href;
		var lastSlash = n.lastIndexOf("/");
		if (lastSlash > 0) {
			n = n.substr(lastSlash + 1);
		}
		var qMark = n.indexOf("?");
		if (qMark > 0) {
			n = n.substr(0, qMark);
		}
		return n.toLowerCase();
	},
	parseToHash : function(str, eq, and) {
		var hash = {};
		eq = eq || "=";
		and = and || "&";
		var pairs = str.split(and);
		for (var i = 0, z = pairs.length; i < z; i++) {
			var pair = pairs[i].split(eq);
			hash[pair[0]] = pair.length > 1 ? pair[1] : "";
		}
		return hash;
	},
	q : function(v) {
		return "'" + (v + "").replace(/'/g, "\'") + "'";
	},
	readCheckboxes : function(name) {
		var values = [];
		var checkboxes = document.getElementsByName(name);
		for (var i = 0, z = checkboxes.length; i < z; i++) {
			var cb = checkboxes[i];
			if (cb.checked) {
				values.push(cb.value);
			}
		}
		return values;
	},
  /**
   * ir.reduce invokes passed function with parameters (element,index,resultObject) for each element
   * in array, returns resultObject
   */
  reduce : function(arr, accumulator,initialValue) {
    if (arr.reduce) {
      return arr.reduce(accumulator,initialValue);
    }
    var result = initialValue;
    for (var i = 0, z = arr.length; i < z; i++) {
      result += accumulator(result,arr[i],i,arr);
    }
    return result;
  },
	replace : function(source, search1, replace1, search2, replace2 /* ... */) {
		if (arguments.length < 3 || arguments.length % 2 == 0) {
			alert("replace usage: replace(value,srch1,rep1[,srch2,rep2...])");
			return;
		}
		var result = "";
		source = source || "";// coerce to a string
		if (source != "") {
			for (var i = 1; i < arguments.length; i += 2) {
				var srch = arguments[i] || "";
				if (srch == "") {
					continue;
				}
				var repl = "";
				if (arguments.length > i + 1) {
					repl = arguments[i + 1] + "";
				}
				var start = 0;
				result = "";
				var found = source.indexOf(srch);
				while (found > -1) {
					result += source.substring(start, found) + repl;
					start = found + srch.length;
					found = source.indexOf(srch, start);
				}
				if (start < source.length) {
					result += source.substring(start);
				}
				source = result;
			}
		}
		return result;
	},
	round : function(n, decimals) {
		return parseFloat(Number(n).toFixed(decimals));
	},
	right : function(s, len) {
		s += "";
		return s.length <= len ? s : s.substr(s.length - len);
	},
	rtrim : function(s) {
		return ("" + s).replace(/\s+$/,"");
	},
	set : function(id, val) {
		var element = id;
		if (typeof(val)=="undefined" || (val+"")=="undefined") {
			val = "";
		}
		if (typeof (id) == "string") {
			element = ir.get(id);
		}
		if (element == null) {
			ir.log("cannot set value of element '" + id + "' - not found.");
			return;
		}
		if (element.type == "radio") {
			var a = document.getElementsByName(element.name);
			for (var i = 0; i < a.length; i++) {
				var rb = a[i];
				if (("" + rb.value) == ("" + val)) {
					rb.checked = true;
					return;
				}
			}
		} else if (element.type == "checkbox") {
			element.checked = ir.isTrue(val);
		} else if (element.value != null) {
			if (element.type == "textarea") {
				val = val.replace(/\\n/g, "\r\n");
			} else if (typeof (val) == "date") {
				if (val.getFullYear() < 1970) {
					val = "";
				}
			}
			element.value = "" + val;
		} else {
			element.innerHTML = val;
		}
	},
	setReadOnly : function(id, boolOrNull) {
		var obj = ir.get(id);
		if (obj) {
			var ro = boolOrNull == null ? true : boolOrNull;
			if (ro) {
				obj.setAttribute("readonly", "readonly");
			} else {
				obj.removeAttribute("readonly");
			}
		} else if (window.location.href.indexOf("localhost") > -1) {
			ir.log("ir.setReadOnly() failed to find " + id);
		}
	},
	show : function(id, optionalYesNo) {
		var mode = "";
		if (arguments.length == 2 && !ir.isTrue(arguments[1])) {
			mode = "none";
		}
		var obj = ir.get(id);
		if (obj) {
			obj.style.display = mode;
		} else if (window.location.href.indexOf("localhost") > -1) {
			ir.log("ir.show() failed to find " + id);
		}
	},
  showAll:function(querySelection,optionalYesNo) {
    var all = document.querySelectorAll(querySelection);
    for (var i=0,z=all.length;i<z;i++) {
      ir.show(all[i],optionalYesNo);
    }
  },
  /** ir.split differs from String.split in that it does not includ blank or whitespace elements */
	split : function(src, delim) {
		var res = [];
		var va = src.split(delim || ",");
		for (var i = 0, len = va.length; i < len; i++) {
			if (ir.trim(va[i]) > "") {
				res.push(va[i]);
			}
		}
		return res;
	},
	/**
	 * a naive,oversimplified mustache only suitable in browser:
	 * <ul>
	 * <li>no escaping of anything in the template or values</li>
	 * <li>regular expressions not used</li>
	 * <li>only {{ used not {{{ like mustache for html</li>
	 * <li>no arrays of repeated values</li>
	 * <li>no sub objects like {value:1,subobject:{subvalue:3}}</li>
	 * </ul>
	 * usage:<br>
	 * ir.template("<div id='prefix{{row}}'>{{content}}</div>",{row:71,content:"hello,whirled"});
	 * 
	 * @param 1
	 *            can be a template string or the id of an element or script
	 *            block with a template or the element itself
	 * @param 2
	 *            must be a flat object like {row:71,content:"hello,whirled"}
	 */
	template : function(templateStrOrObjectOrId, valueObject) {
		var a = [];
		var ts = templateStrOrObjectOrId;
		if (ts.innerHTML || ts.value) {
			ts = ir.trim(ts.innerHTML || ts.value);
		} else {
			if (ts.indexOf("{{") == -1) {
				var element = document.getElementById(ts);
				if (element) {
					ts = ir.trim(element.innerHTML || ts.value);
				}
			}
		}
		var start = 0;
		var open = ts.indexOf("{{");
		var close = ts.indexOf("}}", open);
		while (start < ts.length && open > -1 && close > open) {
			if (start < open) {
				a.push(ts.substring(start, open));
			}
			var name = ts.substring(open + 2, close);
			a.push(valueObject[name]);
			start = close + 2;
			open = ts.indexOf("{{", start);
			close = ts.indexOf("}}", open);
		}
		a.push(ts.substring(start));
		return a.join("");
	},
	toArray : function(object, exclusions) {
		var exclusionHash = {};
		if (exclusions > "") {
			exclusionHash = ir.toHash(exclusions.split(','));
		}
		var result = [];
		for ( var attr in object) {
			if (!exclusionHash[attr] && object.hasOwnProperty(attr)) {
				result.push(object[attr]);
			}
		}
		return result;
	},
	toggleBlock : function(anchorId, spanId) {
		var span = ir.get(spanId);
		var anch = ir.get(anchorId);
		if (span.style.display == "none") {
			ir.show(span);
			anch.innerHTML = anch.innerHTML.replace("+", "-");
		} else {
			ir.hide(span);
			anch.innerHTML = anch.innerHTML.replace("-", "+");
		}
	},
	toggleChecks : function(sPfx, bVal) {// check/uncheck all checkboxes with
											// a name prefix
		var eles = ir.getForPrefix(sPfx);
		for (var i = 0; i < eles.length; i++) {
			eles[i].checked = bVal;
		}
	},
	toggleChecksTogether : function(obj) {// check/uncheck all checkboxes with
											// same name prefix as obj passed
		if (typeof (obj) == "string") {
			obj = document.getElementById(obj);
		}
		ir.toggleChecks(obj.id, obj.checked);
	},
	toHash : function(arr, keyAttrOrFnOrNull) {
		var hash = {};
		if (keyAttrOrFnOrNull != null) {
		  // key is a function or attribute
			var fn = keyAttrOrFnOrNull;
			if (typeof(fn) != "function") {
			  // key is an attribute -
				// turn it into a function
				fn = function(o) {
					return o[keyAttrOrFnOrNull];
				};
			}
			for (var i = 0, len = arr.length; i < len; i++) {
				hash[fn(arr[i])] = arr[i];
			}
		} else {
		  // treat elements as keys and values as flags
			for (var i = 0, len = arr.length; i < len; i++) {
				hash[arr[i]] = true;
			}
		}
		return hash;
	},
	trim : function(s) {
		s = "" + s;
		if (s.trim) {
			return s.trim();
		}
		return s.replace(/^\s+|\s+$/g,"");
	},
	url : function( /* varargs */) {
		if (arguments == null || arguments.length == 0) {
			alert("you must supply arguments to url()");
			return "";
		}
		var s = arguments[0] + "";
		if (arguments.length > 1) {
			var and = "?";
			if (s.indexOf("?") > 0) {
				and = "&";
			}
			for (var i = 1; i < arguments.length; i++) {
				if (i % 2 == 1) {
					s += and;
				} else {
					s += "=";
				}
				s += encodeURIComponent(arguments[i]);
				and = "&";
			}
		}
		return s;
	},
	v : function(n,suppressLogIfNotFound) {
		var o;
		if (n.type) {
			o = n;
		} else {
			o = document.getElementById(n) || (document.getElementsByName(n) || [ null ])[0];
		}
		if (o == null) {
		  if (! suppressLogIfNotFound) {
		    ir.log("ir.v failed to find " + n);
		  }
			return "";
		}
		if (o.type == "radio") {
			var a = document.getElementsByName(o.name);
			for (var i = 0; i < a.length; i++) {
				if (a[i].checked) {
					return a[i].value;
				}
			}
			return "";
		}
		if (o.type == "checkbox") {
			return o.checked;
		}
		return o == null ? "" : o.value != null ? o.value : o.innerHTML;
	},
	vdt : function(id,suppressLogIfNotFound) {
		var s = ir.v(id,suppressLogIfNotFound);
		if (s == "") {
			return new Date(0);
		}
		var dt = new Date();
		var a = s.split(" ");
		if (a.length == 1 && s.indexOf(":") > 0) {// just time, assume today
			var hm = s.split(":");
			dt.setHours(Number(hm[0]));
			if (hm.length > 1) {
				dt.setMinutes(Number(hm[1]));
			}
			if (hm.length > 2) {
				dt.setSeconds(Number(hm[2]));
			}
		} else if (a.length == 2) {// date-space-time?
			dt = irdate.parse(a[0]);
			var hm = a[1].split(":");
			dt.setHours(Number(hm[0]));
			if (hm.length > 1) {
				dt.setMinutes(Number(hm[1]));
			}
			if (hm.length > 2) {
				dt.setSeconds(Number(hm[2]));
			}
		} else {
			dt = irdate.parse(s);
			if (dt == null) {
				return new Date(0);
			}
			if (dt.getFullYear() < 1970) {
				dt.setTime(0);
			}
		}
		return dt;
	},
	visible : function(idOrObj) {
		var ele = ir.get(idOrObj);
		if (ele == null) {
			ir.log("ir.visible: id='" + idOrObj + "' not found.");
			return false;
		}
		if (ele.style.display == "none" || ele.style.visibility == "hidden" || (ele.width + ele.heigth == 0)) {
			return false;
		}
		return true;
	},
	vn : function(id,suppressLogIfNotFound) {
		return ir.n(ir.v(id,suppressLogIfNotFound));
	},
	wait : function(bOn) {
		document.body.style.cursor = bOn ? "wait" : "default";
	},
	winHeight : function() {
		return window.innerHeight || document.documentElement.clientHeight;
	},
	winTop : function() {
		return window.pageYOffset || document.body.scrollTop || 0;
	},
	winWidth : function() {
		return window.innerWidth || document.documentElement.clientWidth;
	},
	zz_ir : 0
};