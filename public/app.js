(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var has = ({}).hasOwnProperty;

  var aliases = {};

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf('components/' === 0)) {
        start = 'components/'.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return 'components/' + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var expand = (function() {
    var reg = /^\.\.?(\/|$)/;
    return function(root, name) {
      var results = [], parts, part;
      parts = (reg.test(name) ? root + '/' + name : name).split('/');
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part === '..') {
          results.pop();
        } else if (part !== '.' && part !== '') {
          results.push(part);
        }
      }
      return results.join('/');
    };
  })();
  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  globals.require = require;
})();
"use strict";

(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }g.jade = f();
  }
})(function () {
  var define, module, exports;return (function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw (f.code = "MODULE_NOT_FOUND", f);
        }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) s(r[o]);return s;
  })({ 1: [function (require, module, exports) {
      'use strict';

      /**
       * Merge two attribute objects giving precedence
       * to values in object `b`. Classes are special-cased
       * allowing for arrays and merging/joining appropriately
       * resulting in a string.
       *
       * @param {Object} a
       * @param {Object} b
       * @return {Object} a
       * @api private
       */

      exports.merge = function merge(a, b) {
        if (arguments.length === 1) {
          var attrs = a[0];
          for (var i = 1; i < a.length; i++) {
            attrs = merge(attrs, a[i]);
          }
          return attrs;
        }
        var ac = a['class'];
        var bc = b['class'];

        if (ac || bc) {
          ac = ac || [];
          bc = bc || [];
          if (!Array.isArray(ac)) ac = [ac];
          if (!Array.isArray(bc)) bc = [bc];
          a['class'] = ac.concat(bc).filter(nulls);
        }

        for (var key in b) {
          if (key != 'class') {
            a[key] = b[key];
          }
        }

        return a;
      };

      /**
       * Filter null `val`s.
       *
       * @param {*} val
       * @return {Boolean}
       * @api private
       */

      function nulls(val) {
        return val != null && val !== '';
      }

      /**
       * join array as classes.
       *
       * @param {*} val
       * @return {String}
       */
      exports.joinClasses = joinClasses;
      function joinClasses(val) {
        return (Array.isArray(val) ? val.map(joinClasses) : val && typeof val === 'object' ? Object.keys(val).filter(function (key) {
          return val[key];
        }) : [val]).filter(nulls).join(' ');
      }

      /**
       * Render the given classes.
       *
       * @param {Array} classes
       * @param {Array.<Boolean>} escaped
       * @return {String}
       */
      exports.cls = function cls(classes, escaped) {
        var buf = [];
        for (var i = 0; i < classes.length; i++) {
          if (escaped && escaped[i]) {
            buf.push(exports.escape(joinClasses([classes[i]])));
          } else {
            buf.push(joinClasses(classes[i]));
          }
        }
        var text = joinClasses(buf);
        if (text.length) {
          return ' class="' + text + '"';
        } else {
          return '';
        }
      };

      exports.style = function (val) {
        if (val && typeof val === 'object') {
          return Object.keys(val).map(function (style) {
            return style + ':' + val[style];
          }).join(';');
        } else {
          return val;
        }
      };
      /**
       * Render the given attribute.
       *
       * @param {String} key
       * @param {String} val
       * @param {Boolean} escaped
       * @param {Boolean} terse
       * @return {String}
       */
      exports.attr = function attr(key, val, escaped, terse) {
        if (key === 'style') {
          val = exports.style(val);
        }
        if ('boolean' == typeof val || null == val) {
          if (val) {
            return ' ' + (terse ? key : key + '="' + key + '"');
          } else {
            return '';
          }
        } else if (0 == key.indexOf('data') && 'string' != typeof val) {
          if (JSON.stringify(val).indexOf('&') !== -1) {
            console.warn('Since Jade 2.0.0, ampersands (`&`) in data attributes ' + 'will be escaped to `&amp;`');
          };
          if (val && typeof val.toISOString === 'function') {
            console.warn('Jade will eliminate the double quotes around dates in ' + 'ISO form after 2.0.0');
          }
          return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
        } else if (escaped) {
          if (val && typeof val.toISOString === 'function') {
            console.warn('Jade will stringify dates in ISO form after 2.0.0');
          }
          return ' ' + key + '="' + exports.escape(val) + '"';
        } else {
          if (val && typeof val.toISOString === 'function') {
            console.warn('Jade will stringify dates in ISO form after 2.0.0');
          }
          return ' ' + key + '="' + val + '"';
        }
      };

      /**
       * Render the given attributes object.
       *
       * @param {Object} obj
       * @param {Object} escaped
       * @return {String}
       */
      exports.attrs = function attrs(obj, terse) {
        var buf = [];

        var keys = Object.keys(obj);

        if (keys.length) {
          for (var i = 0; i < keys.length; ++i) {
            var key = keys[i],
                val = obj[key];

            if ('class' == key) {
              if (val = joinClasses(val)) {
                buf.push(' ' + key + '="' + val + '"');
              }
            } else {
              buf.push(exports.attr(key, val, false, terse));
            }
          }
        }

        return buf.join('');
      };

      /**
       * Escape the given string of `html`.
       *
       * @param {String} html
       * @return {String}
       * @api private
       */

      var jade_encode_html_rules = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      };
      var jade_match_html = /[&<>"]/g;

      function jade_encode_char(c) {
        return jade_encode_html_rules[c] || c;
      }

      exports.escape = jade_escape;
      function jade_escape(html) {
        var result = String(html).replace(jade_match_html, jade_encode_char);
        if (result === '' + html) return html;else return result;
      };

      /**
       * Re-throw the given `err` in context to the
       * the jade in `filename` at the given `lineno`.
       *
       * @param {Error} err
       * @param {String} filename
       * @param {String} lineno
       * @api private
       */

      exports.rethrow = function rethrow(err, filename, lineno, str) {
        if (!(err instanceof Error)) throw err;
        if ((typeof window != 'undefined' || !filename) && !str) {
          err.message += ' on line ' + lineno;
          throw err;
        }
        try {
          str = str || require('fs').readFileSync(filename, 'utf8');
        } catch (ex) {
          rethrow(err, null, lineno);
        }
        var context = 3,
            lines = str.split('\n'),
            start = Math.max(lineno - context, 0),
            end = Math.min(lines.length, lineno + context);

        // Error context
        var context = lines.slice(start, end).map(function (line, i) {
          var curr = i + start + 1;
          return (curr == lineno ? '  > ' : '    ') + curr + '| ' + line;
        }).join('\n');

        // Alter exception message
        err.path = filename;
        err.message = (filename || 'Jade') + ':' + lineno + '\n' + context + '\n\n' + err.message;
        throw err;
      };

      exports.DebugItem = function DebugItem(lineno, filename) {
        this.lineno = lineno;
        this.filename = filename;
      };
    }, { "fs": 2 }], 2: [function (require, module, exports) {}, {}] }, {}, [1])(1);
});
require.register("application", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Example = (function () {
  function Example() {
    _classCallCheck(this, Example);
  }

  _createClass(Example, null, [{
    key: "notify",
    value: function notify(message) {
      console.log(message);
    }
  }, {
    key: "add",
    value: function add(a, b) {
      return a + b;
    }
  }]);

  return Example;
})();

exports["default"] = Example;
module.exports = exports["default"];
});

