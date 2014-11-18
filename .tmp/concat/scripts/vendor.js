/* Zepto v1.1.4 - zepto event ajax form ie - zeptojs.com/license */

var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className,
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    var num
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (!selector) result = []
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this[0].textContent : null)
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (!this.length || this[0].nodeType !== 1 ? undefined :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && setAttribute(this, name) })
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    data: function(name, value){
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return 0 in arguments ?
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        }) :
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        )
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var element = this[0], computedStyle = getComputedStyle(element, '')
        if(!element) return
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(isArray(property) ? property: [property], function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // items in the collection might not be DOM elements
      if('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return callback ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else this.each(function(){
        try { this[name]() }
        catch(e) {}
      })
      return this
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred()
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
         (!options || options.cache !== true) &&
         ('script' == dataType || 'jsonp' == dataType)
        ))
      settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var result = [], el
    $([].slice.call(this.get(0).elements)).each(function(){
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function($){
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
    $.extend($.zepto, {
      Z: function(dom, selector){
        dom = dom || []
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function(object){
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function(element){
      try {
        return nativeGetComputedStyle(element)
      } catch(e) {
        return null
      }
    }
  }
})(Zepto)

/**
 * PgwModal - Version 2.0
 *
 * Copyright 2014, Jonathan M. Piat
 * http://pgwjs.com - http://pagawa.com
 * 
 * Released under the GNU GPLv3 license - http://opensource.org/licenses/gpl-3.0
 */
;(function($){
    $.pgwModal = function(obj) {

        var pgwModal = {};
        var defaults = {
            mainClassName : 'pgwModal',
            backdropClassName : 'pgwModalBackdrop',
            maxWidth : 500,
            titleBar : true,
            closable : true,
            closeOnEscape : true,
            closeOnBackgroundClick : true,
            closeContent : '<span class="pm-icon"></span>',
            loadingContent : 'Loading in progress...',
            errorContent : 'An error has occured. Please try again in a few moments.'
        };

        if (typeof window.pgwModalObject != 'undefined') {
            pgwModal = window.pgwModalObject;
        }

        // Merge the defaults and the user's config
        if ((typeof obj == 'object') && (! obj.pushContent)) {
            if (! obj.url && ! obj.target && ! obj.content) {
                throw new Error('PgwModal - There is no content to display, please provide a config parameter : "url", "target" or "content"');
            }

            pgwModal.config = {};
            pgwModal.config = $.extend({}, defaults, obj);
            window.pgwModalObject = pgwModal;
        }

        // Create modal container
        var create = function() {
            // The backdrop must be outside the main container, otherwise Chrome displays the scrollbar of the modal below
            var appendBody = '<div id="pgwModalBackdrop"></div>'
                + '<div id="pgwModal">'
                + '<div class="pm-container">'
                + '<div class="pm-body">'
                + '<span class="pm-close"></span>'
                + '<div class="pm-title"></div>'
                + '<div class="pm-content"></div>'
                + '</div>'
                + '</div>'
                + '</div>';

            $('body').append(appendBody);
            $(document).trigger('PgwModal::Create');
            return true;
        };

        // Reset modal container
        var reset = function() {
            $('#pgwModal .pm-title, #pgwModal .pm-content').html('');
            $('#pgwModal .pm-close').html('').unbind('click');
            return true;
        };

        // Angular compilation
        var angularCompilation = function() {
            angular.element('body').injector().invoke(function($compile) {
                var scope = angular.element($('#pgwModal .pm-content')).scope();
                $compile($('#pgwModal .pm-content'))(scope);
                scope.$digest();
            });
            return true;
        };

        // Push content into the modal
        var pushContent = function(content) {
            $('#pgwModal .pm-content').html(content);

            // Angular
            if (pgwModal.config.angular) {
                angularCompilation();
            }

            reposition();

            $(document).trigger('PgwModal::PushContent');
            return true;
        };

        // Repositions the modal
        var reposition = function() {
            // Elements must be visible before height calculation
            $('#pgwModal, #pgwModalBackdrop').show();

            var windowHeight = $(window).height();
            var modalHeight = $('#pgwModal .pm-body').height();
            var marginTop = Math.round((windowHeight - modalHeight) / 3);
            if (marginTop <= 0) {
                marginTop = 0;
            }

            $('#pgwModal .pm-body').css('margin-top', marginTop);
            return true;
        };

        // Returns the modal data
        var getData = function() {
            return pgwModal.config.modalData;
        };

        // Returns the scrollbar width
        var getScrollbarWidth = function() {
            var container = $('<div style="width:50px;height:50px;overflow:auto"><div></div></div>').appendTo('body');
            var child = container.children();

            // Check for Zepto
            if (typeof child.innerWidth != 'function') {
                return 0;
            }

            var width = child.innerWidth() - child.height(90).innerWidth();
            container.remove();

            return width;
        };

        // Returns the modal status
        var isOpen = function() {
            return $('body').hasClass('pgwModalOpen');
        };

        // Close the modal
        var close = function() {
            $('#pgwModal, #pgwModalBackdrop').removeClass().hide();
            $('body').css('padding-right', '').removeClass('pgwModalOpen');

            // Reset modal
            reset();

            // Disable events
            $(window).unbind('resize.PgwModal');
            $(document).unbind('keyup.PgwModal');
            $('#pgwModal').unbind('click.PgwModalBackdrop');

            try {
                delete window.pgwModalObject; 
            } catch(e) {
                window['pgwModalObject'] = undefined; 
            }

            $(document).trigger('PgwModal::Close');
            return true;
        };

        // Open the modal
        var open = function() {
            if ($('#pgwModal').length == 0) {
                create();
            } else {
                reset();
            }

            // Set CSS classes
            $('#pgwModal').removeClass().addClass(pgwModal.config.mainClassName);
            $('#pgwModalBackdrop').removeClass().addClass(pgwModal.config.backdropClassName);

            // Close button
            if (! pgwModal.config.closable) {
                $('#pgwModal .pm-close').html('').unbind('click').hide();
            } else {
                $('#pgwModal .pm-close').html(pgwModal.config.closeContent).click(function() {
                    close();
                }).show();
            }

            // Title bar
            if (! pgwModal.config.titleBar) {
                $('#pgwModal .pm-title').hide();
            } else {
                $('#pgwModal .pm-title').show();
            }

            if (pgwModal.config.title) {
                $('#pgwModal .pm-title').text(pgwModal.config.title);
            }

            if (pgwModal.config.maxWidth) {
                $('#pgwModal .pm-body').css('max-width', pgwModal.config.maxWidth);
            }

            // Content loaded by Ajax
            if (pgwModal.config.url) {
                if (pgwModal.config.loadingContent) {
                    $('#pgwModal .pm-content').html(pgwModal.config.loadingContent);
                }

                var ajaxOptions = {
                    'url' : obj.url,
                    'success' : function(data) {
                        pushContent(data);
                    },
                    'error' : function() {
                        $('#pgwModal .pm-content').html(pgwModal.config.errorContent);
                    }
                };

                if (pgwModal.config.ajaxOptions) {
                    ajaxOptions = $.extend({}, ajaxOptions, pgwModal.config.ajaxOptions);
                }

                $.ajax(ajaxOptions);
                
            // Content loaded by a html element
            } else if (pgwModal.config.target) {
                pushContent($(pgwModal.config.target).html());

            // Content loaded by a html object
            } else if (pgwModal.config.content) {
                pushContent(pgwModal.config.content);
            }

            // Close on escape
            if (pgwModal.config.closeOnEscape && pgwModal.config.closable) {
                $(document).bind('keyup.PgwModal', function(e) {
                    if (e.keyCode == 27) {
                        close();
                    }
                });
            }

            // Close on background click
            if (pgwModal.config.closeOnBackgroundClick && pgwModal.config.closable) {
                $('#pgwModal').bind('click.PgwModalBackdrop', function(e) {
                    var targetClass = $(e.target).hasClass('pm-container');
                    var targetId = $(e.target).attr('id');
                    if (targetClass || targetId == 'pgwModal') {
                        close();
                    }
                });
            }

            // Add CSS class on the body tag
            $('body').addClass('pgwModalOpen');

            var currentScrollbarWidth = getScrollbarWidth();
            if (currentScrollbarWidth > 0) {
                $('body').css('padding-right', currentScrollbarWidth);
            }

            // Resize event for reposition
            $(window).bind('resize.PgwModal', function() {
                reposition();
            });

            $(document).trigger('PgwModal::Open');
            return true;
        };

        // Choose the action
        if ((typeof obj == 'string') && (obj == 'close')) {
            return close();

        } else if ((typeof obj == 'string') && (obj == 'reposition')) {
            return reposition();

        } else if ((typeof obj == 'string') && (obj == 'getData')) {
            return getData();

        } else if ((typeof obj == 'string') && (obj == 'isOpen')) {
            return isOpen();

        } else if ((typeof obj == 'object') && (obj.pushContent)) {
            return pushContent(obj.pushContent);

        } else if (typeof obj == 'object') {
            return open();
        }
    }
})(window.Zepto || window.jQuery);

// @license
// Baidu Music Player: 0.9.2
// -------------------------
// (c) 2014 FE Team of Baidu Music
// Can be freely distributed under the BSD license.
//     Zepto.js
//     (c) 2010-2014 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  // Create a collection of callbacks to be fired in a sequence, with configurable behaviour
  // Option flags:
  //   - once: Callbacks fired at most one time.
  //   - memory: Remember the most recent context and arguments
  //   - stopOnFalse: Cease iterating over callback list
  //   - unique: Permit adding at most one instance of the same callback
  $.Callbacks = function(options) {
    options = $.extend({}, options)

    var memory, // Last fire value (for non-forgettable lists)
        fired,  // Flag to know if list was already fired
        firing, // Flag to know if list is currently firing
        firingStart, // First callback to fire (used internally by add and fireWith)
        firingLength, // End of the loop when firing
        firingIndex, // Index of currently firing callback (modified by remove if needed)
        list = [], // Actual callback list
        stack = !options.once && [], // Stack of fire calls for repeatable lists
        fire = function(data) {
          memory = options.memory && data
          fired = true
          firingIndex = firingStart || 0
          firingStart = 0
          firingLength = list.length
          firing = true
          for ( ; list && firingIndex < firingLength ; ++firingIndex ) {
            if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
              memory = false
              break
            }
          }
          firing = false
          if (list) {
            if (stack) stack.length && fire(stack.shift())
            else if (memory) list.length = 0
            else Callbacks.disable()
          }
        },

        Callbacks = {
          add: function() {
            if (list) {
              var start = list.length,
                  add = function(args) {
                    $.each(args, function(_, arg){
                      if (typeof arg === "function") {
                        if (!options.unique || !Callbacks.has(arg)) list.push(arg)
                      }
                      else if (arg && arg.length && typeof arg !== 'string') add(arg)
                    })
                  }
              add(arguments)
              if (firing) firingLength = list.length
              else if (memory) {
                firingStart = start
                fire(memory)
              }
            }
            return this
          },
          remove: function() {
            if (list) {
              $.each(arguments, function(_, arg){
                var index
                while ((index = $.inArray(arg, list, index)) > -1) {
                  list.splice(index, 1)
                  // Handle firing indexes
                  if (firing) {
                    if (index <= firingLength) --firingLength
                    if (index <= firingIndex) --firingIndex
                  }
                }
              })
            }
            return this
          },
          has: function(fn) {
            return !!(list && (fn ? $.inArray(fn, list) > -1 : list.length))
          },
          empty: function() {
            firingLength = list.length = 0
            return this
          },
          disable: function() {
            list = stack = memory = undefined
            return this
          },
          disabled: function() {
            return !list
          },
          lock: function() {
            stack = undefined;
            if (!memory) Callbacks.disable()
            return this
          },
          locked: function() {
            return !stack
          },
          fireWith: function(context, args) {
            if (list && (!fired || stack)) {
              args = args || []
              args = [context, args.slice ? args.slice() : args]
              if (firing) stack.push(args)
              else fire(args)
            }
            return this
          },
          fire: function() {
            return Callbacks.fireWith(this, arguments)
          },
          fired: function() {
            return !!fired
          }
        }

    return Callbacks
  }
})(Zepto)
//     Zepto.js
//     (c) 2010-2014 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.
//
//     Some code (c) 2005, 2013 jQuery Foundation, Inc. and other contributors

;(function($){
  var slice = Array.prototype.slice

  function Deferred(func) {
    var tuples = [
          // action, add listener, listener list, final state
          [ "resolve", "done", $.Callbacks({once:1, memory:1}), "resolved" ],
          [ "reject", "fail", $.Callbacks({once:1, memory:1}), "rejected" ],
          [ "notify", "progress", $.Callbacks({memory:1}) ]
        ],
        state = "pending",
        promise = {
          state: function() {
            return state
          },
          always: function() {
            deferred.done(arguments).fail(arguments)
            return this
          },
          then: function(/* fnDone [, fnFailed [, fnProgress]] */) {
            var fns = arguments
            return Deferred(function(defer){
              $.each(tuples, function(i, tuple){
                var fn = $.isFunction(fns[i]) && fns[i]
                deferred[tuple[1]](function(){
                  var returned = fn && fn.apply(this, arguments)
                  if (returned && $.isFunction(returned.promise)) {
                    returned.promise()
                      .done(defer.resolve)
                      .fail(defer.reject)
                      .progress(defer.notify)
                  } else {
                    var context = this === promise ? defer.promise() : this,
                        values = fn ? [returned] : arguments
                    defer[tuple[0] + "With"](context, values)
                  }
                })
              })
              fns = null
            }).promise()
          },

          promise: function(obj) {
            return obj != null ? $.extend( obj, promise ) : promise
          }
        },
        deferred = {}

    $.each(tuples, function(i, tuple){
      var list = tuple[2],
          stateString = tuple[3]

      promise[tuple[1]] = list.add

      if (stateString) {
        list.add(function(){
          state = stateString
        }, tuples[i^1][2].disable, tuples[2][2].lock)
      }

      deferred[tuple[0]] = function(){
        deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments)
        return this
      }
      deferred[tuple[0] + "With"] = list.fireWith
    })

    promise.promise(deferred)
    if (func) func.call(deferred, deferred)
    return deferred
  }

  $.when = function(sub) {
    var resolveValues = slice.call(arguments),
        len = resolveValues.length,
        i = 0,
        remain = len !== 1 || (sub && $.isFunction(sub.promise)) ? len : 0,
        deferred = remain === 1 ? sub : Deferred(),
        progressValues, progressContexts, resolveContexts,
        updateFn = function(i, ctx, val){
          return function(value){
            ctx[i] = this
            val[i] = arguments.length > 1 ? slice.call(arguments) : value
            if (val === progressValues) {
              deferred.notifyWith(ctx, val)
            } else if (!(--remain)) {
              deferred.resolveWith(ctx, val)
            }
          }
        }

    if (len > 1) {
      progressValues = new Array(len)
      progressContexts = new Array(len)
      resolveContexts = new Array(len)
      for ( ; i < len; ++i ) {
        if (resolveValues[i] && $.isFunction(resolveValues[i].promise)) {
          resolveValues[i].promise()
            .done(updateFn(i, resolveContexts, resolveValues))
            .fail(deferred.reject)
            .progress(updateFn(i, progressContexts, progressValues))
        } else {
          --remain
        }
      }
    }
    if (!remain) deferred.resolveWith(resolveContexts, resolveValues)
    return deferred.promise()
  }

  $.Deferred = Deferred
})(Zepto)
;(function($) {
    var ObjProto = Object.prototype,
        toString = ObjProto.toString;

    $.isString = function(obj) {
        return toString.call(obj) === '[object String]';
    }

    $.isNumeric = function(obj) {
        return toString.call(obj) === '[object Number]';
    }

    // 参考: https://github.com/dexteryy/OzJS/blob/master/oz.js
    $.getScript = function(url, op) {
        var doc = document,
            s = doc.createElement('script');
            s.async = 'async';

        if (!op) {
            op = {};
        } else if ($.isFunction(op)) {
            op = {
                callback: op
            };
        }

        if (op.charset) {
            s.charset = op.charset;
        }

        s.src = url;

        var h = doc.getElementsByTagName('head')[0];

        s.onload = s.onreadystatechange = function(__, isAbort) {
            if (isAbort || !s.readyState || /loaded|complete/.test(s.readyState)) {
                s.onload = s.onreadystatechange = null;
                if (h && s.parentNode) {
                    h.removeChild(s);
                }
                s = undefined;
                if (!isAbort && op.callback) {
                    op.callback();
                }
            }
        };

        h.insertBefore(s, h.firstChild);
    }
})(Zepto);
(function(root, factory) {
  if (typeof root._mu === 'undefined') {
    root._mu = {};
  }
  if (typeof exports === 'object') {
    return module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    return define('muplayer/core/cfg',factory);
  } else {
    return root._mu.cfg = factory();
  }
})(this, function() {
  var root;
  root = this;
  return $.extend({
    namespace: root._mu,
    debug: false,
    version: '0.9.2',
    timerResolution: 25,
    cdn: 'http://apps.bdimg.com/libs/muplayer/',
    engine: {
      TYPES: {
        FLASH_MP3: 'FlashMP3Core',
        FLASH_MP4: 'FlashMP4Core',
        AUDIO: 'AudioCore'
      },
      EVENTS: {
        STATECHANGE: 'engine:statechange',
        POSITIONCHANGE: 'engine:postionchange',
        PROGRESS: 'engine:progress',
        ERROR: 'engine:error',
        INIT: 'engine:init',
        INIT_FAIL: 'engine:init_fail'
      },
      STATES: {
        NOT_INIT: 'not_init',
        PREBUFFER: 'prebuffer',
        BUFFERING: 'buffering',
        PLAYING: 'playing',
        PAUSE: 'pause',
        STOP: 'stop',
        END: 'ended'
      },
      ERRCODE: {
        MEDIA_ERR_ABORTED: '1',
        MEDIA_ERR_NETWORK: '2',
        MEDIA_ERR_DECODE: '3',
        MEDIA_ERR_SRC_NOT_SUPPORTED: '4'
      }
    }
  }, typeof root._mu === 'undefined' ? {} : root._mu.cfg);
});

