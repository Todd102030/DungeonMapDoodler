//
"use strict";
//
/** irstore: ir storage utilities for session,page,local storage, with 
 * fallback to cookies if necessary */
var irstore = { 
   cookieHash : null, 
   /** bool returns the stored object, passed through ir.isTrue,
    * returns false if not found */
   bool : function(key, boolSessionOnly)
   {
    return ir.isTrue(irstore.get(key, boolSessionOnly));
   }, 
   /** ck returns the named cookie as a string */ 
   ck : function(k)
   {
      if (irstore.cookieHash == null)
      {
         var hash = {};
         var ca = document.cookie.split(';');
         for (var i = 0, z = ca.length; i < z; i++)
         {
            var a = ca[i].split('=');
            if (a.length > 1)
            {
               var ck = ir.trim(a[0]);
               var cv = ir.trim(a[1]);
               hash[ck] = decodeURIComponent(cv);
            }
         }
         irstore.cookieHash = hash;
      }
      return irstore.cookieHash[k];
   }, 
   /** ckSet sets a cookie value */
   ckSet : function(k, v)
   {
      document.cookie = k + "=" + encodeURIComponent(v);
      if (irstore.cookieHash != null)
      {
         irstore.cookieHash[k] = v;
      }
   }, 
   /** get returns the stored object, 
    *  passed through ir.evalObj() if we find a [  or a {,
    *  or null if not found */
   get: function(key, boolSessionOnly)
   {
      var v;
      if (!boolSessionOnly && window.localStorage)
      {
       v = localStorage.getItem(key);
      }
      else if (window.sessionStorage)
      {
        v = sessionStorage.getItem(key);
      }
      else
      {
         v = irstore.ck(key);
      }
      if (v == null)
      {
         return null;
      }
      if (v.indexOf("[")>=1 || v.indexOf("{")>-1)
      {
       return ir.evalObj(v);
      }
      return v;
  }, 
  /** num returns the stored object, passed through ir.n,
   * returns 0  if not found. */
  num : function(key, boolSessionOnly) 
  {
   return ir.n(irstore.get(key, boolSessionOnly));
  }, 
  /** pg returns irstore.get() with ir.pageName() + '.' as a key prefix */
  pg : function(key)
  {
   return irstore.get(ir.pageName() + "." + key);
  }, 
  /** pgBool returns irstore.bool() with ir.pageName() + '.' as a key prefix */
  pgBool : function(key)
  {
   return irstore.bool(ir.pageName() + "." + key);
  }, 
  /** pgNum returns irstore.num() with ir.pageName() + '.' as a key prefix */
  pgNum : function(key)
  {
   return irstore.netNum(ir.pageName() + "." + key);
  },
  /** pgSet invokes irstore.set() with ir.pageName() + '.' as a key prefix */
  pgSet : function(key, val)
  {
   irstore.set(ir.pageName() + "." + key, val);
  },  
  /** pg returns irstore.str() with ir.pageName() + '.' as a key prefix */
  pgStr : function(key)
  {
   return irstore.str(ir.pageName() + "." + key);
  },
  /** ses invokes irstore.get but will not look in window.localStorage */
  ses : function(key)
  {
    return irstore.get(key, true);
  }, 
  /** sesBool invokes irstore.bool but will not look in window.localStorage */
  sesBool : function(key) 
  {
   return irstore.bool(key, true);
  }, 
  /** sesNum invokes irstore.num but will not look in window.localStorage */
  sesNum : function(key)
  {
   return irstore.num(key, true);
  }, 
  /** sesSet invokes irstore.set but will not save to window.localStorage */
  sesSet : function(key, val)
  {
   irstore.set(key, val, true);
  }, 
  /** sesStr invokes irstore.str but will not look in window.localStorage */
  sesStr : function(key)
  {
   return irstore.str(key, true);
  }, 
  /** irstore.set will place the stringified version of the passed value in 
   * window.localStorage if available and requested,
   * else in window.sessionStorage if available,
   * else in a cookie
   */
  set : function(key, valueIn, boolSessionOnly)
  {
   var val = valueIn;
   if (typeof(val)=="object")
   {
      val = JSON.stringify(valueIn);
   }
   try
   {
      if (!boolSessionOnly && window.localStorage)
      {
         localStorage.setItem(key, val);
         return;
      }
      else if (window.sessionStorage)
      {
         sessionStorage.setItem(key, val);
         return;
      }
   }
   catch (nevermindUseCookie)
   {
   }
   irstore.ckSet(key, val);
  }, 
  /** str returns the item coerced to a string */
  str: function(key, boolSessionOnly)
  {
    try
    {
       var v = "";
       if (!boolSessionOnly && window.localStorage)
       {
        v = localStorage.getItem(key);
        return v == null ? "" : v;
       }
       if (window.sessionStorage)
       {
         v = sessionStorage.getItem(key);
         return v == null ? "" : v;
       }
    }
    catch (nevermindUseCookie)
    {
    }
    v = irstore.ck(key);
    return v == null ? "" : v;
 }, 
  zz_irstore : 0 
};