;require.register("layout", function(exports, require, module) {
module.exports = function template(locals) {
var jade_debug = [ new jade.DebugItem( 1, "app/layout.jade" ) ];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined) {
jade_debug.unshift(new jade.DebugItem( 0, "app/layout.jade" ));
jade_debug.unshift(new jade.DebugItem( 1, "app/layout.jade" ));
var siteNav = { "columns": "./columns.html", "flexbox basics": "./flexbox-basics.html", "flexbox examples": "./flexbox-examples.html" }
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 3, "app/layout.jade" ));
buf.push("<!DOCTYPE html>");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 4, "app/layout.jade" ));
buf.push("<html>");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.unshift(new jade.DebugItem( 5, "app/layout.jade" ));
buf.push("<head>");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.unshift(new jade.DebugItem( 6, "app/layout.jade" ));
buf.push("<title>");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.unshift(new jade.DebugItem( 6, jade_debug[0].filename ));
buf.push("CSS Examples");
jade_debug.shift();
jade_debug.shift();
buf.push("</title>");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 7, "app/layout.jade" ));
buf.push("<link rel=\"stylesheet\" href=\"app.css\">");
jade_debug.shift();
jade_debug.shift();
buf.push("</head>");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 9, "app/layout.jade" ));
buf.push("<body>");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.unshift(new jade.DebugItem( 10, "app/layout.jade" ));
buf.push("<header role=\"banner\" class=\"container banner\">");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.unshift(new jade.DebugItem( 11, "app/layout.jade" ));
buf.push("<h1 class=\"site-title\">");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.unshift(new jade.DebugItem( 12, "app/layout.jade" ));
buf.push("<a href=\"./index.html\" class=\"site-navigation__item__link--home\">");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.unshift(new jade.DebugItem( 12, jade_debug[0].filename ));
buf.push("CSS Examples");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("</h1>");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 13, "app/layout.jade" ));
buf.push("<ul class=\"site-navigation\">");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.unshift(new jade.DebugItem( 14, "app/layout.jade" ));
// iterate siteNav
;(function(){
  var $$obj = siteNav;
  if ('number' == typeof $$obj.length) {

    for (var title = 0, $$l = $$obj.length; title < $$l; title++) {
      var url = $$obj[title];

jade_debug.unshift(new jade.DebugItem( 14, "app/layout.jade" ));
jade_debug.unshift(new jade.DebugItem( 15, "app/layout.jade" ));
buf.push("<li class=\"site-navigation__item\">");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.unshift(new jade.DebugItem( 16, "app/layout.jade" ));
buf.push("<a" + (jade.attr("href", "" + (url) + "", true, true)) + ">");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.unshift(new jade.DebugItem( 16, jade_debug[0].filename ));
buf.push("" + (jade.escape((jade_interp = title) == null ? '' : jade_interp)) + "");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.shift();
    }

  } else {
    var $$l = 0;
    for (var title in $$obj) {
      $$l++;      var url = $$obj[title];

jade_debug.unshift(new jade.DebugItem( 14, "app/layout.jade" ));
jade_debug.unshift(new jade.DebugItem( 15, "app/layout.jade" ));
buf.push("<li class=\"site-navigation__item\">");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.unshift(new jade.DebugItem( 16, "app/layout.jade" ));
buf.push("<a" + (jade.attr("href", "" + (url) + "", true, true)) + ">");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.unshift(new jade.DebugItem( 16, jade_debug[0].filename ));
buf.push("" + (jade.escape((jade_interp = title) == null ? '' : jade_interp)) + "");
jade_debug.shift();
jade_debug.shift();
buf.push("</a>");
jade_debug.shift();
jade_debug.shift();
buf.push("</li>");
jade_debug.shift();
jade_debug.shift();
    }

  }
}).call(this);