(function(root, factory) {
  if (typeof exports === 'object') {
    return module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    return define('muplayer/core/utils',['muplayer/core/cfg'], factory);
  } else {
    return root._mu.utils = factory(root._mu.cfg);
  }
})(this, function(cfg) {
  var ArrayProto, NumProto, ObjProto, StrProto, hasOwnProperty, name, push, toString, utils, _i, _len, _ref;
  utils = {};
  StrProto = String.prototype;
  NumProto = Number.prototype;
  ObjProto = Object.prototype;
  ArrayProto = Array.prototype;
  push = ArrayProto.push;
  hasOwnProperty = ObjProto.hasOwnProperty;
  toString = ObjProto.toString;
  _ref = ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    name = _ref[_i];
    utils['is' + name] = (function(name) {
      return function(obj) {
        return toString.call(obj) === '[object ' + name + ']';
      };
    })(name);
  }
  if (!$.isFunction(StrProto.startsWith)) {
    StrProto.startsWith = function(str) {
      return this.slice(0, str.length) === str;
    };
  }
  if (!$.isFunction(StrProto.endsWith)) {
    StrProto.endsWith = function(str) {
      return this.slice(-str.length) === str;
    };
  }
  NumProto.toFixed = function(n) {
    var fixed, padding, pow;
    pow = Math.pow(10, n);
    fixed = (Math.round(this * pow) / pow).toString();
    if (n === 0) {
      return fixed;
    }
    if (fixed.indexOf('.') < 0) {
      fixed += '.';
    }
    padding = n + 1 - (fixed.length - fixed.indexOf('.'));
    while (padding--) {
      fixed += '0';
    }
    return fixed;
  };
  $.extend(utils, {
    isEmpty: function(obj) {
      var key, _j, _len1;
      if (obj == null) {
        return true;
      }
      if ($.isArray(obj) || this.isString(obj)) {
        return obj.length === 0;
      }
      for (_j = 0, _len1 = obj.length; _j < _len1; _j++) {
        key = obj[_j];
        if (this.has(obj, key)) {
          return false;
        }
      }
      return true;
    },
    isBoolean: function(obj) {
      return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
    },
    has: function(obj, key) {
      return hasOwnProperty.call(obj, key);
    },
    random: function(min, max) {
      if (!max) {
        max = min;
        min = 0;
      }
      return min + Math.floor(Math.random() * (max - min + 1));
    },
    shuffle: function(list) {
      var i, item, rand, shuffled, _j, _len1;
      i = 0;
      shuffled = [];
      for (_j = 0, _len1 = list.length; _j < _len1; _j++) {
        item = list[_j];
        rand = this.random(i++);
        shuffled[i - 1] = shuffled[rand];
        shuffled[rand] = item;
      }
      return shuffled;
    },
    clone: function(obj) {
      if (!$.isPlainObject(obj)) {
        obj;
      }
      if ($.isArray(obj)) {
        return obj.slice();
      } else {
        return $.extend({}, obj);
      }
    },
    time2str: function(time) {
      var floor, hour, minute, pad, r, second;
      r = [];
      floor = Math.floor;
      time = Math.round(time);
      hour = floor(time / 3600);
      minute = floor((time - 3600 * hour) / 60);
      second = time % 60;
      pad = (function(_this) {
        return function(source, length) {
          var nagative, pre, str;
          pre = '';
          nagative = '';
          if (source < 0) {
            nagative = '-';
          }
          str = String(Math.abs(source));
          if (str.length < length) {
            pre = new Array(length - str.length + 1).join('0');
          }
          return nagative + pre + str;
        };
      })(this);
      if (hour) {
        r.push(hour);
      }
      r.push(pad(minute, 2));
      r.push(pad(second, 2));
      return r.join(':');
    },
    namespace: function() {
      var a, arg, d, i, l, o, period, _j, _len1, _ref1;
      a = arguments;
      period = '.';
      for (_j = 0, _len1 = a.length; _j < _len1; _j++) {
        arg = a[_j];
        o = cfg.namespace;
        if (arg.indexOf(period) > -1) {
          d = arg.split(period);
          _ref1 = [0, d.length], i = _ref1[0], l = _ref1[1];
          while (i < l) {
            o[d[i]] = o[d[i]] || {};
            o = o[d[i]];
            i++;
          }
        } else {
          o[arg] = o[arg] || {};
          o = o[arg];
        }
      }
      return o;
    },
    wrap: function(func, wrapper) {
      return function() {
        var args;
        args = [func];
        push.apply(args, arguments);
        return wrapper.apply(this, args);
      };
    },
    toAbsoluteUrl: function(url) {
      var div;
      div = document.createElement('div');
      div.innerHTML = '<a></a>';
      div.firstChild.href = url;
      div.innerHTML = div.innerHTML;
      return div.firstChild.href;
    }
  });
  return utils;
});

(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define('muplayer/lib/events',factory);
  } else {
    root._mu.Events = factory();
  }
})(this, function () {
  // Events
  // -----------------
  // Thanks to:
  //  - https://github.com/documentcloud/backbone/blob/master/backbone.js
  //  - https://github.com/joyent/node/blob/master/lib/events.js


  // Regular expression used to split event strings
  var eventSplitter = /\s+/


  // A module that can be mixed in to *any object* in order to provide it
  // with custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = new Events();
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  function Events() {
  }


  // Bind one or more space separated events, `events`, to a `callback`
  // function. Passing `"all"` will bind the callback to all events fired.
  Events.prototype.on = function(events, callback, context) {
    var cache, event, list
    if (!callback) return this

    cache = this.__events || (this.__events = {})
    events = events.split(eventSplitter)

    while (event = events.shift()) {
      list = cache[event] || (cache[event] = [])
      list.push(callback, context)
    }

    return this
  }

  Events.prototype.once = function(events, callback, context) {
    var that = this
    var cb = function() {
      that.off(events, cb)
      callback.apply(this, arguments)
    }
    this.on(events, cb, context)
  }

  // Remove one or many callbacks. If `context` is null, removes all callbacks
  // with that function. If `callback` is null, removes all callbacks for the
  // event. If `events` is null, removes all bound callbacks for all events.
  Events.prototype.off = function(events, callback, context) {
    var cache, event, list, i

    // No events, or removing *all* events.
    if (!(cache = this.__events)) return this
    if (!(events || callback || context)) {
      delete this.__events
      return this
    }

    events = events ? events.split(eventSplitter) : keys(cache)

    // Loop through the callback list, splicing where appropriate.
    while (event = events.shift()) {
      list = cache[event]
      if (!list) continue

      if (!(callback || context)) {
        delete cache[event]
        continue
      }

      for (i = list.length - 2; i >= 0; i -= 2) {
        if (!(callback && list[i] !== callback ||
            context && list[i + 1] !== context)) {
          list.splice(i, 2)
        }
      }
    }

    return this
  }


  // Trigger one or many events, firing all bound callbacks. Callbacks are
  // passed the same arguments as `trigger` is, apart from the event name
  // (unless you're listening on `"all"`, which will cause your callback to
  // receive the true name of the event as the first argument).
  Events.prototype.trigger = function(events) {
    var cache, event, all, list, i, len, rest = [], args, returned = true;
    if (!(cache = this.__events)) return this

    events = events.split(eventSplitter)

    // Fill up `rest` with the callback arguments.  Since we're only copying
    // the tail of `arguments`, a loop is much faster than Array#slice.
    for (i = 1, len = arguments.length; i < len; i++) {
      rest[i - 1] = arguments[i]
    }

    // For each event, walk through the list of callbacks twice, first to
    // trigger the event, then to trigger any `"all"` callbacks.
    while (event = events.shift()) {
      // Copy callback lists to prevent modification.
      if (all = cache.all) all = all.slice()
      if (list = cache[event]) list = list.slice()

      // Execute event callbacks.
      returned = triggerEvents(list, rest, this) && returned

      // Execute "all" callbacks.
      returned = triggerEvents(all, [event].concat(rest), this) && returned
    }

    return returned
  }

  Events.prototype.emit = Events.prototype.trigger

  // Mix `Events` to object instance or Class function.
  Events.mixTo = function(receiver) {
    receiver = isFunction(receiver) ? receiver.prototype : receiver
    var proto = Events.prototype

    for (var p in proto) {
      if (proto.hasOwnProperty(p)) {
        receiver[p] = proto[p]
      }
    }
  }


  // Helpers
  // -------

  var keys = Object.keys

  if (!keys) {
    keys = function(o) {
      var result = []

      for (var name in o) {
        if (o.hasOwnProperty(name)) {
          result.push(name)
        }
      }
      return result
    }
  }

  // Execute callbacks
  function triggerEvents(list, args, context) {
    if (list) {
      var i = 0, l = list.length, a1 = args[0], a2 = args[1], a3 = args[2], pass = true
      // call is faster than apply, optimize less than 3 argu
      // http://blog.csdn.net/zhengyinhui100/article/details/7837127
      switch (args.length) {
        case 0: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context) !== false && pass} break;
        case 1: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1) !== false && pass} break;
        case 2: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2) !== false && pass} break;
        case 3: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2, a3) !== false && pass} break;
        default: for (; i < l; i += 2) {pass = list[i].apply(list[i + 1] || context, args) !== false && pass} break;
      }
    }
    // trigger will return false if one of the callbacks return false
    return pass;
  }

  function isFunction(func) {
    return Object.prototype.toString.call(func) === '[object Function]'
  }

  return Events
});