jade_debug.shift();
jade_debug.shift();
buf.push("</ul>");
jade_debug.shift();
jade_debug.shift();
buf.push("</header>");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 18, "app/layout.jade" ));
buf.push("<main role=\"main\" class=\"container\">");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.unshift(new jade.DebugItem( 19, "app/layout.jade" ));
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
buf.push("");
jade_debug.shift();
jade_debug.shift();
jade_debug.shift();
buf.push("</main>");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 22, "app/layout.jade" ));
buf.push("<footer class=\"site-footer\">");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.unshift(new jade.DebugItem( 23, "app/layout.jade" ));
buf.push("<div class=\"container\">");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.unshift(new jade.DebugItem( 24, "app/layout.jade" ));
buf.push("<p>");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.unshift(new jade.DebugItem( 24, jade_debug[0].filename ));
buf.push("This is the footer");
jade_debug.shift();
jade_debug.shift();
buf.push("</p>");
jade_debug.shift();
jade_debug.shift();
buf.push("</div>");
jade_debug.shift();
jade_debug.shift();
buf.push("</footer>");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 26, "app/layout.jade" ));
buf.push("<script src=\"app.js\">");
jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
jade_debug.shift();
buf.push("</script>");
jade_debug.shift();
jade_debug.shift();
buf.push("</body>");
jade_debug.shift();
jade_debug.shift();
buf.push("</html>");
jade_debug.shift();
jade_debug.shift();}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, "- var siteNav = { \"columns\": \"./columns.html\", \"flexbox basics\": \"./flexbox-basics.html\", \"flexbox examples\": \"./flexbox-examples.html\" }\n\ndoctype html\nhtml\n  head\n    title CSS Examples\n    link(rel=\"stylesheet\", href=\"app.css\")\n\n  body\n    header.container.banner(role=\"banner\")\n      h1.site-title\n        a.site-navigation__item__link--home(href=\"./index.html\") CSS Examples\n      ul.site-navigation\n        each url, title in siteNav\n          li.site-navigation__item\n            a(href=\"#{url}\") #{title}\n\n    main.container(role=\"main\")\n      block content\n\n\n    footer.site-footer\n      .container\n        p This is the footer\n\n    script(src=\"app.js\")\n");
}
};
});