var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

(function(root, factory) {
  if (typeof exports === 'object') {
    return module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    return define('muplayer/core/playlist',['muplayer/core/utils', 'muplayer/lib/events'], factory);
  } else {
    return root._mu.Playlist = factory(_mu.utils, _mu.Events);
  }
})(this, function(utils, Events) {
  var Playlist;
  Playlist = (function() {
    function Playlist(options) {
      this.opts = $.extend({}, this.defaults, options);
      this.reset();
    }

    Playlist.prototype.reset = function() {
      this.cur = '';
      if ($.isArray(this.list)) {
        return this.list.length = 0;
      } else {
        return this.list = [];
      }
    };

    Playlist.prototype._resetListRandom = function(index) {
      var _i, _ref, _results;
      if (this.mode === 'list-random') {
        index = index || 0;
        this._listRandomIndex = index;
        this._listRandom = utils.shuffle((function() {
          _results = [];
          for (var _i = 0, _ref = this.list.length; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
          return _results;
        }).apply(this));
        return this.cur = this.list[this._listRandom[index]];
      }
    };

    Playlist.prototype._formatSid = function(sids) {
      var absoluteUrl, format, sid;
      absoluteUrl = this.opts.absoluteUrl;
      format = function(sid) {
        return absoluteUrl && utils.toAbsoluteUrl(sid) || '' + sid;
      };
      return $.isArray(sids) && ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = sids.length; _i < _len; _i++) {
          sid = sids[_i];
          if (sid) {
            _results.push(format(sid));
          }
        }
        return _results;
      })()) || format(sids);
    };

    Playlist.prototype.setMode = function(mode) {
      if (mode === 'single' || mode === 'random' || mode === 'list-random' || mode === 'list' || mode === 'loop') {
        this.mode = mode;
      }
      return this._resetListRandom();
    };

    Playlist.prototype.add = function(sid) {
      sid = this._formatSid(sid);
      this.remove(sid);
      if ($.isArray(sid) && sid.length) {
        this.list = sid.concat(this.list);
      } else if (sid) {
        this.list.unshift(sid);
      }
      this.trigger('playlist:add', sid);
      return this._resetListRandom();
    };

    Playlist.prototype.remove = function(sid) {
      var id, remove, _i, _len;
      remove = (function(_this) {
        return function(sid) {
          var i;
          i = $.inArray(sid, _this.list);
          if (i !== -1) {
            return _this.list.splice(i, 1);
          }
        };
      })(this);
      sid = this._formatSid(sid);
      if ($.isArray(sid)) {
        for (_i = 0, _len = sid.length; _i < _len; _i++) {
          id = sid[_i];
          remove(id);
        }
      } else {
        remove(sid);
      }
      this.trigger('playlist:remove', sid);
      return this._resetListRandom();
    };

    Playlist.prototype.prev = function() {
      var i, l, list, prev;
      list = this.list;
      i = $.inArray(this.cur, list);
      l = list.length;
      prev = i - 1;
      switch (this.mode) {
        case 'single':
          prev = i;
          break;
        case 'random':
          prev = utils.random(0, l - 1);
          break;
        case 'list':
          if (i = 0) {
            this.cur = list[0];
            return false;
          }
          break;
        case 'list-random':
          i = this._listRandomIndex--;
          prev = i - 1;
          if (i === 0) {
            prev = l - 1;
            this._resetListRandom(prev);
          }
          return this.cur = list[this._listRandom[prev]];
        case 'loop':
          if (i === 0) {
            prev = l - 1;
          }
      }
      return this.cur = list[prev];
    };

    Playlist.prototype.next = function() {
      var i, l, list, next;
      list = this.list;
      i = $.inArray(this.cur, list);
      l = list.length;
      next = i + 1;
      switch (this.mode) {
        case 'single':
          next = i;
          break;
        case 'random':
          next = utils.random(0, l - 1);
          break;
        case 'list':
          if (i === l - 1) {
            this.cur = list[0];
            return false;
          }
          break;
        case 'list-random':
          i = this._listRandomIndex++;
          next = i + 1;
          if (i === l - 1) {
            next = 0;
            this._resetListRandom(next);
          }
          return this.cur = list[this._listRandom[next]];
        case 'loop':
          if (i === l - 1) {
            next = 0;
          }
      }
      return this.cur = list[next];
    };

    Playlist.prototype.setCur = function(sid) {
      sid = sid + '';
      if (__indexOf.call(this.list, sid) < 0) {
        this.add(sid);
      }
      return this.cur = '' + sid;
    };

    return Playlist;

  })();
  Events.mixTo(Playlist);
  return Playlist;
});

var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

(function(root, factory) {
  if (typeof exports === 'object') {
    return module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    return define('muplayer/core/engines/engineCore',['muplayer/core/cfg', 'muplayer/core/utils', 'muplayer/lib/events'], factory);
  } else {
    return root._mu.EngineCore = factory(_mu.cfg, _mu.utils, _mu.Events);
  }
})(this, function(cfg, utils, Events) {
  var EVENTS, EngineCore, STATES, availableStates, k, v, _ref;
  _ref = cfg.engine, EVENTS = _ref.EVENTS, STATES = _ref.STATES;
  availableStates = (function() {
    var _results;
    _results = [];
    for (k in STATES) {
      v = STATES[k];
      _results.push(v);
    }
    return _results;
  })();
  EngineCore = (function() {
    function EngineCore() {}

    EngineCore.prototype._supportedTypes = [];

    EngineCore.prototype.getSupportedTypes = function() {
      return this._supportedTypes;
    };

    EngineCore.prototype.canPlayType = function(type) {
      return $.inArray(type, this.getSupportedTypes()) !== -1;
    };

    EngineCore.prototype.reset = function() {
      this.stop();
      this.setUrl();
      return this.setState(STATES.NOT_INIT);
    };

    EngineCore.prototype.play = function() {
      return this;
    };

    EngineCore.prototype.pause = function() {
      return this;
    };

    EngineCore.prototype.stop = function() {
      return this;
    };

    EngineCore.prototype.setUrl = function(url) {
      if (url == null) {
        url = '';
      }
      this._url = url;
      return this;
    };

    EngineCore.prototype.getUrl = function() {
      return this._url;
    };

    EngineCore.prototype.setState = function(st) {
      var oldState;
      if (__indexOf.call(availableStates, st) >= 0 && st !== this._state) {
        oldState = this._state;
        this._state = st;
        return this.trigger(EVENTS.STATECHANGE, {
          oldState: oldState,
          newState: st
        });
      }
    };

    EngineCore.prototype.getState = function() {
      return this._state;
    };

    EngineCore.prototype.setVolume = function(volume) {
      this._volume = volume;
      return this;
    };

    EngineCore.prototype.getVolume = function() {
      return this._volume;
    };

    EngineCore.prototype.setMute = function(mute) {
      this._mute = mute;
      return this;
    };

    EngineCore.prototype.getMute = function() {
      return this._mute;
    };

    EngineCore.prototype.setCurrentPosition = function(ms) {
      return this;
    };

    EngineCore.prototype.getCurrentPosition = function() {
      return 0;
    };

    EngineCore.prototype.getLoadedPercent = function() {
      return 0;
    };

    EngineCore.prototype.getTotalTime = function() {
      return 0;
    };

    return EngineCore;

  })();
  Events.mixTo(EngineCore);
  return EngineCore;
});

// Modernizr 2.7.1 (Custom Build) | MIT & BSD
// Build: http://modernizr.com/download/#-audio
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define('muplayer/lib/modernizr.audio',factory);
    } else {
        root._mu.Modernizr = factory();
    }
})(this, function () {
    return (function( window, document, undefined ) {

        var version = '2.7.1',

        Modernizr = {},


        docElement = document.documentElement,

        mod = 'modernizr',
        modElem = document.createElement(mod),
        mStyle = modElem.style,

        inputElem  ,


        toString = {}.toString,    tests = {},
        inputs = {},
        attrs = {},

        classes = [],

        slice = classes.slice,

        featureName,



        _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

        if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
          hasOwnProp = function (object, property) {
            return _hasOwnProperty.call(object, property);
          };
        }
        else {
          hasOwnProp = function (object, property) {
            return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
          };
        }


        if (!Function.prototype.bind) {
          Function.prototype.bind = function bind(that) {

            var target = this;

            if (typeof target != "function") {
                throw new TypeError();
            }

            var args = slice.call(arguments, 1),
                bound = function () {

                if (this instanceof bound) {

                  var F = function(){};
                  F.prototype = target.prototype;
                  var self = new F();

                  var result = target.apply(
                      self,
                      args.concat(slice.call(arguments))
                  );
                  if (Object(result) === result) {
                      return result;
                  }
                  return self;

                } else {

                  return target.apply(
                      that,
                      args.concat(slice.call(arguments))
                  );

                }

            };

            return bound;
          };
        }

        function setCss( str ) {
            mStyle.cssText = str;
        }

        function setCssAll( str1, str2 ) {
            return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
        }

        function is( obj, type ) {
            return typeof obj === type;
        }

        function contains( str, substr ) {
            return !!~('' + str).indexOf(substr);
        }


        function testDOMProps( props, obj, elem ) {
            for ( var i in props ) {
                var item = obj[props[i]];
                if ( item !== undefined) {

                                if (elem === false) return props[i];

                                if (is(item, 'function')){
                                    return item.bind(elem || obj);
                    }

                                return item;
                }
            }
            return false;
        }

        tests['audio'] = function() {
            var elem = document.createElement('audio'),
                bool = false;

            try {
                if ( bool = !!elem.canPlayType ) {
                    bool      = new Boolean(bool);
                    bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                    bool.mp3  = elem.canPlayType('audio/mpeg;')               .replace(/^no$/,'');

                                                        bool.wav  = elem.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                    bool.m4a  = ( elem.canPlayType('audio/x-m4a;')            ||
                                  elem.canPlayType('audio/aac;'))             .replace(/^no$/,'');
                }
            } catch(e) { }

            return bool;
        };    for ( var feature in tests ) {
            if ( hasOwnProp(tests, feature) ) {
                                        featureName  = feature.toLowerCase();
                Modernizr[featureName] = tests[feature]();

                classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
            }
        }



         Modernizr.addTest = function ( feature, test ) {
           if ( typeof feature == 'object' ) {
             for ( var key in feature ) {
               if ( hasOwnProp( feature, key ) ) {
                 Modernizr.addTest( key, feature[ key ] );
               }
             }
           } else {

             feature = feature.toLowerCase();

             if ( Modernizr[feature] !== undefined ) {
                                                  return Modernizr;
             }

             test = typeof test == 'function' ? test() : test;

             if (typeof enableClasses !== "undefined" && enableClasses) {
               docElement.className += ' ' + (test ? '' : 'no-') + feature;
             }
             Modernizr[feature] = test;

           }

           return Modernizr;
         };


        setCss('');
        modElem = inputElem = null;


        Modernizr._version      = version;


        return Modernizr;

    })(this, this.document);
});

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