require.register("mixins", function(exports, require, module) {
module.exports = function template(locals) {
var jade_debug = [ new jade.DebugItem( 1, "app/mixins.jade" ) ];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;

jade_debug.unshift(new jade.DebugItem( 0, "app/mixins.jade" ));
jade_debug.unshift(new jade.DebugItem( 1, "app/mixins.jade" ));
buf.push("<!-- Utility functions-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 2, "app/mixins.jade" ));
buf.push("<!-- --------------------------------------->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 3, "app/mixins.jade" ));
buf.push("");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 4, "app/mixins.jade" ));
buf.push("<!-- Convert a [title] string to kebab-case-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 5, "app/mixins.jade" ));
function skewer(str) {
  str.toLowerCase()
     .replace(/\s/, '-')
}

jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 11, "app/mixins.jade" ));
buf.push("<!-- --------------------------------------->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 12, "app/mixins.jade" ));
buf.push("<!-- Sections (chapters):-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 13, "app/mixins.jade" ));
buf.push("<!-- --------------------------------------->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 14, "app/mixins.jade" ));
buf.push("<!-- each article should have a contents. Mixin accepts array.-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 15, "app/mixins.jade" ));





















































jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 23, "app/mixins.jade" ));
buf.push("<!-- each article should have a lede...-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 24, "app/mixins.jade" ));




















jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 29, "app/mixins.jade" ));
buf.push("<!-- --------------------------------------->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 30, "app/mixins.jade" ));
buf.push("<!-- Sections (chapters):-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 31, "app/mixins.jade" ));
buf.push("<!-- --------------------------------------->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 32, "app/mixins.jade" ));
buf.push("<!-- each article has sections,-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 33, "app/mixins.jade" ));
buf.push("<!-- which have IDs for anchoring...-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 34, "app/mixins.jade" ));
































jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 41, "app/mixins.jade" ));
buf.push("<!-- A chapter with a demo page mtching the title-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 42, "app/mixins.jade" ));






































jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 49, "app/mixins.jade" ));
buf.push("<!-- --------------------------------------->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 50, "app/mixins.jade" ));
buf.push("<!-- Subsections:-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 51, "app/mixins.jade" ));
buf.push("<!-- --------------------------------------->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 52, "app/mixins.jade" ));
buf.push("<!-- Which should have subsections:-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 53, "app/mixins.jade" ));
buf.push("<!-- eg an overview, static examples-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 54, "app/mixins.jade" ));
buf.push("<!-- and interactive examples...-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 55, "app/mixins.jade" ));




















jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 61, "app/mixins.jade" ));
buf.push("<!-- Examples:-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 62, "app/mixins.jade" ));
buf.push("<!-- --------------------------------------->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 63, "app/mixins.jade" ));
buf.push("<!-- Zero-to-many per static section-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 64, "app/mixins.jade" ));
buf.push("");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 65, "app/mixins.jade" ));
buf.push("<!-- Static examples-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 66, "app/mixins.jade" ));


























jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 72, "app/mixins.jade" ));
buf.push("<!-- Interactive examples, which need-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 73, "app/mixins.jade" ));
buf.push("<!-- to be built with two sub-element-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 74, "app/mixins.jade" ));
buf.push("<!-- mixins.-->");
jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 75, "app/mixins.jade" ));


























jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 81, "app/mixins.jade" ));




















jade_debug.shift();
jade_debug.unshift(new jade.DebugItem( 86, "app/mixins.jade" ));














jade_debug.shift();
jade_debug.shift();;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, "// Utility functions\n// -------------------------------------\n\n// Convert a [title] string to kebab-case\n-\n  function skewer(str) {\n    str.toLowerCase()\n       .replace(/\\s/, '-')\n  }\n\n// -------------------------------------\n// Sections (chapters):\n// -------------------------------------\n// each article should have a contents. Mixin accepts array.\nmixin articleContents(titles)\n  nav.contents\n    ol.contents__list\n      each title in titles\n        li.contents__entry\n          a.contents__entry__link(href=\"##{title.toLowerCase().replace(/\\s/, '-')}\")= title\n\n\n// each article should have a lede...\nmixin articleLede()\n  section.lede\n    .lede__content\n      block\n\n// -------------------------------------\n// Sections (chapters):\n// -------------------------------------\n// each article has sections,\n// which have IDs for anchoring...\nmixin articleChapter(title)\n  section.chapter(id=\"#{title.toLowerCase().replace(/\\s/, '-')}\")\n    header.chapter__header\n      h1.chapter__title= title\n    .chapter__content\n      block\n\n// A chapter with a demo page mtching the title\nmixin articleLinkedChapter(title)\n  section.chapter(id=\"#{title.toLowerCase().replace(/\\s/, '-')}\")\n    header.chapter__header\n      h1.chapter__title: a(href=\"flexbox-examples/#{title.toLowerCase().replace(/\\s/, '-')}.html\")= title\n    .chapter__content\n      block\n\n// -------------------------------------\n// Subsections:\n// -------------------------------------\n// Which should have subsections:\n// eg an overview, static examples\n// and interactive examples...\nmixin subSection(title)\n  section(class=\"subsection subsection--#{title.toLowerCase().replace(/\\s/, '-')}\")\n    h1.subsection__title= title\n    block\n\n\n// Examples:\n// -------------------------------------\n// Zero-to-many per static section\n\n// Static examples\nmixin staticExample(figcaption)\n  figure.figure--static\n    .figure__content\n      block\n    figcaption.figure__caption--static= figcaption\n\n// Interactive examples, which need\n// to be built with two sub-element\n// mixins.\nmixin interactiveExample(instructions)\n  figure.figure--interactive\n    figcaption.figure__caption--interactive= instructions\n    .figure__content\n      block\n\nmixin interactiveInput()\n  pre.interactive-wrap\n    style.interactive-input(contenteditable=\"true\")\n      block\n\nmixin interactiveOutput()\n  .interactive-output\n    block\n");
}
};
});

require.register("test/index", function(exports, require, module) {
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _indexJs = require('../index.js');

var _indexJs2 = _interopRequireDefault(_indexJs);

var test = require('tape');

test('The truth', function (t) {
  t.plan(1);
  t.equal(1, 1, '1 should equal 1.');
});

test('Example class', function (t) {
  t.plan(1);
  t.equal(_indexJs2['default'].add(1, 1), 2, 'Adding 1 and 1 should equal 2.');
});
});

;
//# sourceMappingURL=app.js.map