(function(root, factory) {
  if (typeof exports === 'object') {
    return module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    return define('muplayer/core/engines/audioCore',['muplayer/core/cfg', 'muplayer/core/utils', 'muplayer/core/engines/engineCore', 'muplayer/lib/modernizr.audio'], factory);
  } else {
    return root._mu.AudioCore = factory(_mu.cfg, _mu.utils, _mu.EngineCore, _mu.Modernizr);
  }
})(this, function(cfg, utils, EngineCore, Modernizr) {
  var AudioCore, ERRCODE, EVENTS, STATES, TYPES, win, _ref;
  win = window;
  _ref = cfg.engine, TYPES = _ref.TYPES, EVENTS = _ref.EVENTS, STATES = _ref.STATES, ERRCODE = _ref.ERRCODE;
  AudioCore = (function(_super) {
    __extends(AudioCore, _super);

    AudioCore.defaults = {
      confidence: 'maybe',
      preload: false,
      autoplay: false,
      needPlayEmpty: true,
      emptyMP3: 'empty.mp3'
    };

    AudioCore.prototype._supportedTypes = [];

    AudioCore.prototype.engineType = TYPES.AUDIO;

    function AudioCore(options) {
      var audio, k, least, levels, opts, playEmpty, v;
      this.opts = $.extend({}, AudioCore.defaults, options);
      this.opts.emptyMP3 = this.opts.baseDir + this.opts.emptyMP3;
      opts = this.opts;
      levels = {
        '': 0,
        maybe: 1,
        probably: 2
      };
      least = levels[opts.confidence];
      audio = Modernizr.audio;
      if (!audio) {
        return this;
      }
      for (k in audio) {
        v = audio[k];
        if (levels[v] >= least) {
          this._supportedTypes.push(k);
        }
      }
      audio = new Audio();
      audio.preload = opts.preload;
      audio.autoplay = opts.autoplay;
      audio.loop = false;
      audio.on = (function(_this) {
        return function(type, listener) {
          audio.addEventListener(type, listener, false);
          return audio;
        };
      })(this);
      audio.off = (function(_this) {
        return function(type, listener) {
          audio.removeEventListener(type, listener, false);
          return audio;
        };
      })(this);
      this.audio = audio;
      this._needCanPlay(['play', 'setCurrentPosition']);
      this.setState(STATES.NOT_INIT);
      this._initEvents();
      if (opts.needPlayEmpty) {
        playEmpty = (function(_this) {
          return function() {
            _this.setUrl(opts.emptyMP3).play();
            return win.removeEventListener('touchstart', playEmpty, false);
          };
        })(this);
        win.addEventListener('touchstart', playEmpty, false);
      }
    }

    AudioCore.prototype._test = function(trigger) {
      if (!Modernizr.audio || !this._supportedTypes.length) {
        return false;
      }
      trigger && this.trigger(EVENTS.INIT_FAIL, this.engineType);
      return true;
    };

    AudioCore.prototype._initEvents = function() {
      var buffer, progressTimer, trigger;
      trigger = this.trigger;
      this.trigger = (function(_this) {
        return function(type, listener) {
          if (_this.getUrl() !== _this.opts.emptyMP3) {
            return trigger.call(_this, type, listener);
          }
        };
      })(this);
      buffer = (function(_this) {
        return function(per) {
          _this.setState(STATES.BUFFERING);
          return _this.trigger(EVENTS.PROGRESS, per || _this.getLoadedPercent());
        };
      })(this);
      progressTimer = null;
      return this.audio.on('loadstart', (function(_this) {
        return function() {
          var audio;
          audio = _this.audio;
          progressTimer = setInterval(function() {
            if (audio.readyState > 1) {
              return clearInterval(progressTimer);
            }
            return buffer();
          }, 50);
          return _this.setState(STATES.PREBUFFER);
        };
      })(this)).on('playing', (function(_this) {
        return function() {
          return _this.setState(STATES.PLAYING);
        };
      })(this)).on('pause', (function(_this) {
        return function() {
          return _this.setState(_this.getCurrentPosition() && STATES.PAUSE || STATES.STOP);
        };
      })(this)).on('ended', (function(_this) {
        return function() {
          return _this.setState(STATES.END);
        };
      })(this)).on('error', (function(_this) {
        return function() {
          _this.setState(STATES.END);
          return _this.trigger(EVENTS.ERROR, ERRCODE.MEDIA_ERR_NETWORK);
        };
      })(this)).on('waiting', (function(_this) {
        return function() {
          return _this.setState(_this.getCurrentPosition() && STATES.BUFFERING || STATES.PREBUFFER);
        };
      })(this)).on('timeupdate', (function(_this) {
        return function() {
          return _this.trigger(EVENTS.POSITIONCHANGE, _this.getCurrentPosition());
        };
      })(this)).on('progress', function(e) {
        var loaded, total;
        clearInterval(progressTimer);
        loaded = e.loaded || 0;
        total = e.total || 1;
        return buffer(loaded && (loaded / total).toFixed(2) * 1);
      });
    };

    AudioCore.prototype._needCanPlay = function(fnames) {
      var audio, name, _i, _len, _results;
      audio = this.audio;
      _results = [];
      for (_i = 0, _len = fnames.length; _i < _len; _i++) {
        name = fnames[_i];
        _results.push(this[name] = utils.wrap(this[name], (function(_this) {
          return function() {
            var args, fn, handle;
            fn = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
            if (audio.readyState < 3) {
              handle = function() {
                fn.apply(_this, args);
                return audio.off('canplay', handle);
              };
              audio.on('canplay', handle);
            } else {
              fn.apply(_this, args);
            }
            return _this;
          };
        })(this)));
      }
      return _results;
    };

    AudioCore.prototype.play = function() {
      this.audio.play();
      return this;
    };

    AudioCore.prototype.pause = function() {
      this.audio.pause();
      return this;
    };

    AudioCore.prototype.stop = function() {
      try {
        this.audio.currentTime = 0;
      } catch (_error) {

      } finally {
        this.pause();
      }
      return this;
    };

    AudioCore.prototype.setUrl = function(url) {
      if (url == null) {
        url = '';
      }
      this.audio.src = url;
      this.audio.load();
      return AudioCore.__super__.setUrl.call(this, url);
    };

    AudioCore.prototype.setVolume = function(volume) {
      this.audio.volume = volume / 100;
      return AudioCore.__super__.setVolume.call(this, volume);
    };

    AudioCore.prototype.setMute = function(mute) {
      this.audio.muted = mute;
      return AudioCore.__super__.setMute.call(this, mute);
    };

    AudioCore.prototype.setCurrentPosition = function(ms) {
      try {
        this.audio.currentTime = ms / 1000;
      } catch (_error) {

      } finally {
        this.play();
      }
      return this;
    };

    AudioCore.prototype.getCurrentPosition = function() {
      return this.audio.currentTime * 1000;
    };

    AudioCore.prototype.getLoadedPercent = function() {
      var audio, be, bl, buffered, duration, _ref1;
      audio = this.audio;
      duration = audio.duration;
      buffered = audio.buffered;
      bl = buffered.length;
      be = 0;
      while (bl--) {
        if ((buffered.start(bl) <= (_ref1 = audio.currentTime) && _ref1 <= buffered.end(bl))) {
          be = buffered.end(bl);
          break;
        }
      }
      be = be > duration ? duration : be;
      return duration && (be / duration).toFixed(2) * 1 || 0;
    };

    AudioCore.prototype.getTotalTime = function() {
      var duration;
      duration = this.audio.duration;
      return duration && duration * 1000 || 0;
    };

    return AudioCore;

  })(EngineCore);
  return AudioCore;
});

(function(root, factory) {
  if (typeof exports === 'object') {
    return module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    return define('muplayer/core/engines/engine',[
            'muplayer/core/cfg'
            , 'muplayer/core/utils'
            , 'muplayer/lib/events'
            , 'muplayer/core/engines/engineCore'
            , 'muplayer/core/engines/audioCore'
                    ], factory);
  } else {
    return root._mu.Engine = factory(
            _mu.cfg
            , _mu.utils
            , _mu.Events
            , _mu.EngineCore
            , _mu.AudioCore
                    );
  }
})(this, function(cfg, utils, Events, EngineCore, AudioCore, FlashMP3Core, FlashMP4Core) {
  var EVENTS, Engine, STATES, extReg, timerResolution, _ref;
  _ref = cfg.engine, EVENTS = _ref.EVENTS, STATES = _ref.STATES;
  timerResolution = cfg.timerResolution;
  extReg = /\.(\w+)(\?.*)?$/;
  Engine = (function() {
    Engine.el = '<div id="muplayer_container_{{DATETIME}}" style="width: 1px; height: 1px; overflow: hidden"></div>';

    Engine.prototype.defaults = {
      engines: [
                {
                    constructor: AudioCore
                }
                            ]
    };

    function Engine(options) {
      this.opts = $.extend({}, this.defaults, options);
      this._initEngines();
    }

    Engine.prototype._initEngines = function() {
      var $el, args, constructor, engine, i, opts, _i, _len, _ref1;
      this.engines = [];
      opts = this.opts;
      $el = $(Engine.el.replace(/{{DATETIME}}/g, +new Date())).appendTo('body');
      _ref1 = opts.engines;
      for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
        engine = _ref1[i];
        constructor = engine.constructor;
        args = engine.args || {};
        args.baseDir = opts.baseDir;
        args.$el = $el;
        try {
          if (!$.isFunction(constructor)) {
            constructor = eval(constructor);
          }
          engine = new constructor(args);
        } catch (_error) {
          throw "Missing constructor: " + (String(engine.constructor));
        }
        if (engine._test()) {
          this.engines.push(engine);
        }
      }
      if (this.engines.length) {
        return this.setEngine(this.engines[0]);
      } else {
        return this.setEngine(new EngineCore);
      }
    };

    Engine.prototype.setEngine = function(engine) {
      var bindEvents, errorHandle, oldEngine, positionHandle, progressHandle, statechangeHandle, unbindEvents;
      this._lastE = {};
      statechangeHandle = (function(_this) {
        return function(e) {
          if (e.oldState === _this._lastE.oldState && e.newState === _this._lastE.newState) {
            return;
          }
          _this._lastE = {
            oldState: e.oldState,
            newState: e.newState
          };
          return _this.trigger(EVENTS.STATECHANGE, e);
        };
      })(this);
      positionHandle = (function(_this) {
        return function(pos) {
          return _this.trigger(EVENTS.POSITIONCHANGE, pos);
        };
      })(this);
      progressHandle = (function(_this) {
        return function(progress) {
          return _this.trigger(EVENTS.PROGRESS, progress);
        };
      })(this);
      errorHandle = (function(_this) {
        return function(e) {
          return _this.trigger(EVENTS.ERROR, e);
        };
      })(this);
      bindEvents = function(engine) {
        return engine.on(EVENTS.STATECHANGE, statechangeHandle).on(EVENTS.POSITIONCHANGE, positionHandle).on(EVENTS.PROGRESS, progressHandle).on(EVENTS.ERROR, errorHandle);
      };
      unbindEvents = function(engine) {
        return engine.off(EVENTS.STATECHANGE, statechangeHandle).off(EVENTS.POSITIONCHANGE, positionHandle).off(EVENTS.PROGRESS, progressHandle).on(EVENTS.ERROR, errorHandle);
      };
      if (!this.curEngine) {
        return this.curEngine = bindEvents(engine);
      } else if (this.curEngine !== engine) {
        oldEngine = this.curEngine;
        unbindEvents(oldEngine).reset();
        this.curEngine = bindEvents(engine);
        return this.curEngine.setVolume(oldEngine.getVolume()).setMute(oldEngine.getMute());
      }
    };

    Engine.prototype.canPlayType = function(type) {
      return $.inArray(type, this.getSupportedTypes()) !== -1;
    };

    Engine.prototype.getSupportedTypes = function() {
      var engine, types, _i, _len, _ref1;
      types = [];
      _ref1 = this.engines;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        engine = _ref1[_i];
        types = types.concat(engine.getSupportedTypes());
      }
      return types;
    };

    Engine.prototype.switchEngineByType = function(type) {
      var engine, match, _i, _len, _ref1;
      match = false;
      _ref1 = this.engines;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        engine = _ref1[_i];
        if (engine.canPlayType(type)) {
          this.setEngine(engine);
          match = true;
          break;
        }
      }
      if (!match) {
        return this.setEngine(this.engines[0]);
      }
    };

    Engine.prototype.reset = function() {
      this.curEngine.reset();
      return this;
    };

    Engine.prototype.setUrl = function(url) {
      var ext;
      if (extReg.test(url)) {
        ext = RegExp.$1.toLocaleLowerCase();
      }
      if (this.canPlayType(ext)) {
        if (!this.curEngine.canPlayType(ext)) {
          this.switchEngineByType(ext);
        }
      } else {
        throw "Can not play with: " + ext;
      }
      this.curEngine.setUrl(url);
      return this;
    };

    Engine.prototype.getUrl = function() {
      return this.curEngine.getUrl();
    };

    Engine.prototype.play = function() {
      this.curEngine.play();
      return this;
    };

    Engine.prototype.pause = function() {
      this.curEngine.pause();
      this.setState(STATES.PAUSE);
      return this;
    };

    Engine.prototype.stop = function() {
      this.curEngine.stop();
      this.setState(STATES.STOP);
      return this;
    };

    Engine.prototype.setState = function(st) {
      this.curEngine.setState(st);
      return this;
    };

    Engine.prototype.getState = function() {
      return this.curEngine.getState();
    };

    Engine.prototype.setMute = function(mute) {
      this.curEngine.setMute(!!mute);
      return this;
    };

    Engine.prototype.getMute = function() {
      return this.curEngine.getMute();
    };

    Engine.prototype.setVolume = function(volume) {
      if ($.isNumeric(volume) && volume >= 0 && volume <= 100) {
        this.curEngine.setVolume(volume);
      }
      return this;
    };

    Engine.prototype.getVolume = function() {
      return this.curEngine.getVolume();
    };

    Engine.prototype.setCurrentPosition = function(ms) {
      ms = ~~ms;
      this.curEngine.setCurrentPosition(ms);
      return this;
    };

    Engine.prototype.getCurrentPosition = function() {
      return this.curEngine.getCurrentPosition();
    };

    Engine.prototype.getLoadedPercent = function() {
      return this.curEngine.getLoadedPercent();
    };

    Engine.prototype.getTotalTime = function() {
      return this.curEngine.getTotalTime();
    };

    Engine.prototype.getEngineType = function() {
      return this.curEngine.engineType;
    };

    Engine.prototype.getState = function() {
      return this.curEngine.getState();
    };

    return Engine;

  })();
  Events.mixTo(Engine);
  return Engine;
});

(function(root, factory) {
  if (typeof exports === 'object') {
    return module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    return define('muplayer/player',['muplayer/core/cfg', 'muplayer/core/utils', 'muplayer/lib/events', 'muplayer/core/playlist', 'muplayer/core/engines/engine'], factory);
  } else {
    return root._mu.Player = factory(root._mu.cfg, root._mu.utils, root._mu.Events, root._mu.Playlist, root._mu.Engine);
  }
})(this, function(cfg, utils, Events, Playlist, Engine) {
  var EVENTS, Player, STATES, time2str, _ref;
  _ref = cfg.engine, EVENTS = _ref.EVENTS, STATES = _ref.STATES;
  time2str = utils.time2str;

  /**
   * muplayer的Player类（对应player.js）是对外暴露的接口，它封装了音频操作及播放列表（Playlist）逻辑，并屏蔽了对音频内核适配的细节对音频内核适配的细节。
   * <b>对一般应用场景，只需签出编译后的 <code>dist/js/player.min.js</code> 即可</b>。
   * 文档中 <code>player</code> 指代Player的实例。
   */
  Player = (function() {
    var instance;

    instance = null;

    Player.defaults = {
      baseDir: "" + cfg.cdn + cfg.version,
      mode: 'loop',
      mute: false,
      volume: 80,
      singleton: true,
      absoluteUrl: true
    };


    /**
     * Player初始化方法
     * @param {Object} options <table class="sub-params">
     *  <tr>
     *    <th>选项</th>
     *    <th>说明</th>
     *  </tr>
     *  <tr>
     *    <td>baseDir</td>
     *    <td>必填选项，指向MuPlayer编译后的静态文件资源目录。默认指向同版本线上CDN文件目录，但建议指向自己签出的dist文件夹目录，以规避潜在的flash跨域警告。</td>
     *  </tr>
     *  <tr>
     *    <td>mode</td>
     *    <td>默认值: 'loop'。加入播放器的歌曲列表的播放顺序逻辑，可选值为 'loop'（循环播放），'list'（列表播放，该列表播放到最后一首或第一首后则停止播放），'single'（单曲播放），'random'（单曲随机），'list-random'（列表随机，与random的区别是保证已随机过的列表中歌曲均播放一次后，再对列表随机重置）。</td>
     *  </tr>
     *  <tr>
     *    <td>mute</td>
     *    <td>默认值: false。是否静音。</td>
     *  </tr>
     *  <tr>
     *    <td>volume</td>
     *    <td>默认值: 80。播放音量，取值范围0 - 100。</td>
     *  </tr>
     *  <tr>
     *    <td>singleton</td>
     *    <td>默认值: true。初始化的Player实例是否是单实例。如果希望一个页面中有多个播放实例并存，可以设成false</td>
     *  </tr>
     *  <tr>
     *    <td>absoluteUrl</td>
     *    <td>默认值: true。播放音频的链接是否要自动转化成绝对地址。</td>
     *  </tr>
     *  <tr>
     *    <td>engines</td>
     *    <td>初始化Engine，根据传入的engines来指定具体使用FlashMP3Core还是AudioCore来接管播放，当然也可以传入内核列表，Engine会内核所支持的音频格式做自适应。这里只看一下engines参数的可能值（其他参数一般无需配置，如有需要请查看engine.coffee的源码）：
     *    <pre>
     *    [{<br>
     *    <span class="ts"></span>constructor: 'FlashMP3Core',<br>
     *    <span class="ts"></span>args: { // 初始化FlashMP3Core的参数<br>
     *    <span class="ts2"></span>swf: 'muplayer_mp3.swf' // 对应的swf文件路径<br>
     *    <span class="ts"></span>}<br>
     *    }, {<br>
     *    <span class="ts"></span>constructor: 'FlashMP4Core',<br>
     *    <span class="ts"></span>args: { // 初始化FlashMP4Core的参数, FlashMP4Core支持m4a格式的音频文件<br>
     *    <span class="ts2"></span>swf: 'muplayer_mp4.swf' // 对应的swf文件路径<br>
     *    <span class="ts"></span>}<br>
     *    }, {<br>
     *    <span class="ts"></span>constructor: 'AudioCore'<br>
     *    }]
     *    </pre>
     *    </td>
     *  </tr></table>
     */

    function Player(options) {
      var baseDir, opts;
      this.opts = opts = $.extend({}, Player.defaults, options);
      baseDir = opts.baseDir;
      if (baseDir === false) {
        baseDir = '';
      } else if (!baseDir) {
        throw "baseDir must be set! Usually, it should point to the MuPlayer's dist directory.";
      }
      if (baseDir && !baseDir.endsWith('/')) {
        baseDir = baseDir + '/';
      }
      if (opts.singleton) {
        if (instance) {
          return instance;
        }
        instance = this;
      }
      this.playlist = new Playlist({
        absoluteUrl: opts.absoluteUrl
      });
      this.playlist.setMode(opts.mode);
      this._initEngine(new Engine({
        baseDir: baseDir,
        engines: opts.engines
      }));
      this.setMute(opts.mute);
      this.setVolume(opts.volume);
    }

    Player.prototype._initEngine = function(engine) {
      return this.engine = engine.on(EVENTS.STATECHANGE, (function(_this) {
        return function(e) {
          var st;
          st = e.newState;
          _this.trigger(st);
          if (st === STATES.END) {
            return _this.next(true);
          }
        };
      })(this)).on(EVENTS.POSITIONCHANGE, (function(_this) {
        return function(pos) {
          return _this.trigger('timeupdate', pos);
        };
      })(this)).on(EVENTS.PROGRESS, (function(_this) {
        return function(progress) {
          return _this.trigger('progress', progress);
        };
      })(this)).on(EVENTS.ERROR, (function(_this) {
        return function(e) {
          return _this.trigger('error', e);
        };
      })(this));
    };


    /**
     * 若播放列表中有歌曲就开始播放。会派发 <code>player:play</code> 事件。
     * @param {Number} startTime 指定歌曲播放的起始位置，单位：毫秒。
     * @return {player}
     */

    Player.prototype.play = function(startTime) {
      var def, engine, play, _ref1;
      startTime = ~~startTime;
      def = $.Deferred();
      engine = this.engine;
      play = (function(_this) {
        return function() {
          if (startTime) {
            engine.setCurrentPosition(startTime);
          } else {
            engine.play();
          }
          _this.trigger('player:play', startTime);
          return def.resolve();
        };
      })(this);
      if ((_ref1 = this.getState()) === STATES.NOT_INIT || _ref1 === STATES.STOP || _ref1 === STATES.END) {
        this._fetch().done((function(_this) {
          return function() {
            return play();
          };
        })(this));
      } else {
        play();
      }
      return def.promise();
    };


    /**
     * 若player正在播放，则暂停播放 (这时，如果再执行play方法，则从暂停位置继续播放)。会派发 <code>player:pause</code> 事件。
     * @return {player}
     */

    Player.prototype.pause = function() {
      this.engine.pause();
      this.trigger('player:pause');
      return this;
    };


    /**
     * 停止播放，会将当前播放位置重置。即stop后执行play，将从音频头部重新播放。会派发 <code>player:stop</code> 事件。
     * @return {player}
     */

    Player.prototype.stop = function() {
      this.engine.stop();
      this.trigger('player:stop');
      return this;
    };


    /**
     * stop() + play()的快捷方式。
     * @return {player}
     */

    Player.prototype.replay = function() {
      return this.stop().play();
    };


    /**
     * 播放前一首歌。会派发 <code>player:prev</code> 事件，事件参数：
     * <pre>cur // 调用prev时正在播放的歌曲</pre>
     * @return {player}
     */

    Player.prototype.prev = function() {
      var cur;
      cur = this.getCur();
      this.stop();
      if (this.getSongsNum() && this.playlist.prev()) {
        this.trigger('player:prev', {
          cur: cur
        });
        this.play();
      }
      return this;
    };


    /**
     * 播放下一首歌。参数auto是布尔值，代表是否是因自动切歌而触发的（比如因为一首歌播放完会自动触发next方法，这时auto为true，其他主动调用auto应为undefined）。
     * 会派发 <code>player:next</code> 事件，事件参数：
     * <pre>auto // 是否为自动切歌
     * cur  // 调用next时正在播放的歌曲</pre>
     * @return {player}
     */

    Player.prototype.next = function(auto) {
      var cur;
      cur = this.getCur();
      this.stop();
      if (this.getSongsNum() && this.playlist.next()) {
        this.trigger('player:next', {
          auto: auto,
          cur: cur
        });
        this.play();
      }
      return this;
    };


    /**
     * 获取当前歌曲（根据业务逻辑和选链_fetch方法的具体实现可以是音频文件url，也可以是标识id，默认直接传入音频文件url即可）。
     * 如果之前没有主动执行过setCur，则认为播放列表的第一首歌是当前歌曲。
     * @return {String}
     */

    Player.prototype.getCur = function() {
      var cur, pl;
      pl = this.playlist;
      cur = pl.cur;
      if (!cur && this.getSongsNum()) {
        cur = pl.list[0];
        pl.setCur(cur);
      }
      return cur + '';
    };


    /**
     * 设置当前歌曲。
     * @param {String} sid 可以是音频文件url，也可以是音频文件id（如果是文件id，则要自己重写_fetch方法，决定如何根据id获得相应音频的实际地址）。
     * @return {player}
     */

    Player.prototype.setCur = function(sid) {
      var pl;
      pl = this.playlist;
      if (!sid && this.getSongsNum()) {
        sid = pl.list[0];
      }
      if (sid && this._sid !== sid) {
        pl.setCur(sid);
        this._sid = sid;
        this.stop();
      }
      return this;
    };


    /**
     * 当前播进度（单位秒）。
     * @return {Number}
     */

    Player.prototype.curPos = function(format) {
      var pos;
      pos = this.engine.getCurrentPosition() / 1000;
      if (format) {
        return time2str(pos);
      } else {
        return pos;
      }
    };


    /**
     * 单曲总时长（单位秒）。
     * @return {Number}
     */

    Player.prototype.duration = function(format) {
      var duration;
      duration = this.engine.getTotalTime() / 1000;
      if (format) {
        return time2str(duration);
      } else {
        return duration;
      }
    };


    /**
     * 将音频资源添加到播放列表
     * @param {String|Array} sid 要添加的单曲资源或标识，为数组则代表批量添加。会派发 <code>player:add</code> 事件。
     * @return {player}
     */

    Player.prototype.add = function(sid) {
      if (sid) {
        this.playlist.add(sid);
      }
      this.trigger('player:add', sid);
      return this;
    };


    /**
     * 从播放列表中移除指定资源，若移除资源后列表为空则触发reset。会派发 <code>player:remove</code> 事件。
     * @param {String|Array} sid 要移除的资源标识（与add方法参数相对应）。
     * @return {player}
     */

    Player.prototype.remove = function(sid) {
      if (sid) {
        this.playlist.remove(sid);
      }
      if (!this.getSongsNum()) {
        this.reset();
      }
      this.trigger('player:remove', sid);
      return this;
    };


    /**
     * 播放列表和内核资源重置。会派发 <code>player:reset</code> 事件。
     * 如有特别需要可以自行扩展，比如通过监听 <code>player:reset</code> 来重置相关业务逻辑的标志位或事件等。
     * @return {player}
     */

    Player.prototype.reset = function() {
      this.playlist.reset();
      this.engine.reset();
      this.trigger('player:reset');
      return this;
    };


    /**
     * 获取播放内核当前状态。所有可能状态值参见 <code>cfg.coffee</code> 中的 <code>engine.STATES</code> 声明。
     * @return {String}
     */

    Player.prototype.getState = function() {
      return this.engine.getState();
    };


    /**
     * 设置当前播放资源的url。一般而言，这个方法是私有方法，供_fetch等内部方法中调用，客户端无需关心。
     * 但出于调试和灵活性的考虑，依然之暴露为公共方法。
     * @param {String} url
     * @return {player}
     */

    Player.prototype.setUrl = function(url) {
      this.engine.setUrl(url);
      return this;
    };


    /**
     * 获取当前播放资源的url。
     * @return {String}
     */

    Player.prototype.getUrl = function() {
      return this.engine.getUrl();
    };


    /**
     * 设置播放器音量。
     * @param {Number} volume 合法范围：0 - 100，0是静音。注意volume与mute不会相互影响，即便setVolume(0)，getMute()的结果依然维持不变。反之亦然。
     */

    Player.prototype.setVolume = function(volume) {
      return this.engine.setVolume(volume);
    };


    /**
     * 获取播放器音量。返回值范围：0 - 100
     * @return {Number}
     */

    Player.prototype.getVolume = function() {
      return this.engine.getVolume();
    };


    /**
     * 设置是否静音。
     * @param {Boolean} mute true为静音，flase为不静音。
     * @return {player}
     */

    Player.prototype.setMute = function(mute) {
      this.engine.setMute(mute);
      return this;
    };


    /**
     * 获取静音状态。
     * @return {Boolean}
     */

    Player.prototype.getMute = function() {
      return this.engine.getMute();
    };


    /**
     * 检验内核是否支持播放指定的音频格式。
     * @param {String} type 标识音频格式（或音频文件后缀）的字符串，如'mp3', 'aac'等。
     * @return {Boolean}
     */

    Player.prototype.canPlayType = function(type) {
      return this.engine.canPlayType(type);
    };


    /**
     * 播放列表中的歌曲总数。这一个快捷方法，如有更多需求，可自行获取播放列表：player.playlist.list。
     * @return {Number}
     */

    Player.prototype.getSongsNum = function() {
      return this.playlist.list.length;
    };


    /**
     * 设置列表播放的模式。
     * @param {String} mode 可选值参见前文对初始化Player方法的options参数描述。
     * @return {player}
     */

    Player.prototype.setMode = function(mode) {
      this.playlist.setMode(mode);
      return this;
    };


    /**
     * 获取列表播放的模式。
     * @return {String}
     */

    Player.prototype.getMode = function() {
      return this.playlist.mode;
    };

    Player.prototype._fetch = function() {
      var def;
      def = $.Deferred();
      if (this.getUrl() === this.getCur()) {
        def.resolve();
      } else {
        setTimeout((function(_this) {
          return function() {
            _this.setUrl(_this.getCur());
            return def.resolve();
          };
        })(this), 0);
      }
      return def.promise();
    };

    return Player;

  })();
  Events.mixTo(Player);
  return Player;
});

