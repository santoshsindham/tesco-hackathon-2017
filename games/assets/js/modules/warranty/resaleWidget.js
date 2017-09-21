define(['domlib'], function($) {
    var $jq171 = $;
    var jq171 = $jq171;
    var $st = {};
    
    window.$st = $st || {};
    $st.namespace = function(a, b, c) {
            for (var d = a.split(b || "."), e = d.length, f = c || window, g = 0; e > g; g++) f = f[d[g]] = f[d[g]] || {};
            return f
        }, $st.resolve = function(a, b) {
            for (var c, d, e = a.split("."), f = b || window; c = e.shift();)
                if (d = c.match(/^([^[]+)?\[("|')?([^"']+)("|')?\]$/), f = d ? d[1] ? f[d[1]] && f[d[1]][d[3]] : f[d[3]] : f[c], !f) return null;
            return f
        }, $st.hasPropertiesSet = function(a) {
            for (var b in a)
                if (a.hasOwnProperty(b)) return !0;
            return !1
        }, $st.bind = function(a, b) {
            var c = "function" != typeof b;
            if (arguments.length > 2) {
                var d = Array.prototype.slice.call(arguments, 2);
                return function() {
                    return (c ? a[b] : b).apply(a, d.concat.apply(d, arguments))
                }
            }
            return function() {
                return (c ? a[b] : b).apply(a, arguments)
            }
        }, $st.copyProperties = function(a, b, c) {
            for (var d in a)(void 0 == b[d] || c === !0) && (b[d] = a[d])
        }, $st.defineClass = function(a, b) {
            var c;
            c = a.hasOwnProperty("_constructor") ? a._constructor : function() {
                b.apply(this, arguments), c.prototype.hasOwnProperty("_init") && c.prototype._init.apply(this, arguments)
            }, b = b || Object;
            var d = function() {};
            d.prototype = b.prototype, c.prototype = new d, c._super = b.prototype, c.prototype.constructor = c;
            for (var e in a) "_constructor" != e && a.hasOwnProperty(e) && (c.prototype[e] = a[e]);
            return c
        },
        $st.namespace("$st.event"), 
        $st.namespace("$st.core.event"), 
        $st.namespace("$st.core.logging"), 
        $st.event = $st.core.event, 
        $st.logging = $st.core.logging, 
        $st.dom = $st.core.dom, 
        $st.jquery = $jq171, 
        $st.utils = $st.core.utils, 
        $st.namespace("$st.core.utils"), 
        $st.core.utils.listContainsItem = function(a, b) {
            if (!a) return !1;
            for (var c = 0, d = a.length; d > c; c++)
                if (a[c] === b) return !0;
            return !1
        }, $st.namespace("$st.core.utils.string"), $st.core.utils.string.trim = function(a) {
            return a.replace(/^\s+|\s+$/g, "")
        }, $st.core.utils.string.toObject = function(a, b, c) {
            for (var d = a.split(b), e = {}, f = 0; f < d.length; f++) {
                var g = d[f].split(c);
                e[g[0]] = g[1]
            }
            return e
        }, String.prototype.trim || (String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, "")
        }), $st.namespace("$st.core.utils.object"), $st.core.utils.object.keys = function(a) {
            var b = [];
            if ("function" == typeof Object.keys) b = Object.keys(a);
            else {
                if ("object" != typeof a && "function" != typeof a) throw new TypeError("Requested keys of a value that is not an object.");
                for (var c in a) a.hasOwnProperty(c) && b.push(c)
            }
            return b
        }, $st.core.utils.object.copyOwnPropertiesToTargetFromSource = function(a, b) {
            if (!a || !b) return a;
            for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
            return a
        }, $st.core.utils.object.copy = function(a) {
            return $st.jquery.extend(!0, {}, a)
        }, $st.core.utils.object.merge = function(a, b) {
            var c = [!0];
            arguments[arguments.length - 1] === !1 && (c = []), c.push(a), c.push(b);
            for (var d = 2, e = arguments.length; e > d; d++) c.push(arguments[d]);
            return $st.jquery.extend.apply($st.jquery, c)
        }, $st.core.utils.object.isEmpty = function(a) {
            for (var b in a)
                if (a.hasOwnProperty(b)) return !1;
            return !0
        }, $st.core.utils.object.isArray = function(a) {
            return "[object Array]" === Object.prototype.toString.call(a)
        }, $st.core.utils.object.translate = function(a, b, c) {
            if (c in b)
                for (var d in b[c])
                    if (d in a)
                        if ("object" == typeof a[d])
                            if ("[object Array]" === Object.prototype.toString.call(a[d]))
                                for (var e = 0; e < a[d].length; e++) $st.core.utils.object.translate(a[d][e], b[c], d);
                            else $st.core.utils.object.translate(a[d], b[c], d);
            else a[b[c][d]] = a[d], delete a[d]
        }, $st.core.utils.object.transform = function(a, b) {
            var c, d = b.serializations,
                e = b.exclusions,
                f = null;
            for (var g in a)
                if ("object" == typeof a[g]) $st.core.utils.object.transform(a[g], b);
                else {
                    if (e)
                        for (c = 0; c < e.length; c++)
                            if (g == e[c]) {
                                delete a[g];
                                break
                            }
                    if (d)
                        for (c = 0; c < d.length; c++)
                            if (d[c].propertyName === g && (f = d[c].rules)) {
                                var h = a[g].split(f.delimiter);
                                for (c = 0; c < h.length; c++) a[f.label + c] = h[c];
                                delete a[g];
                                break
                            }
                }
        }, $st.namespace("$st.core.logging"), $st.core.logging.DEBUG = 1, $st.core.logging.INFO = 2, $st.core.logging.WARN = 3, $st.core.logging.ERROR = 4, $st.core.logging.NONE = 5, $st.core.logging.consoleLogLevel = $st.logging.NONE, $st.core.logging.documentLogLevel = $st.logging.NONE, $st.core.logging.documentLogElementID = "st_log_container", $st.core.logging.isLoggingEnabled = function(a) {
            return a <= $st.core.logging.consoleLogLevel || a <= $st.core.logging.documentLogLevel
        }, $st.core.logging.isDebuggingEnabled = function() {
            return $st.logging.consoleLogLevel <= $st.logging.DEBUG
        }, $st.core.logging.isDocumentDebuggingEnabled = function() {
            return $st.logging.documentLogLevel <= $st.logging.DEBUG
        }, $st.core.logging.log = function(a) {
            try {
                var b, c = a >= $st.core.logging.consoleLogLevel,
                    d = a >= $st.core.logging.documentLogLevel;
                if ((c || d) && (b = Array.prototype.slice.call(arguments), b.splice(0, 1)), c) try {
                    if (console) switch (a) {
                        case $st.core.logging.DEBUG:
                            console.log && console.log(b);
                            break;
                        case $st.core.logging.INFO:
                            console.info && console.info(b);
                            break;
                        case $st.core.logging.WARN:
                            console.warn && console.warn(b);
                            break;
                        case $st.core.logging.ERROR:
                            console.error && console.error(b)
                    }
                } catch (e) {}
                if (!d) return;
                if (!$st.core.logging.logElement) {
                    var f = document.getElementById($st.core.logging.documentLogElementID);
                    if ("span" != f.nodeName.toLowerCase() && "div" != f.nodeName.toLowerCase() && "p" != f.nodeName.toLowerCase()) return;
                    $st.core.logging.logElement = f
                }
                $st.core.logging.logElement && ($st.core.logging.logElement.innerHTML += b.join(" ") + "<br/>")
            } catch (g) {}
        }, $st.core.logging.debug = function() {
            if ($st.core.logging.isLoggingEnabled($st.core.logging.DEBUG)) {
                var a = Array.prototype.slice.call(arguments);
                a.unshift($st.core.logging.DEBUG), $st.core.logging.log.apply(null, a)
            }
        }, $st.core.logging.info = function() {
            if ($st.core.logging.isLoggingEnabled($st.core.logging.INFO)) {
                var a = Array.prototype.slice.call(arguments);
                a.unshift($st.core.logging.INFO), $st.core.logging.log.apply(null, a)
            }
        }, $st.core.logging.warn = function() {
            if ($st.core.logging.isLoggingEnabled($st.core.logging.WARN)) {
                var a = Array.prototype.slice.call(arguments);
                a.unshift($st.core.logging.WARN), $st.core.logging.log.apply(null, a)
            }
        }, $st.core.logging.error = function() {
            if ($st.core.logging.isLoggingEnabled($st.core.logging.ERROR)) {
                var a = Array.prototype.slice.call(arguments);
                a.unshift($st.core.logging.ERROR), $st.core.logging.log.apply(null, a)
            }
        }, $st.namespace("$st.core.event"), $st.core.event.addEvent = function(a, b, c, d) {
            if (a.addEventListener) return void a.addEventListener(b, c, d);
            var e = "on" + b;
            if (a.attachEvent) return void a.attachEvent(e, c);
            if (a._stEvents || (a._stEvents = {}), !a._stEvents[b]) {
                var f = [];
                a._stEvents[b] = f, a[e] = function(a, b, c) {
                    return function(d) {
                        d = d || {
                            type: b,
                            currentTarget: a,
                            target: a
                        };
                        for (var e = 0, f = c.length; f > e; e++) c[e].call(a, d)
                    }
                }(a, b, f)
            }
            a._stEvents[b].push(c)
        }, $st.core.event.removeEvent = function(a, b, c, d) {
            if (a.removeEventListener) return void a.removeEventListener(b, c, d);
            var e = "on" + b;
            if (a.removeEvent) return void a.removeEvent(e, c);
            if (a._stEvents) {
                var f = a._stEvents[b];
                if (f) {
                    for (var g = 0, h = f.length; h > g; g++)
                        if (f[g] === c) {
                            f.splice(g, 1);
                            break
                        }
                    f.length || delete a._stEvents[b]
                }
            }
        }, $st.core.event.eventSource = function(a) {
            return a.currentTarget || a.srcElement
        }, $st.core.event.Event = function(a) {
            this.name = a && a.name, this.e = a && a.e, this.target = this.getTarget() || a && a.target, this.srcElement = this.target, this.propagationStopped = a ? !!a.propagationStopped : this.isPropagationStopped(), this.defaultPrevented = a ? !!a.defaultPrevented : this.isDefaultPrevented(), this.data = a && a.data || {}, this.type = a && a.type, this.group = a && a.group, this.track = a && !!a.track
        }, $st.core.event.Event.prototype.getTarget = function() {
            return this.e ? this.e.target || this.e.srcElement : this.target
        }, $st.core.event.Event.prototype.getType = function() {
            return this.type ? this.type : this.e ? this.e.type.toLowerCase() : void 0
        }, $st.core.event.Event.prototype.setDataProperty = function(a, b) {
            var c = "";
            a && (c = a.toLowerCase(), "group" === c ? this[c] = b : (this.data || (this.data = {}), this.data[c] = b))
        }, $st.core.event.Event.prototype.getDataProperty = function(a) {
            var b = "",
                c = "";
            return a && (b = a.toLowerCase(), "group" === b ? c = this[b] : this.data && b in this.data && (c = this.data[b])), c
        }, $st.core.event.Event.prototype.setName = function(a) {
            this.name = a
        }, $st.core.event.Event.prototype.getName = function() {
            return this.name
        }, $st.core.event.Event.prototype.setGroup = function(a) {
            this.group = a
        }, $st.core.event.Event.prototype.getGroup = function() {
            return this.group
        }, $st.core.event.Event.prototype.stopPropagation = function() {
            this.propagationStopped = !0, this.e && (this.e.stopPropagation && "function" == typeof this.e.stopPropagation && this.e.stopPropagation(), this.e.cancelBubble = !0)
        }, $st.core.event.Event.prototype.isPropagationStopped = function() {
            return this.e && void 0 !== this.e.cancelBubble ? this.e.cancelBubble : this.propagationStopped
        }, $st.core.event.Event.prototype.preventDefault = function() {
            this.defaultPrevented = !0, this.e && (this.e.preventDefault && "function" == typeof this.e.preventDefault && this.e.preventDefault(), this.e.returnValue = !1)
        }, $st.core.event.Event.prototype.isDefaultPrevented = function() {
            if (this.e) {
                if (void 0 !== this.e.defaultPrevented) return this.e.defaultPrevented;
                if (void 0 !== this.e.returnValue) return !this.e.returnValue
            }
            return this.defaultPrevented
        }, $st.namespace("$st.core.event"), $st.core.event.EventRouter = function(a) {
            this.container = void 0 == a ? null : a.container, this.handler = void 0 == a ? this : a.handler || this, this.translators = {}, this.eventClassPrefix = void 0 == a ? null : a.eventClassPrefix || "st_fn_event", this.events = [], this.configs = [], this.activate($st.core.event.config), a && a.config && this.activate(a.config)
        }, $st.core.event.EventRouter.prototype.logger = $st.core.logging, $st.core.event.EventRouter.prototype.activate = function(a) {
            this.activateTranslators(a)
        }, $st.core.event.EventRouter.prototype.start = function() {
            this.container && this.listen(this.container)
        }, $st.core.event.EventRouter.prototype.activateTranslators = function(a) {
            if (a && a.events)
                for (var b in a.events) {
                    var c = !1,
                        d = a.events[b];
                    for (var e in d)
                        if ("input" === e.toLowerCase()) {
                            var f = d[e];
                            for (var g in f) {
                                var h = b.toLowerCase() + "_" + e.toLowerCase() + "_" + g;
                                this.translators[h] = f[g], c = !0
                            }
                        } else {
                            var i = b.toLowerCase() + "_" + e.toLowerCase();
                            this.translators[i] = d[e], c = !0
                        }
                    if (c)
                        if (this.events.indexOf) - 1 == this.events.indexOf(b) && this.events.push(b);
                        else {
                            for (var j = !1, k = 0; k < this.events.length; k++)
                                if (this.events[k] == b) {
                                    j = !0;
                                    break
                                }
                            j || this.events.push(b)
                        }
                }
        }, $st.core.event.EventRouter.prototype.registerTranslator = function(a) {
            var b = a.eventType,
                c = a.nodeName,
                d = a.inputType,
                e = a.eventTranslatorClass,
                f = event.toLowerCase() + "_" + c.toLowerCase();
            "input" === c.toLowerCase() && (f += "_" + d), this.translators[f] = e;
            for (var g = 0; g < this.events.length; g++)
                if (this.events[g] === b) return;
            this.events.push(b)
        }, $st.core.event.EventRouter.prototype.listen = function(a) {
            var b = this.events;
            this._boundOnEvent || (this._boundOnEvent = $st.bind(this, "onEvent"));
            for (var c = 0, d = b.length; d > c; c++) $st.core.event.addEvent(a, b[c], this._boundOnEvent);
            this.listeningContainers || (this.listeningContainers = []);
            var e = this.listeningContainers;
            $st.core.utils.listContainsItem(e, a) || e.push(a)
        }, $st.core.event.EventRouter.prototype.unListen = function(a) {
            for (var b = this.events, c = 0, d = b.length; d > c; c++) $st.core.event.removeEvent(a, b[c], this._boundOnEvent);
            var e = this.listeningContainers;
            for (c = 0, d = e.length; d > c; c++)
                if (e[c] === a) {
                    e.splice(c, 1);
                    break
                }
        }, $st.core.event.EventRouter.prototype.resolveTranslator = function(a, b) {
            return "function" == typeof b ? b : "string" != typeof b ? ($st.logging.error("EventRouter:resolveTranslator - invalid translator specified for key: " + a), null) : (b = $st.resolve(b)) ? (this.translators[a] = b, b) : null
        }, $st.core.event.EventRouter.prototype.getEventTranslatorClass = function(a) {
            var b = a.getType(),
                c = a.getTarget().nodeName,
                d = a.getTarget().type,
                e = "input" === c.toLowerCase(),
                f = b.toLowerCase() + "_" + c.toLowerCase();
            e && (f += "_" + (d ? d : "default"));
            var g = this.translators[f];
            return g ? this.resolveTranslator(f, g) : e && (f = b.toLowerCase() + "_" + c.toLowerCase() + "_default", g = this.translators[f]) ? this.resolveTranslator(f, g) : (f = b.toLowerCase() + "_default", g = this.translators[f], g ? this.resolveTranslator(f, g) : null)
        }, $st.core.event.EventRouter.prototype.getNameForEventType = function(a, b) {
            var c = new RegExp("\\b" + this.eventClassPrefix + "_" + b + "_(\\w+)\\b", "gi"),
                d = c.exec(a);
            return d ? d[1] : null
        }, $st.core.event.EventRouter.prototype.getEventData = function(a, b) {
            var c = {};
            if (a.getAttribute("data-event-data")) {
                for (var d, e = a.getAttribute("data-event-data"), f = e.split(","), g = 0, h = f.length; h > g; g++) d = f[g], parts = d.split(":"), c[parts[0]] = parts[1];
                return c
            }
            for (var i, j = new RegExp("\\b" + this.eventClassPrefix + "_data_" + b + "_(\\w+)_(\\w+)\\b", "gi"); i = j.exec(a.className);) c[i[1]] = i[2];
            return c
        }, $st.core.event.EventRouter.prototype.setEventGroup = function() {}, $st.core.event.EventRouter.prototype.setEventProperties = function() {}, $st.core.event.EventRouter.prototype.onEvent = function(a) {
            if (!a) var a = window.event;
            var b = new $st.core.event.Event({
                    e: a
                }),
                c = b.getType(),
                d = b.getTarget().nodeName.toLowerCase(),
                e = this.getEventTranslatorClass(b);
            if (e) {
                var f = this.getNameForEventType(b.getTarget().className, c, d);
                if (f) {
                    b.name = f;
                    var g = this.getEventData(b.getTarget(), c);
                    b.data = g, this.setEventProperties(b);
                    var h = {
                            handler: this.handler,
                            event: b
                        },
                        i = new e,
                        j = i.translateEvent(h);
                    return j === !0 && this.handler.handleEvent(b), b.isDefaultPrevented() ? !1 : void 0
                }
            }
        }, $st.core.event.EventRouter.prototype.handleEvent = function() {}, $st.core.event.CheckBoxInputClickEventTranslator = function() {}, $st.core.event.CheckBoxInputClickEventTranslator.prototype.logger = $st.core.logging, $st.core.event.CheckBoxInputClickEventTranslator.prototype.translateEvent = function(a) {
            var b = a.handler,
                c = a.event,
                d = c.getTarget();
            return c.data[d.name] = d.value, setTimeout(function() {
                c.data.checked = d.checked, b.handleEvent(c)
            }, 0), !1
        }, $st.core.event.RadioInputClickEventTranslator = function() {}, $st.core.event.RadioInputClickEventTranslator.prototype.logger = $st.core.logging, $st.core.event.RadioInputClickEventTranslator.prototype.translateEvent = function(a) {
            var b = (a.handler, a.event);
            return b.data[b.getTarget().name] = b.getTarget().value, !0
        }, $st.core.event.AnchorClickEventTranslator = function() {}, $st.core.event.AnchorClickEventTranslator.prototype.logger = $st.core.logging, $st.core.event.AnchorClickEventTranslator.prototype.translateEvent = function(a) {
            var b = (a.e, a.srcElement, a.event);
            return b.data = b.data || {}, b.data.href = b.getTarget().href, b.data.target = b.getTarget().target, b.track = !0, !0
        }, $st.core.event.SelectChangeEventTranslator = function() {}, $st.core.event.SelectChangeEventTranslator.prototype.logger = $st.core.logging, $st.core.event.SelectChangeEventTranslator.prototype.translateEvent = function(a) {
            var b = (a.e, a.srcElement, a.event),
                c = b.getTarget();
            b.data = b.data || {};
            var d = c.options[c.selectedIndex],
                e = [];
            return 0 == c.multiple && e.push({
                index: d.index,
                value: d.value,
                content: d.innerHTML,
                element: d
            }), b.data.selectedOptions = e, !0
        }, $st.core.event.FormSubmitClickEventTranslator = function() {}, $st.core.event.FormSubmitClickEventTranslator.prototype.translateEvent = function(a) {
            var b = a.event,
                c = b.getTarget();
            if (!c || !c.form) return !1;
            for (var d = c.form.elements, e = 0; e < d.length; e++) {
                var f = d[e],
                    g = null;
                switch (f.type) {
                    case "undefined":
                        break;
                    case "radio":
                        1 == f.checked && (g = f.value);
                        break;
                    case "select-multiple":
                        for (var h = new Array, i = 0; i < f.length; i++) 1 == f[i].selected && (h[h.length] = f[i].value);
                        g = h;
                        break;
                    case "checkbox":
                        g = f.checked;
                        break;
                    case "text":
                    case "textarea":
                        var j = f.getAttribute("data-default-text"),
                            k = f.getAttribute("placeholder");
                        g = f.value, j && (g = g == j ? "" : g), k && (g = g == k ? "" : g);
                        break;
                    case "submit":
                        if (f === c) {
                            var l = document.createElement("input");
                            l.setAttribute("type", "hidden"), l.setAttribute("name", f.getAttribute("name")), l.setAttribute("value", f.getAttribute("value")), c.form.appendChild(l)
                        }
                        g = f.value;
                        break;
                    default:
                        g = f.value
                }
                null != g && (b.data || (b.data = {}), b.data[f.name] = g)
            }
            return !0
        }, $st.core.event.DefaultClickEventTranslator = function() {}, $st.core.event.DefaultClickEventTranslator.prototype.translateEvent = function(a) {
            a.event;
            return !0
        }, $st.event.FormElementChangeEventTranslator = function() {}, $st.event.FormElementChangeEventTranslator.prototype.logger = $st.core.logging, $st.event.FormElementChangeEventTranslator.prototype.translateEvent = function(a) {
            var b = a.event,
                c = b.getTarget();
            switch (c.type) {
                case "undefined":
                    break;
                case "radio":
                    c.checked === !0 && (value = c.value);
                    break;
                case "select-multiple":
                    for (var d = [], e = 0; e < c.length; e++) c[e].selected === !0 && (d[d.length] = c[e].value);
                    value = d;
                    break;
                case "checkbox":
                    value = c.checked;
                    break;
                case "text":
                case "textarea":
                    var f = c.getAttribute("data-default-text"),
                        g = c.getAttribute("placeholder");
                    value = c.value, f && (value = value == f ? "" : value), g && (value = value == g ? "" : value);
                    break;
                case "submit":
                    if (c === target) {
                        var h = document.createElement("input");
                        h.setAttribute("type", "hidden"), h.setAttribute("name", c.getAttribute("name")), h.setAttribute("value", c.getAttribute("value")), target.form.appendChild(h)
                    }
                    value = c.value;
                    break;
                default:
                    value = c.value
            }
            return b.data[c.name] = value, !0
        }, $st.core.event.config = {
            events: {
                click: {
                    input: {
                        checkbox: $st.event.CheckBoxInputClickEventTranslator,
                        submit: $st.event.FormSubmitClickEventTranslator,
                        image: $st.event.FormSubmitClickEventTranslator,
                        radio: $st.event.RadioInputClickEventTranslator,
                        text: $st.event.DefaultClickEventTranslator
                    },
                    a: $st.event.AnchorClickEventTranslator,
                    img: $st.event.DefaultClickEventTranslator,
                    span: $st.event.DefaultClickEventTranslator
                },
                change: {
                    select: $st.event.SelectChangeEventTranslator
                }
            }
        }, $st.namespace("$st.core.dom"), $st.core.dom.query = function() {
            return $st.jquery.apply(null, arguments).get()
        }, $st.core.dom.hideChildren = function(a) {
            if ("string" == typeof a && (a = document.getElementById(a)), void 0 != a) {
                var b = a.childNodes;
                if (void 0 != b)
                    for (i = 0; i < b.length; i++) {
                        var c = b[i];
                        $st.core.dom.hide(c)
                    }
            }
        }, $st.core.dom.hasClass = function(a, b) {
            return "string" == typeof a && (a = document.getElementById(a)), null == a || void 0 == a.className ? !1 : new RegExp("\\b" + b + "\\b").test(a.className)
        }, $st.core.dom.removeClass = function(a, b) {
            "string" == typeof a && (a = document.getElementById(a)), a.className = a.className.replace(new RegExp("(^|\\s)" + b + "(?:\\s|$)"), "$1")
        }, $st.core.dom.addClass = function(a, b) {
            "string" == typeof a && (a = document.getElementById(a)), $st.core.dom.hasClass(a, b) || (a.className = a.className.trim(), a.className += a.className ? " " + b : b)
        }, $st.core.dom.findParentWithClass = function(a, b) {
            if ("string" == typeof a && (a = document.getElementById(a)), null == a) return null;
            for (; a && !$st.core.dom.hasClass(a, b); a = a.parentNode);
            return a
        }, $st.core.dom.findAncestor = function(a, b, c) {
            if (a && c === !0 && (a = a.parentNode), "function" != typeof b) return null;
            for (; null !== a && void 0 !== a && a !== a.parentNode;) {
                try {
                    if (b(a)) return a
                } catch (d) {}
                a = a.parentNode
            }
            return null
        }, $st.core.dom.findFirstChildWithClass = function(a, b) {
            if ("string" == typeof a && (a = document.getElementById(a)), null == a) return null;
            if (this.hasClass(a, b)) return a;
            for (var c in a.childNodes) {
                var d = a.childNodes[c];
                if (d && (d = this.findFirstChildWithClass(d, b))) return d
            }
        }, $st.core.dom.changeClass = function(a, b) {
            "string" == typeof a && (a = document.getElementById(a)), void 0 != a && (a.className = b)
        }, $st.core.dom.changeChildClass = function(a, b) {
            if ("string" == typeof a && (a = document.getElementById(a)), void 0 != a) {
                var c = a.childNodes;
                if (void 0 != c)
                    for (i = 0; i < c.length; i++) {
                        var d = c[i];
                        void 0 != d.className && (d.className = b)
                    }
            }
        }, $st.core.dom.getNamedElementsInForm = function(a, b) {
            if ("string" == typeof a && (a = document.getElementById(a)), void 0 != a) {
                for (var c = document.getElementsByName(b), d = new Array, e = 0; e < c.length; e++) {
                    var f = c[e];
                    f.form == a && d.push(f)
                }
                return d
            }
        }, $st.core.dom.show = function(a) {
            if (void 0 != a.style) a.style.display = "block";
            else if ("string" == typeof a) {
                var b = document.getElementById(a);
                void 0 != b && (b.style.display = "block")
            }
        }, $st.core.dom.hide = function(a) {
            if (void 0 != a.style) a.style.display = "none";
            else if ("string" == typeof a) {
                var b = document.getElementById(a);
                void 0 != b && (b.style.display = "none")
            }
        }, $st.namespace("$st.core.ajax"), $st.core.ajax.ajax = $st.jquery.ajax, $st.namespace("$st.core.validator"), $st.core.validator.ModelValidator = function() {
            this._validationRules = [], this._validationErrors = []
        }, $st.core.validator.ModelValidator.prototype.logger = $st.core.logging, $st.core.validator.ModelValidator.prototype.getValidationErrorCount = function() {
            return this._validationErrors.length
        }, $st.core.validator.ModelValidator.prototype.getValidationRuleCount = function() {
            return this._validationRules.length
        }, $st.core.validator.ModelValidator.prototype.getValidationErrors = function() {
            return this._validationErrors
        }, $st.core.validator.ModelValidator.prototype.clearValidationErrors = function() {
            this._validationErrors = []
        }, $st.core.validator.ModelValidator.prototype.clearValidationRules = function() {
            this.clearValidationErrors(), this._validationRules = []
        }, $st.core.validator.ModelValidator.prototype.retrieveEmbeddedRules = function(a) {
            var b = [],
                c = {},
                d = {},
                e = null,
                f = document.getElementById(a),
                g = [],
                h = null,
                i = 0,
                j = null,
                k = "",
                l = $st.core.validator.form.attributePrefix,
                m = new RegExp(l),
                n = [],
                o = 0,
                p = 0,
                q = !1;
            if (f)
                for ("form" === f.tagName.toLowerCase() ? (g = f.elements, h = g.length) : (g.push(f), h = 1), o; h > o; o++) {
                    if (q = !1, d = {}, c = {
                            fieldName: g[o].id,
                            rules: []
                        }, g[o].attributes)
                        for (i = g[o].attributes.length, p = 0; i > p; p++) j = g[o].attributes[p], k = g[o].attributes[p].name.toString().toLowerCase(), n = [], j.specified && m.test(k) && (q = !0, k = j.name.toString().replace(l, ""), n = k.split("-"), 1 === n.length ? void 0 === d[n[0]] ? d[n[0]] = {
                            ruleCallback: $st.core.validator.form.ruleMapping[n[0]],
                            error: j.value
                        } : $st.core.utils.object.merge(d[n[0]], {
                            ruleCallback: $st.core.validator.form.ruleMapping[n[0]],
                            error: j.value
                        }) : "args" === n[1] ? (void 0 === d[n[0]] && (d[n[0]] = {}), d[n[0]][n[1]] = j.value.split(",")) : (void 0 === d[n[0]] && (d[n[0]] = {}), d[n[0]][n[1]] = j.value));
                    if (q) {
                        for (e in d) c.rules.push(d[e]);
                        b.push(c)
                    }
                }
            return b
        }, $st.core.validator.ModelValidator.prototype.validate = function(a, b, c) {
            var d, e, f, g, h, i = 0,
                j = 0,
                k = 0,
                l = this._validationRules.length,
                m = 0,
                n = !1,
                o = !0,
                p = 0;
            for ("string" == typeof c && (this.clearValidationRules(), this.addValidationRules(this.retrieveEmbeddedRules(c)), l = this._validationRules.length), i; l > i; i++) {
                for (d = this._validationRules[i].fieldName, e = this._validationRules[i].destination, f = this._validationRules[i].rules, m = f.length, j = 0; m > j; j++) {
                    if (g = f[j], "string" == typeof d) h = g.ruleCallback.call(this, {
                        fieldValue: a[d],
                        model: a,
                        args: g.args,
                        rule: g
                    }), h || (n = !0);
                    else
                        for (p = d.length, o = !0, k = 0; p > k; k++) {
                            if (h = g.ruleCallback.call(this, {
                                    fieldValue: a[d[k]],
                                    model: a,
                                    args: g.args,
                                    rule: g
                                }), o = h ? !0 : !1) {
                                n = !1;
                                break
                            }
                            n = !0
                        }
                    if (n && this.addValidationError(void 0 !== e ? {
                            fieldName: e,
                            error: g.error
                        } : {
                            fieldName: d,
                            error: g.error
                        }), n === !0 && (b === !1 || void 0 === b)) break
                }
                n = !1
            }
            return this
        }, $st.core.validator.ModelValidator.prototype._addValidationRule = function(a) {
            return this._validationRules.push(a), this
        }, $st.core.validator.ModelValidator.prototype.addValidationRules = function(a) {
            var b = 0,
                c = 0;
            for (c = a.length, b; c > b; b++) this._addValidationRule(a[b]);
            return this
        }, $st.core.validator.ModelValidator.prototype.addValidationError = function(a) {
            return this._validationErrors.push(a), this
        }, $st.core.validator.validationRules = {}, $st.core.validator.validationRules.ruleIsNotNullOrEmptyString = function(a) {
            var b = !1;
            return void 0 !== a.fieldValue && null !== a.fieldValue && "" !== a.fieldValue && (b = !0), b
        }, $st.core.validator.validationRules.ruleIsTrue = function(a) {
            var b = !1;
            return a.fieldValue === !0 && (b = !0), b
        }, $st.core.validator.validationRules.ruleIsValidEmail = function(a) {
            var b = !1,
                c = /^[\+a-zA-Z0-9._-]+@[\+a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            return (!$st.core.validator.validationRules.ruleIsNotNullOrEmptyString(a) || c.test(a.fieldValue)) && (b = !0), b
        }, $st.core.validator.validationRules.ruleIsMatchedValue = function(a) {
            var b = !1,
                c = a.model[a.args[0]];
            return c === a.fieldValue && (b = !0), b
        }, $st.core.validator.validationRules.ruleIsRequiredLength = function(a) {
            var b = !1,
                c = a.args[0];
            return a.fieldValue.length == c && (b = !0), b
        }, $st.core.validator.validationRules.ruleIsWithinRequiredLength = function(a) {
            var b = !1,
                c = a.args[0],
                d = "-",
                e = parseInt(a.args[1]);
            return 2 === e && (d = "--"), a.fieldValue.replace(/[\n]/g, d).length <= c && (b = !0), b
        }, $st.core.validator.validationRules.ruleIsBetweenRequiredLength = function(a) {
            var b = !1,
                c = a.args[0],
                d = a.args[1];
            return "string" == typeof c && (c = parseFloat(c, 10)), "string" == typeof d && (d = parseFloat(d, 10)), $st.core.validator.validationRules.ruleIsNotNullOrEmptyString(a) && a.fieldValue.length >= c && a.fieldValue.length <= d ? !0 : b
        }, $st.core.validator.validationRules.ruleIsNumeric = function(a) {
            return !$st.core.validator.validationRules.ruleIsNotNullOrEmptyString(a) || !isNaN(parseFloat(a.fieldValue)) && isFinite(a.fieldValue)
        }, $st.core.validator.validationRules.ruleIsUsZipCode = function(a) {
            var b = !1,
                c = /^[0-9]{5}(?:-[0-9]{4})?$/;
            return c.test(a.fieldValue) && (b = !0), b
        }, $st.core.validator.validationRules.ruleIsUkZipCode = function(a) {
            var b = !1,
                c = a.fieldValue.replace(/\s/g, ""),
                d = /^[A-Za-z][A-Za-z0-9]{4,7}$/;
            return d.test(c) && c.length > 4 && c.length < 9 && a.fieldValue.length - c.length < 5 && (b = !0), b
        }, $st.core.validator.validationRules.ruleIsNumericBetweenRange = function(a) {
            var b = !1,
                c = a.args[0],
                d = a.args[1];
            return "string" == typeof c && (c = parseFloat(c, 10)), "string" == typeof d && (d = parseFloat(d, 10)), $st.core.validator.validationRules.ruleIsNotNullOrEmptyString(a) && a.fieldValue >= c && a.fieldValue <= d ? !0 : b
        }, $st.core.validator.validationRules.ruleIsNotValue = function(a) {
            var b = !1,
                c = a.args[0];
            return a.fieldValue !== c && (b = !0), b
        }, $st.core.validator.validationRules.ruleIsDateFormattedString = function(a) {
            return !!$st.core.utils.date.ensureDate(a.fieldValue)
        }, $st.core.validator.validationRules.ruleIsUKDateFormattedString = function(a) {
            return !!$st.core.utils.date.ensureDate(a.fieldValue, "en_GB")
        }, $st.core.validator.validationRules.ruleIsNotPOBoxAddress = function(a) {
            var b = !1,
                c = /^\s*p(ost)?[.\s-]*o(ffice)?[.\s-]+box/gi;
            return c.test(a.fieldValue) || (b = !0), b
        }, $st.core.validator.validationRules.ruleIsUsPhoneNumber = function(a) {
            var b = !1,
                c = /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;
            return c.test(a.fieldValue) && (b = !0), b
        }, $st.core.validator.validationRules.ruleIsUKPhoneNumber = function(a) {
            var b = !1,
                c = a.fieldValue.replace(/[^0-9]/g, "").length;
            return c > 4 && 16 > c && (b = !0), b
        }, $st.core.validator.validationRules.ruleIsNotNullOrEmptyIfParentHasValue = function(a) {
            var b = a.args[0],
                c = a.args[1],
                d = a.model,
                e = !1,
                f = !1;
            if (c instanceof Array && "function" == typeof c.shift) {
                var g = "::::::::::";
                f = (g + c.join(g) + g).indexOf(g + d[b] + g) >= 0
            } else f = d[b] === c;
            return f ? void 0 !== a.fieldValue && null !== a.fieldValue && "" !== a.fieldValue && (e = !0) : e = !0, e
        }, $st.core.validator.validationRules.ruleIsDateLessThanOrEqualTo = function(a) {
            return $st.core.validator.validationRules.ruleIsDateWithinRange({
                fieldValue: a.fieldValue,
                args: {
                    max: a.args[0]
                }
            })
        }, $st.core.validator.validationRules.ruleIsDateLessThanOrEqualTo_en_GB = function(a) {
            return $st.core.validator.validationRules.ruleIsDateWithinRange({
                fieldValue: a.fieldValue,
                args: {
                    max: a.args[0],
                    locale: "en_GB"
                }
            })
        }, $st.core.validator.validationRules.ruleIsDateWithinRange = function(a) {
            var b = $st.core.utils.date.ensureDate,
                c = a.args.locale || $st.core.i18n.getLocale(),
                d = b(a.fieldValue, c);
            if (!d) return !1;
            var e = "min" in a.args && b(a.args.min, c);
            if (e && e > d) return !1;
            var f = "max" in a.args && b(a.args.max, c);
            return f && d > f ? !1 : !0
        }, $st.core.validator.validationRules.ruleDoesPassLuhnAlgorithm = function(a) {
            var b, c = "",
                d = 0,
                e = a.fieldValue;
            for (e = e.replace(/[\ -]+/g, "").split("").reverse().join(""), i = 0; i < e.length; i++) c += i % 2 ? "" + 2 * e.charAt(i) : "" + e.charAt(i);
            for (i = 0; i < c.length; i++) d += 1 * c.charAt(i);
            return b = d % 10 ? !1 : !0
        }, $st.core.validator.validationRules.ruleIsValidIMEI = function(a) {
            var b = !1,
                c = a.fieldValue;
            return c = c.replace(/[\ -]+/g, ""), c.match(/^\d{14}$/) || c.match(/^\d{16}$/) ? !0 : (c.match(/^\d{15}$/) && (b = $st.core.validator.validationRules.ruleDoesPassLuhnAlgorithm(a)), b)
        }, $st.core.validator.validationRules.ruleIsValidCreditCard = function(a) {
            var b = !1,
                c = a.fieldValue,
                d = null,
                e = {
                    MasterCard: "5[1-5][0-9]{14}",
                    Discover: "6011[0-9]{12}",
                    AmericanExpress: "3[47][0-9]{13}",
                    Visa: "4(?:[0-9]{12}|[0-9]{15})"
                };
            if (c = c.replace(/\s+/g, ""), void 0 !== c && null !== c && "" !== c) {
                for (d in e)
                    if (c.match(e[d]) > 0) {
                        b = !0;
                        break
                    }
                b && (b = $st.core.validator.validationRules.ruleDoesPassLuhnAlgorithm(a))
            }
            return b
        }, $st.core.validator.validationRules.ruleIsValidCreditCardExpiry = function(a) {
            var b = !1,
                c = a.model[a.args[0]],
                d = a.model[a.args[1]],
                e = 1,
                f = new Date,
                g = new Date(d, c, e);
            return g.setDate(g.getDate() - 1), f.getTime() < g.getTime() && (b = !0), b
        }, $st.core.validator.validationRules.ruleIsValidCCV = function(a) {
            var b = !1,
                c = /^[0-9]{3,4}$/gi;
            return c.test(a.fieldValue) && (b = !0), b
        }, $st.core.validator.validationRules.ruleIsMatchedData = function(a) {
            var b = !1,
                c = a.args[0];
            return c === a.fieldValue && (b = !0), b
        }, $st.core.validator.form = {
            attributePrefix: "data-st-validation-",
            ruleMapping: {
                required: $st.core.validator.validationRules.ruleIsNotNullOrEmptyString,
                email: $st.core.validator.validationRules.ruleIsValidEmail,
                matcheddata: $st.core.validator.validationRules.ruleIsMatchedData,
                matchedvalue: $st.core.validator.validationRules.ruleIsMatchedValue,
                requiredlength: $st.core.validator.validationRules.ruleIsRequiredLength,
                lengthrange: $st.core.validator.validationRules.ruleIsBetweenRequiredLength,
                date: $st.core.validator.validationRules.ruleIsDateFormattedString,
                datelessthan: $st.core.validator.validationRules.ruleIsDateLessThanOrEqualTo,
                number: $st.core.validator.validationRules.ruleIsNumeric,
                numberrange: $st.core.validator.validationRules.ruleIsNumericBetweenRange,
                uszip: $st.core.validator.validationRules.ruleIsUsZipCode,
                ukzip: $st.core.validator.validationRules.ruleIsUkZipCode,
                usphone: $st.core.validator.validationRules.ruleIsUsPhoneNumber,
                ukphone: $st.core.validator.validationRules.ruleIsUKPhoneNumber,
                notvalue: $st.core.validator.validationRules.ruleIsNotValue,
                creditcard: $st.core.validator.validationRules.ruleIsValidCreditCard,
                creditcardexpiry: $st.core.validator.validationRules.ruleIsValidCreditCardExpiry,
                cvv: $st.core.validator.validationRules.ruleIsValidCCV,
                requiredcheckbox: $st.core.validator.validationRules.ruleIsTrue
            }
        }, $st.namespace("$st.core.services"), $st.core.services.get = function(a) {
            return function(b) {
                var c = b.service,
                    d = b.version || "1.0",
                    e = (b.modelType, b.action),
                    f = b.config || {};
                return new a.Service(c, e, d, f)
            }
        }($st.core.services), $st.core.services.Service = function(a, b, c, d) {
            var e = (d.retryInterval || 1e4, {
                    fetch: {
                        maxTotalTime: d.maxTotalTime || 3e4,
                        maxRetryAttempts: d.maxTries || 2,
                        callTimeout: d.timeout || 1e4,
                        retryDelay: d.retryDelay || 500
                    },
                    submit: {
                        maxTotalTime: d.maxTotalTime || 3e4,
                        maxRetryAttempts: d.maxTries || 2,
                        callTimeout: d.timeout || 1e4,
                        retryDelay: d.retryDelay || 500,
                        pollingMaxCount: d.maxPolls || 80,
                        pollingDelay: d.pollFrequency || 500,
                        pollingCallTimeout: d.pollingCallTimeout || 3e3
                    }
                }),
                f = d.defaultHeaders || {
                    "X-ST-AuthType": "DRUPAL"
                },
                g = d.defaultArgs || {},
                h = d.endStates || ["COMPLETED"],
                i = d.errorStates || ["FAILED", "EXPIRED"],
                j = b,
                k = a,
                l = c,
                m = d._modelType,
                n = d.contentType || "",
                o = "function" == typeof d.extractPollingID ? d.extractPollingID : $st.core.services.Service.extractPollingID;
            this.getRetryFrequency = function() {
                return retryInterval
            }, this.setRetryFrequency = function(a) {
                retryInterval = a
            }, this.getMaxTries = function() {
                return maxTries
            }, this.setMaxtries = function(a) {
                maxTries = a
            }, this.getMaxPolls = function() {
                return maxPolls
            }, this.setMaxPolls = function(a) {
                maxPolls = a
            }, this.getPollFrequency = function() {
                return pollFrequency
            }, this.setPollFrequency = function(a) {
                pollFrequency = a
            }, this.getDefaultHeaders = function() {
                return f
            }, this.setDefaultHeaders = function(a) {
                f = a
            }, this.getDefaultArgs = function() {
                return g
            }, this.setDefaultArgs = function(a) {
                g = a
            }, this.getEndStates = function() {
                return h
            }, this.setEndStates = function(a) {
                h = a
            }, this.getErrorStates = function() {
                return i
            }, this.setErrorStates = function(a) {
                i = a
            }, this.getVersion = function() {
                return l
            }, this.getAction = function() {
                return j
            };
            var p = function(a, b) {
                    a = $st.core.utils.object.copy(a);
                    for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
                    return a
                },
                q = function(a, b) {
                    return a = a || {}, a.url = "/" + k + "/" + l + "/" + j, a.data && (a.data.id || a.data.pathParams) && "static" !== m && (a.url = a.url + "/" + (a.data.id || a.data.pathParams), delete a.data.id, delete a.data.pathParams), !a.contentType && n && (a.contentType = n), a.headers = p(f, a.headers || {}), a.data = p(g, a.data || {}), a.data = $st.core.utils.object.isEmpty(a.data) !== !0 ? b === !0 ? a.data : JSON.stringify(a.data) : null, a.target = a.target.constructor == Array ? a.target : [a.target], a.callbackName = a.callbackName || "handleEvent", a.event = a.event.constructor == String ? new $st.core.event.Event({
                        name: a.event
                    }) : a.event, a.errorEvent = a.errorEvent.constructor == String ? new $st.core.event.Event({
                        name: a.errorEvent
                    }) : a.errorEvent, a.dataType = "json", a.modelType = m, a.cache = $st.core.utils.object.isEmpty(a.cache) !== !0 ? a.cache : !1, a.config && a.config.maxTries >= 0 && (maxTries = a.config.maxTries), a
                },
                r = function(a, b) {
                    for (var c in a.target) a.target[c][a.callbackName].call(a.target[c], b)
                };
            this.submit = function(a) {
                a = q(a), a.pollingDelay = "undefined" == typeof a.pollingDelay ? e.submit.pollingDelay : a.pollingDelay, a.pollingStartDelay = "undefined" == typeof a.pollingStartDelay ? a.pollingDelay : a.pollingStartDelay, a.pollingCallTimeout = "undefined" == typeof a.pollingCallTimeout ? e.submit.pollingCallTimeout : a.pollingCallTimeout, a.pollingAttemptsRemaining = "undefined" == typeof a.maxPolls ? e.submit.pollingMaxCount : a.maxPolls, a.totalRemainingTime = a.maxTotalTime = "undefined" == typeof a.maxTotalTime ? e.submit.maxTotalTime : a.maxTotalTime, a.timeout = "undefined" == typeof a.timeout ? e.submit.callTimeout : a.timeout, a.startTime = $st.core.utils.date.now();
                var b = a.url,
                    c = a.pollingCallTimeout,
                    d = function(e) {
                        c > a.totalRemainingTime && (c = a.totalRemainingTime), $st.core.ajax.ajax(b + "/" + e, {
                            dataType: "json",
                            headers: a.headers,
                            cache: a.cache,
                            success: function(c) {
                                var f = "1.0" == l ? c.status : c.body.entity.state.status;
                                a.pollingAttemptsRemaining -= 1, a.totalRemainingTime = a.maxTotalTime - ($st.core.utils.date.now() - a.startTime), -1 != $st.jquery.inArray(f, h) ? (a.event.data = c, r(a, a.event)) : c.successful && "false" !== c.successful && c.successful !== !1 && -1 == $st.jquery.inArray(f, i) ? c.errors && c.errors.length ? (a.errorEvent.data = c, r(a, a.errorEvent)) : a.pollingAttemptsRemaining < 1 ? (a.errorEvent.data = {
                                    errors: ["Exceeded max poll configuration to submit " + b]
                                }, r(a, a.errorEvent)) : a.totalRemainingTime < 0 ? (a.errorEvent.data = {
                                    errors: ["Exceeded max call and polling time: " + b]
                                }, r(a, a.errorEvent)) : setTimeout(function() {
                                    d(e)
                                }, a.pollingDelay) : (a.errorEvent.data = c, r(a, a.errorEvent))
                            },
                            error: function() {
                                a.totalRemainingTime = a.maxTotalTime - ($st.core.utils.date.now() - a.startTime), a.pollingAttemptsRemaining -= 1, a.pollingAttemptsRemaining < 1 ? (a.errorEvent.data = "Exceeded max poll configuration to submit " + b, r(a, a.errorEvent)) : a.totalRemainingTime < 1 ? (a.errorEvent.data = "Exceeded max call and polling time " + b, r(a, a.errorEvent)) : setTimeout(function() {
                                    d(e)
                                }, a.pollingDelay)
                            },
                            timeout: c
                        })
                    };
                a.success = function(b) {
                    if (b.errors && b.errors.length) return a.errorEvent.data = b, void r(a, a.errorEvent);
                    var c = o(b, l);
                    return b.successful ? void(a.pollingAttemptsRemaining < 0 ? (a.event.data = b, r(a, a.event)) : setTimeout(function() {
                        d(c)
                    }, a.pollingStartDelay)) : (a.errorEvent.data = b, void r(a, a.errorEvent))
                }, a.error = function(c, d, e) {
                    var f = null;
                    try {
                        f = $st.jquery.parseJSON(c.responseText)
                    } catch (g) {}
                    a.errorEvent.data = f || e + " to " + b, r(a, a.errorEvent)
                }, a.type = a.type || "POST", $st.core.ajax.ajax(b, a)
            }, this.fetch = function(a) {
                var b = function(a) {
                    var b = a.url;
                    a.remainingAttempts -= 1, $st.core.ajax.ajax(b, a)
                };
                a = q(a, !0), a.type = "GET", a.timeout = "undefined" == typeof a.timeout ? e.fetch.callTimeout : a.timeout, a.retryDelay = "undefined" == typeof a.retryDelay ? e.fetch.retryDelay : a.retryDelay, a.remainingAttempts = "undefined" == typeof a.maxTries ? e.fetch.maxRetryAttempts : a.maxTries, a.totalRemainingTime = a.maxTotalTime = "undefined" == typeof a.maxTotalTime ? e.fetch.maxTotalTime : a.maxTotalTime, a.startTime = $st.core.utils.date.now(), a.success = function(b) {
                    return b.errors && b.errors.length ? (a.errorEvent.data = b, void r(a, a.errorEvent)) : (a.event.data = b, void r(a, a.event))
                }, a.error = function(c) {
                    var d = null;
                    if (a.totalRemainingTime = a.maxTotalTime - ($st.core.utils.date.now() - a.startTime), a.remainingAttempts <= 0 || a.totalRemainingTime <= 0) {
                        try {
                            d = $st.jquery.parseJSON(c.responseText)
                        } catch (e) {}
                        a.errorEvent.data = d || "Exceeded max tries configuration to fetch " + a.url, r(a, a.errorEvent)
                    } else setTimeout(function() {
                        b(a)
                    }, a.retryDelay)
                }, b(a)
            }
        }, $st.core.services.Service.extractPollingID = function(a, b) {
            if (!a) return null;
            var c;
            switch (b) {
                case "3":
                    c = "body.entity.id";
                    break;
                case "2":
                    c = "body.eventID";
                    break;
                default:
                    c = "eventID"
            }
            var d = $st.resolve(c, a);
            return "string" == typeof d ? d : ($st.core.logging.error('extractPollingID: Could not extract an ID from data (expected version "' + b + '")'), null)
        }, $st.namespace("$st.mvc.plugins.squaretrade.injectors"), $st.namespace("$st.components.overlay"), $st.mvc.plugins.squaretrade.injectors.IDInjector = function() {}, $st.mvc.plugins.squaretrade.injectors.IDInjector.prototype.logger = $st.core.logging, $st.mvc.plugins.squaretrade.injectors.IDInjector.prototype.inject = function(a) {
            var b = a.destination,
                c = a.rendered,
                d = document.getElementById(b);
            d && (d.innerHTML = c)
        }, $st.mvc.plugins.squaretrade.injectors.ClassInjector = function() {}, $st.mvc.plugins.squaretrade.injectors.ClassInjector.prototype.logger = $st.core.logging, $st.mvc.plugins.squaretrade.injectors.ClassInjector.prototype.inject = function(a) {
            var b = a.destination.element,
                c = a.destination.parentElement || "",
                d = a.destination.rendered,
                e = "",
                f = 0,
                g = 0,
                h = [];
            if (c && (e = "." + c + " "), e += "." + b, h = $jq171(e), h && h.length)
                for (g = h.length, f; g > f; f++) h[f].innerHTML = d
        }, $st.mvc.plugins.squaretrade.injectors.StyleInjector = function() {}, $st.mvc.plugins.squaretrade.injectors.StyleInjector.prototype.logger = $st.core.logging, $st.mvc.plugins.squaretrade.injectors.StyleInjector.prototype.inject = function(a) {
            var b = a.destination.element,
                c = a.destination.elementType || "class",
                d = a.destination.parentElement,
                e = a.destination.parentType || "class",
                f = a.destination.rendered || "",
                g = a.destination.addClassName,
                h = 0,
                i = 0,
                j = [],
                k = new RegExp("\\b" + f + "\\b", "g"),
                l = "";
            if (b = "id" === c ? "#" + b : "." + b, d ? (d = "id" === e ? "#" + d : "." + d, j = $jq171(b).parents(d)) : j = $jq171(b), j && j.length)
                for (i = j.length, h; i > h; h++) l = j[h].className, "" !== l && (l = l.replace(k, "")), g && (l += " " + f), j[h].className = l
        }, $st.mvc.plugins.squaretrade.injectors.ScriptInjector = function() {}, $st.mvc.plugins.squaretrade.injectors.ScriptInjector.prototype.logger = $st.core.logging, $st.mvc.plugins.squaretrade.injectors.ScriptInjector.prototype.inject = function(a) {
            var b = a.destination ? a.destination.elementTagName || "head" : "head",
                c = a.destination ? a.destination.scriptId || null : null,
                d = a.index || 0,
                e = a.rendered,
                f = $st.core.dom.query(b),
                g = null;
            f ? (c && (g = document.getElementById(c), g && g.parentNode.removeChild(g)), g = document.createElement("script"), c && (g.id = c), g.text = e, f[d].appendChild(g)) : this.logger.debug("ScriptInjector:inject - No destination elements found.")
        }, $st.mvc.plugins.squaretrade.injectors.ValidationInjector = function() {}, $st.mvc.plugins.squaretrade.injectors.ValidationInjector.prototype.logger = $st.core.logging, $st.mvc.plugins.squaretrade.injectors.ValidationInjector.prototype.inject = function(a) {
            var b, c = a.controller.getInjector("cssClass"),
                d = a.controller.getInjector("style"),
                e = a.destination.parentElementPrefix || "",
                f = a.destination.element || "",
                g = null,
                h = a.destination.validationScroll;
            if (fieldErrors = a.model.action.getFieldErrors(), c) {
                a.model.action.clearErrorsFlag === !0 && (d.inject.call(this, {
                    destination: {
                        element: "st_msg",
                        rendered: "is-hidden",
                        addClassName: !0
                    }
                }), c.inject.call(this, {
                    destination: {
                        element: f,
                        rendered: ""
                    }
                }));
                for (b in fieldErrors) d.inject.call(this, {
                    destination: {
                        element: f,
                        parentElement: e + b,
                        rendered: "is-hidden",
                        addClassName: !1
                    }
                }), c.inject.call(this, {
                    destination: {
                        element: f,
                        parentElement: e + b,
                        rendered: fieldErrors[b]
                    }
                });
                if (h && st_scrollTo) {
                    g = st_scrollTo.getInstance({
                        scrollingElement: h.scrollingElement,
                        elementPrefix: h.elementPrefix,
                        scrollToElementPrefix: h.scrollToElementPrefix,
                        mapping: h.mapping,
                        duration: h.duration
                    });
                    for (b in fieldErrors) g.addElements(b);
                    g.scroll()
                }
            }
        }, $st.mvc.plugins.squaretrade.injectors.OverlayInjector = function() {}, $st.mvc.plugins.squaretrade.injectors.OverlayInjector.prototype.inject = function(a) {
            var b, c = a.destination;
            switch (b = c.hasOwnProperty("method") && "string" == typeof c.method ? c.method : c) {
                case "show":
                case "trigger":
                    var d = $st.components.Overlay.getInstance();
                    if (d.isShowing) return;
                    var e = {
                            name: "injectedOverlay",
                            isModal: c.hasOwnProperty("isModal") ? c.isModal : !0,
                            hidesDefaultContent: c.hasOwnProperty("hidesDefaultContent") ? c.hidesDefaultContent : !0,
                            overlayContent: a.rendered,
                            delegateController: a.controller
                        },
                        f = a.destination.options;
                    if (f)
                        for (var g in f) f.hasOwnProperty(g) && (e[g] = f[g]);
                    d.trigger(e);
                    break;
                case "hide":
                case "close":
                    $st.components.Overlay.getInstance().close()
            }
        }, $st.mvc.plugins.squaretrade.injectors.LoadingInjector = function() {}, $st.mvc.plugins.squaretrade.injectors.LoadingInjector.prototype.inject = function(a) {
            "show" === a.destination ? $st.components.LoadingAnimation.show() : $st.components.LoadingAnimation.hide()
        }, $st.mvc.plugins.squaretrade.injectors.ChainInjector = function() {}, $st.mvc.plugins.squaretrade.injectors.ChainInjector.prototype.inject = function(a) {
            var b = a.destination,
                c = a.controller,
                d = a.model;
            if ("string" != typeof b) {
                b = a.destination.type;
                var e = a.destination.destination;
                if (e)
                    for (var f in e) e.hasOwnProperty(f) && (d[f] = e[f])
            }
            c.handleEvent(new $st.event.Event({
                name: b,
                data: d
            }))
        }, $st.mvc.plugins.squaretrade.injectors.QueryInjector = function() {}, $st.mvc.plugins.squaretrade.injectors.QueryInjector.prototype.inject = function(a) {
            for (var b = a.destination, c = a.rendered, d = a.container, e = $st.core.dom.query(b, d), f = e.length, g = 0; f > g; g++) e[g].innerHTML = c
        }, $st.namespace("$st.mvc.plugins.freemarker.formatter"), $st.core.utils.object.merge($st.mvc.plugins.freemarker.formatter, {
            i18n: function(a) {
                return $st.core.i18n.translate(a)
            },
            currency: function(a, b) {
                return $st.core.i18n.formatCurrency(a, b)
            },
            resolve: function(a, b) {
                var c = "undefined" == typeof b ? "" : b,
                    d = a;
                return function(a) {
                    var b = $st.resolve(a, d);
                    return null === b && (b = c), b
                }
            }
        }), $st.namespace("$st.mvc.plugins.freemarker.renderer"), $st.mvc.plugins.freemarker.renderer.ViewRenderer = function() {}, $st.mvc.plugins.freemarker.renderer.ViewRenderer.prototype.render = function(a) {
            var b = FreeMarker.render({
                templateName: a.templateName,
                loader: a.loader,
                model: {
                    scope: a.model
                }
            });
            return $st.core.utils.string.trim(b.replace(/[\s]{2,}/g, " "))
        }, $st.namespace("$st.mvc.plugins.freemarker.loader"), $st.mvc.plugins.freemarker.loader.ViewLoader = function(a) {
            this.templateNamespace = a.templateNamespace
        }, $st.mvc.plugins.freemarker.loader.ViewLoader.prototype.load = function(a) {
            var b = a.templateName || "global.operationFailedView",
                c = $st.resolve(b, $st.resolve(this.templateNamespace));
            return c
        }, $st.namespace("$st.mvc"), $st.mvc.Controller = function(a) {
            var b = {};
            $st.copyProperties(a, b), b.config && delete b.config, b.eventClassPrefix = a.eventClassPrefix || "st_fn_mvc", $st.event.EventRouter.call(this, b), this.renderers = {}, this.injectors = {}, this.loaders = {}, this.actions = {}, this.actionClasses = {}, this.state = {}, this.defaultHandler = null, this.enableHistory = a ? a.enableHistory || !1 : !1, this.enableTracking = a ? a.enableTracking || !1 : !1, this.name = a ? a.name || "" : "", this.activate($st.mvc.config), a && a.config && this.activate(a.config)
        }, $st.mvc.Controller.prototype = new $st.core.event.EventRouter, $st.mvc.Controller.prototype.constructor = $st.mvc.Controller, $st.mvc.Controller.prototype.logger = $st.core.logging, $st.mvc.Controller.prototype.forward = function(a) {
            if (a.action && a.resultName) {
                if ("none" == a.resultName.toLowerCase()) return;
                var b = a.action.actionMapping;
                if (!b.results) return;
                var c = b.results[a.resultName];
                if (!c || !c.length) return;
                for (var d = this.copy(a.action.model), e = 0; e < c.length; e++) {
                    var f = c[e],
                        g = this.getResultRenderer(f),
                        h = this.getResultLoader(f),
                        i = null;
                    f.template ? g && h && (i = g.render({
                        model: d,
                        templateName: f.template,
                        loader: h,
                        controller: this
                    }), this.inject({
                        rendered: i,
                        result: f,
                        model: d
                    })) : this.inject({
                        result: f,
                        model: d
                    })
                }
            }
        }, $st.mvc.Controller.prototype.handleEvent = function(a) {
            var b = this.getActionMapping(a.name);
            if (b) {
                b.history !== !0 || a._triggeredByHistory || this.storeState({
                    event: this.copy(a)
                }), b.track && this.trackEvent({
                    event: a
                });
                var c = b.handler;
                if (c) {
                    if ("function" != typeof c) {
                        var d = this.actionClasses[c];
                        c = d && d.clazz ? d.clazz : this.resolvePlugin(this.actionClasses, c, c)
                    }
                } else c = this.getPlugin(this.actionClasses, this.defaultHandler), c || (c = this.resolvePlugin(this.actionClasses, this.defaultHandler, this.defaultHandler));
                if (c) {
                    var e = new c,
                        f = {
                            state: this.state,
                            action: e,
                            event: a
                        };
                    if (e.model = f, e.controller = this, e.actionMapping = b, e.validate) {
                        e.validate();
                        var g = e.getFieldErrors(),
                            h = e.getErrors();
                        if (h.length > 0 || $st.hasPropertiesSet(g)) return void this.forward({
                            action: e,
                            resultName: "invalid"
                        })
                    }
                    this.forward({
                        action: e,
                        resultName: "processing"
                    });
                    var i;
                    i = e.execute ? e.execute() : "success", this.forward({
                        action: e,
                        resultName: i
                    })
                }
            }
        }, $st.mvc.Controller.prototype.copy = function(a) {
            return $st.core.utils.object.copy(a)
        }, $st.mvc.Controller.prototype.getActionMapping = function(a) {
            return this.actions[a]
        }, $st.mvc.Controller.prototype.registerRenderer = function(a, b, c) {
            this.setPlugin(this.renderers, a, b, c)
        }, $st.mvc.Controller.prototype.getRenderer = function(a) {
            return this.getPlugin(this.renderers, a)
        }, $st.mvc.Controller.prototype.getResultRenderer = function(a) {
            var b = a.renderer || "default";
            return this.getRenderer(b)
        }, $st.mvc.Controller.prototype.registerInjector = function(a, b, c) {
            this.setPlugin(this.injectors, a, b, c)
        }, $st.mvc.Controller.prototype.getResultLoader = function(a) {
            var b = a.loader || "default";
            return this.getLoader(b)
        }, $st.mvc.Controller.prototype.getInjector = function(a) {
            return this.getPlugin(this.injectors, a)
        }, $st.mvc.Controller.prototype.registerLoader = function(a, b, c) {
            this.setPlugin(this.loaders, a, b, c)
        }, $st.mvc.Controller.prototype.getLoader = function(a) {
            return this.getPlugin(this.loaders, a)
        }, $st.mvc.Controller.prototype.inject = function(a) {
            var b = a.result.destination;
            if (!b) return void(this.container.innerHTML = a.rendered);
            var c = b.type || "default",
                d = this.getInjector(c);
            d && d.inject({
                rendered: a.rendered,
                destination: b.destination || b,
                container: this.container,
                controller: this,
                model: a.model
            })
        }, $st.mvc.Controller.prototype.setEventGroup = function(a) {
            this.setEventProperties(a)
        }, $st.mvc.Controller.prototype.setEventProperties = function(a) {
            a.group = this.eventGroup
        }, $st.mvc.Controller.prototype.resolvePlugin = function(a, b, c) {
            return "function" == typeof c ? c : "string" != typeof c ? ($st.core.logging.error("Controller:resolvePlugin - invalid plugin specified for name: " + b), null) : (c = $st.resolve(c)) ? (a[b] || (a[b] = {}), a[b].clazz = c, c) : null
        }, $st.mvc.Controller.prototype.getPlugin = function(a, b) {
            var c = a[b];
            if (c) {
                var d = this.resolvePlugin(a, b, c.clazz);
                if (d) return new d(c.config)
            }
            return null
        }, $st.mvc.Controller.prototype.setPlugin = function(a, b, c, d) {
            var e = {
                clazz: c
            };
            d && (e.config = d), a[b] = e
        }, $st.mvc.Controller.prototype.activatePlugins = function(a, b) {
            if (a[b]) {
                var c = null;
                for (var d in a[b]) "default" != d ? a[b][d].clazz && this.setPlugin(this[b], d, a[b][d].clazz, a[b][d].config) : c = a[b][d];
                c && this[b][c] && (this[b]["default"] = this[b][c])
            }
        }, $st.mvc.Controller.prototype.activateActions = function(a) {
            if (a.actions)
                for (var b in a.actions) {
                    if (a.actions.hasOwnProperty(b) && b in this.actions) {
                        var c = 'Overwriting existing action configuration for "' + b + '"';
                        if (window.console && console.error && console.error(c), "undefined" != typeof jasmine) throw new Error(c)
                    }
                    this.actions[b] = a.actions[b]
                }
        }, $st.mvc.Controller.prototype.activate = function(a) {
            a && ($st.core.event.EventRouter.prototype.activate.call(this, a), this.activateActions(a), this.activatePlugins(a, "renderers"), this.activatePlugins(a, "injectors"), this.activatePlugins(a, "loaders"), a.defaultHandler && (this.defaultHandler = a.defaultHandler), a.enableHistory && (this.enableHistory = a.enableHistory), a.enableTracking && (this.enableTracking = a.enableTracking))
        }, $st.mvc.Controller.prototype.init = function() {
            try {
                this.handleEvent(new $st.core.event.Event({
                    name: "init"
                }))
            } catch (a) {}
        }, $st.mvc.Controller.prototype.start = function() {
            $st.core.event.EventRouter.prototype.start.call(this), this.initHistory(), this.actions.init && window.setTimeout($st.bind(this, "init"), 250)
        }, $st.mvc.Controller.prototype.initHistory = function() {
            this.enableHistory === !0 && $st.core.history.HistoryManager.getInstance().register(this)
        }, $st.mvc.Controller.prototype.getHistoricalID = function() {
            return this.historicalID
        }, $st.mvc.Controller.prototype.setHistoricalID = function(a) {
            this.historicalID = a
        }, $st.mvc.Controller.prototype.renderHistory = function(a) {
            this.state = a.state;
            var b = a.event;
            b._triggeredByHistory = !0, this.handleEvent(b)
        }, $st.mvc.Controller.prototype.storeState = function(a) {
            if (this.enableHistory === !0) {
                var b = {
                    event: a.event,
                    state: this.state ? this.copy(this.state) : {}
                };
                $st.core.history.HistoryManager.getInstance().pushState({
                    component: this,
                    state: b
                })
            }
        }, $st.mvc.Controller.prototype.trackEvent = function(a) {
            var b, c, d = null,
                e = !1;
            this.enableTracking === !0 && (b = a.event.name, d = this.actions[b], d && d.track && ("string" == typeof d.track && (b = d.track), e = !0), c = new $st.core.event.Event({
                data: {
                    name: b
                },
                type: "pageload",
                group: this.name,
                track: !0
            }), $st.core.tracking.TrackingManager.getInstance().handleEvent(c))
        }, $st.mvc.Action = function() {
            this.errors = [], this.fieldErrors = {}, this.data = {}, this.clearErrorsFlag = !0
        }, $st.mvc.Action.prototype.getErrors = function() {
            return this.errors
        }, $st.mvc.Action.prototype.addError = function(a) {
            this.errors.push(a)
        }, $st.mvc.Action.prototype.getFieldErrors = function() {
            return this.fieldErrors
        }, $st.mvc.Action.prototype.addFieldError = function(a, b) {
            this.fieldErrors[a] = b
        }, $st.mvc.injector = {}, $st.mvc.config = {
            injectors: {
                style: {
                    clazz: $st.mvc.plugins.squaretrade.injectors.StyleInjector
                },
                cssClass: {
                    clazz: $st.mvc.plugins.squaretrade.injectors.ClassInjector
                },
                validation: {
                    clazz: $st.mvc.plugins.squaretrade.injectors.ValidationInjector
                },
                script: {
                    clazz: $st.mvc.plugins.squaretrade.injectors.ScriptInjector
                },
                id: {
                    clazz: $st.mvc.plugins.squaretrade.injectors.IDInjector
                },
                query: {
                    clazz: $st.mvc.plugins.squaretrade.injectors.QueryInjector
                },
                "default": "id"
            },
            defaultHandler: $st.mvc.Action
        }, $st.namespace("$st.components"), $st.components.componentClass = "st_fn_component", $st.components.componentDataAttribute = "data-component", $st.components.componentName = "data-component-name", $st.components.Component = $st.defineClass({
            _init: function(a) {
                this.componentID = $st.components.ComponentManager.getInstance().registerComponent(this, a ? a.componentID : null), a && a.container && (a.container.component = this)
            },
            getComponentID: function() {
                return this.componentID
            }
        }), $st.components.ComponentManager = function() {
            function a(a, d) {
                var e = b(a),
                    f = a.getAttribute($st.components.componentName);
                if (e && !c(a)) {
                    var g = {
                        container: a,
                        name: f
                    };
                    d && $st.core.utils.object.merge(g, d), e.init(g)
                }
            }
    
            function b(a) {
                var b = a.getAttribute($st.components.componentDataAttribute);
                return b ? $st.resolve(b) : void 0
            }
    
            function c(a) {
                return !!(a && a.component instanceof $st.components.Component)
            }
    
            function d() {
                return "st_component_" + ++i
            }
    
            function e() {
                var a = $st.components.ComponentManager.getInstance(),
                    b = window.st_tag_components,
                    c = b && b.collectAndClearRegisteredTags();
                c && c.length && a.processComponentTags(c), a.parsePage()
            }
    
            function f() {}
            var g, h = {},
                i = 100;
            return f.prototype.parsePage = function() {
                return this.parseElement(document.body)
            }, f.prototype.parseElement = function(b, c) {
                for (var d = $st.core.dom.query("." + $st.components.componentClass, b), e = 0, f = d.length; f > e; e++) a(d[e], c)
            }, f.prototype.getComponent = function(a) {
                return h[a]
            }, f.prototype.destroyComponent = function(a) {
                return h[a] ? (delete h[a], a) : null
            }, f.prototype.getComponents = function() {
                var a = {};
                for (var b in h) h.hasOwnProperty(b) && (a[b] = h[b]);
                return a
            }, f.prototype.registerComponent = function(a, b) {
                return b = b || d(), h[b] = a, b
            }, f.prototype.processComponentTags = function(a) {
                for (var b = 0, c = a.length; c > b; b++) {
                    var d = a[b][0],
                        e = a[b][1];
                    if (d.hasAttribute("data-component")) {
                        $st.core.dom.addClass(d, $st.components.componentClass);
                        var f;
                        switch (e) {
                            case "body":
                            case "document.body":
                            case "":
                            case null:
                                f = document.body;
                                break;
                            default:
                                f = document.getElementById(e) || $st.core.dom.query(e)[0]
                        }
                        f && f.appendChild(d)
                    }
                }
                this.parsePage()
            }, $st.core.event.addEvent(window, "load", e), {
                getInstance: function() {
                    return g || (g = new f), g
                }
            }
        }(), $st.namespace("$st.components"), $st.components.Overlay = $st.defineClass({
            _init: function(a) {
                this.createContainer(), this.renderComponent(), this.setOptions(a), this.addListeners();
                var b = this.options.triggerAfterDelay;
                if ("number" == typeof b) {
                    this.options.triggerAfterDelay = null;
                    var c = this;
                    setTimeout(function() {
                        c.trigger()
                    }, b)
                }
            },
            setOptions: function(a) {
                if (a = a || {}, this.options = a, a.hasOwnProperty("name") && (this.componentName = a.name), "delegateController" in a && this.setDelegateController(a.delegateController), a.container && a.container !== this.container)
                    for (this.getOptionsFromElement(a.container, a, !1); a.container.firstChild;) this.hostContainer.appendChild(a.container.firstChild);
                this.setPresentationOptions(a)
            },
            setPresentationOptions: function(a) {
                "overlayContent" in a && this.setOverlayContent(a.overlayContent), "isModal" in a && (this.isModal = a.isModal), "hidesDefaultContent" in a && (this.hidesDefaultContent = a.hidesDefaultContent), "contentScrolls" in a && (this.contentScrolls = a.contentScrolls), this.setDimensions(a)
            },
            setDimensions: function(a) {
                var b, c;
                a = a.dimensions || a, "width" in a && (b = a.width, "number" == typeof b && (b += "px"), this.explicitWidth = b), "height" in a && (c = a.height, "number" == typeof c && (c += "px"), this.explicitHeight = c)
            },
            applyPresentationOptions: function() {
                this.explicitWidth && (this.overlayPanel.style.width = this.explicitWidth), this.explicitHeight && (this.overlayPanel.style.height = this.explicitHeight), this.contentScrolls ? (this.dimmingLayer.style.overflow = "", this.overlayPanel.style.maxHeight = "") : (this.dimmingLayer.style.overflow = "auto", this.overlayPanel.style.maxHeight = "none"), this.options.hasOwnProperty("zIndex") && (this.dimmingLayer.style.zIndex = this.options.zIndex)
            },
            createContainer: function() {
                var a = document.createElement("div");
                a.setAttribute("data-component", "$st.components.Overlay"), $st.core.dom.addClass(a, "st_fn_component"), $st.core.dom.addClass(a, "st_overlay"), document.body.appendChild(a), this.container = a
            },
            renderComponent: function() {
                $st.core.dom.addClass(this.container, "is-hidden"), this.dimmingLayer = document.createElement("div"), this.dimmingLayer.setAttribute("data-outlet", "dimmingLayer"), $st.core.dom.addClass(this.dimmingLayer, "st_outlet_dimming_layer"), this.overlayPanel = this.dimmingLayer.appendChild(document.createElement("div")), this.overlayPanel.setAttribute("data-outlet", "overlayPanel"), $st.core.dom.addClass(this.overlayPanel, "st_outlet_overlay_panel"), this.hostContainer = this.overlayPanel.appendChild(document.createElement("div")), this.hostContainer.setAttribute("data-outlet", "hostContainer"), $st.core.dom.addClass(this.hostContainer, "st_outlet_host_container"), this.panelFooter = this.overlayPanel.appendChild(document.createElement("div")), this.panelFooter.setAttribute("data-outlet", "panelFooter"), $st.core.dom.addClass(this.panelFooter, "st_outlet_panel_footer"), this.defaultCloseLink = this.panelFooter.appendChild(document.createElement("a")), this.defaultCloseLink.setAttribute("role", "button"), this.defaultCloseLink.setAttribute("href", "javascript:void(0);"), this.defaultCloseLink.setAttribute("data-outlet", "defaultCloseLink"), $st.core.dom.addClass(this.defaultCloseLink, "st_outlet_default_close_link"), $st.core.dom.addClass(this.defaultCloseLink, "st_overlay_close"), this.defaultCloseLink.innerHTML = this.constructor.defaultCloseLinkContents, $st.core.dom.addClass(this.container, "st_fn_component"), $st.core.dom.addClass(this.container, "st_overlay"), $st.core.dom.addClass(this.container, "st"), this.container.appendChild(this.dimmingLayer)
            },
            addListeners: function() {
                this.boundHandleClick = $st.bind(this, "handleClick"), $st.core.event.addEvent(document.body, "click", this.boundHandleClick), this.boundHandleResize = $st.bind(this, "handleResize"), $st.core.event.addEvent(window, "resize", this.boundHandleResize)
            },
            removeListeners: function() {
                $st.core.event.removeEvent(document.body, "click", this.boundHandleClick, !0), delete this.boundHandleClick, $st.core.event.removeEvent(window, "resize", this.boundHandleResize, !0), delete this.boundHandleResize
            },
            handleClick: function(a) {
                a = new $st.core.event.Event({
                    e: a
                });
                var b = a.getTarget();
                if (b === this.dimmingLayer) return void(this.isModal || this.close());
                for (; b;) {
                    if (1 === b.nodeType) {
                        if ($st.core.dom.hasClass(b, "st_overlay_trigger")) return a.preventDefault(), void this.trigger();
                        if ($st.core.dom.hasClass(b, "st_overlay_close")) return a.preventDefault(), void this.close()
                    }
                    b = b.parentNode
                }
            },
            handleResize: function() {
                this.isShowing && this.adjustPanelHeight()
            },
            setOverlayContent: function(a) {
                this.overlayContent = a
            },
            renderOverlayContent: function(a) {
                switch (typeof a) {
                    case "string":
                        this.hostContainer.innerHTML = a;
                        break;
                    case "object":
                        if (a instanceof HTMLElement || a instanceof DocumentFragment) this.hostContainer.appendChild(a);
                        else if (a instanceof NodeList)
                            for (var b = 0, c = a.length; c > b; b++) this.hostContainer.appendChild(a[b])
                }
            },
            checkAccessibility: function() {
                var a = $st.core.dom.query(".st_overlay_close", this.hostContainer);
                a[0] || this.hidesDefaultContent ? $st.core.dom.removeClass(this.container, "needs_default_close_link") : $st.core.dom.addClass(this.container, "needs_default_close_link")
            },
            adjustPanelHeight: function() {
                if (!this.explicitHeight) {
                    this.overlayPanel.style.height = "";
                    var a = this.overlayPanel.clientHeight,
                        b = this.panelFooter.clientHeight,
                        c = this.hostContainer.offsetHeight;
                    c > a && (this.overlayPanel.style.height = a - b + "px")
                }
            },
            trigger: function(a) {
                if (!this.isShowing) {
                    this.setOptions(a), this.renderOverlayContent(this.overlayContent), this.applyPresentationOptions(), this.checkAccessibility(), $st.core.dom.removeClass(this.container, "is-hidden"), $st.core.dom.addClass(document.body, "st_fixed_viewport"), this.isShowing = !0, this.adjustPanelHeight();
                    var b = this.getDelegateController();
                    b && b.listen(this.container)
                }
            },
            close: function() {
                var a = this.getDelegateController();
                a && a.unListen(this.container), this.setDelegateController(null), $st.core.dom.addClass(this.container, "is-hidden"), $st.core.dom.removeClass(document.body, "st_fixed_viewport"), this.isShowing = !1, this.renderOverlayContent("")
            },
            setDelegateController: function(a) {
                this.delegateController = a
            },
            getDelegateController: function() {
                return this.delegateController
            },
            getOptionsFromElement: function(a, b, c) {
                var d = this.constructor.optionsAttributeMap || {};
                b || (c = !1), b = b || {};
                for (var e in d)
                    if (d.hasOwnProperty(e) && a.hasAttribute(e)) {
                        var f = d[e],
                            g = a.getAttribute(e);
                        switch (f) {
                            case "triggerAfterDelay":
                                g = /[\d.](s|sec)$/.test(g) ? 1e3 * parseFloat(g, 10) : parseFloat(g, 10), ("number" != typeof g || 0 > g) && (g = null);
                                break;
                            case "hidesDefaultContent":
                                g = "false" !== g
                        }
                        a.removeAttribute(e), !c && f in b || (b[f] = g)
                    }
                return b
            }
        }, $st.components.Component), $st.components.Overlay.optionsAttributeMap = {
            "data-hides-default-content": "hidesDefaultContent",
            "data-trigger-after-delay": "triggerAfterDelay"
        }, $st.components.Overlay.defaultCloseLinkContents = '<span class="st_default_close_link_text"></span>', $st.components.Overlay.init = function(a) {
            return $st.components.Overlay.getInstance(a || {})
        }, $st.components.Overlay.getInstance = function(a) {
            return $st.components.Overlay._sharedInstance ? $st.components.Overlay._sharedInstance.setOptions(a) : $st.components.Overlay._sharedInstance = new $st.components.Overlay(a), $st.components.Overlay._sharedInstance
        },
        function() {
            function a() {
                return window[c].defaults || {}
            }
    
            function b() {
                return window[c].displayTable
            }
            $st.components.ProductWidget = $st.defineClass({
                _init: function(a) {
                    this.initController(a), this.setStateOptions(a.options, a.container), this.initConfigs(), this.start()
                },
                initController: function(a) {
                    this.controller = new $st.mvc.Controller({
                        container: a.container,
                        name: a.name
                    }), this.controller.component = this
                },
                setStateOptions: function(b, c) {
                    var d = this.controller.state;
                    $st.core.utils.object.copyOwnPropertiesToTargetFromSource(d, a()), c ? $st.core.utils.object.copyOwnPropertiesToTargetFromSource(d, this.getOptionsFromElement(c)) : d.isOverlay = !0, $st.core.utils.object.copyOwnPropertiesToTargetFromSource(d, b), this.constructor.normalizeLegacyOptions(d)
                },
                getOptionsFromElement: function(a) {
                    var b = this.getLegacyOptionsFromElement(a),
                        c = this.constructor.dataAttributeMap;
                    for (var d in c) a.hasAttribute(d) && (b[c[d]] = a.getAttribute(d));
                    return this.constructor.normalizeAttributeOptions(b)
                },
                getLegacyOptionsFromElement: function(a) {
                    for (var b = this.constructor.LEGACY_KEY_CLASS_REGEXP, c = a.getElementsByTagName("span"), d = {}, e = 0, f = c.length; f > e; e++) {
                        var g = c[e],
                            h = b.exec(g.className),
                            i = h && h[1];
                        i && (d[i] = g.textContent || g.innerText)
                    }
                    return d
                },
                initConfigs: function() {
                    this.configs = [], this.addConfig($st.components.ProductWidget.baseConfig);
                    for (var a = 0, b = this.configs.length; b > a; a++) this.controller.activate(this.configs[a])
                },
                addConfig: function(a, b) {
                    var c = {};
                    for (var d in a)
                        if (a.hasOwnProperty(d)) {
                            if (b && "init" === d) continue;
                            c[d] = a[d]
                        }
                    this.configs.push(c)
                },
                resetTransientControllerState: function() {
                    this.controller.state.didDetermineProductEligibility = !1, this.controller.state.productEligibility = null
                },
                start: function() {
                    this.resetTransientControllerState(), this.controller.start()
                },
                startAsOverlay: function() {
                    this.controller.state.isOverlay = !0, this.start()
                },
                selectQuoteByType: function(a) {
                    this.controller.handleEvent({
                        name: "select",
                        data: {
                            quotetype: a
                        }
                    })
                },
                preselectQuoteType: function(a) {
                    this.controller.state.selectedQuoteType = a
                }
            }, $st.components.Component), $st.components.ProductWidget.init = function(a) {
                return new $st.components.ProductWidget(a)
            }, $st.components.ProductWidget.LEGACY_KEY_CLASS_REGEXP = /\bst_resale_(\w+)\b/i, $st.components.ProductWidget.CONFIGURABLE_PATHS = ["merchantConfigPath", "warrantyQuotePath", "categoryMapPath", "templatePath"], $st.components.ProductWidget.loadScriptResource = function(a, b, c) {
                var d = document.querySelector('script[src="' + a + '"]');
                if (d) {
                    if (d._loaded) return void b.handleEvent({
                        name: c,
                        event: {
                            type: "load",
                            target: d
                        }
                    })
                } else d = document.createElement("script");
                d.readyState ? (d.onreadystatechange || (d.onreadystatechange = function() {
                    var a = d.readyState;
                    if ("loaded" === a || "complete" === a) {
                        d.onreadystatechange = null, d._loaded = !0;
                        for (var b = 0, c = d.callbacks.length; c > b; b++) d.callbacks[b]();
                        delete d.callbacks
                    }
                }, d.callbacks = []), d.callbacks.push(function() {
                    b.handleEvent({
                        name: c,
                        event: {
                            type: "load",
                            target: d
                        }
                    })
                })) : d.addEventListener("load", function(a) {
                    a.target._loaded = !0, b.handleEvent({
                        name: c,
                        event: a
                    })
                }, !1), d.src = a, document.getElementsByTagName("head")[0].appendChild(d)
            }, $st.components.ProductWidget.dataAttributeMap = {
                "data-item-category": "itemCategory",
                "data-item-condition": "itemCondition",
                "data-item-price": "itemPrice"
            }, $st.components.ProductWidget.normalizeAttributeOptions = function(a) {
                return a && "itemPrice" in a && (a.itemPrice = parseFloat(a.itemPrice, 10)), a
            }, $st.components.ProductWidget.legacyOptionMap = {
                imagesDirectoryname: "imagesPath",
                configFilename: "merchantConfigPath",
                templateFilename: "templatePath",
                handlerName: "warrantySelectHandlerName"
            }, $st.components.ProductWidget.normalizeLegacyOptions = function(a) {
                var b = $st.components.ProductWidget.legacyOptionMap;
                if (a)
                    for (var c in a)
                        if (c in b) {
                            var d = b[c],
                                e = a[c]; - 1 !== d.indexOf("Path") && a.basePath && (e = a.basePath + e), a[d] = e, delete a[c]
                        }
                return a
            }, $st.components.ProductWidget.setWarrantyPriceQuotes = function(a) {
                this.warrantyPriceQuotes = a
            }, $st.components.ProductWidget.getWarrantyPriceQuotes = function() {
                return this.warrantyPriceQuotes
            }, $st.components.ProductWidget.setCategoryMap = function(a) {
                var b = {};
                for (var c in a)
                    if (a.hasOwnProperty(c)) {
                        var d = a[c];
                        this.validateCategoryName(d) && (b[c] = d)
                    }
                this.categoryMap = b
            }, $st.components.ProductWidget.validateCategoryName = function() {
                return !0
            }, $st.components.ProductWidget.getCategoryMap = function() {
                return this.categoryMap
            }, $st.components.ProductWidget.setTemplates = function(a) {
                this.templates = $st.core.utils.object.copyOwnPropertiesToTargetFromSource({}, a)
            }, $st.components.ProductWidget.getTemplates = function() {
                return this.templates
            }, $st.components.ProductWidget.setDisplayValueMap = function(a) {
                this.displayValueMap = a
            }, $st.components.ProductWidget.getDisplayValueMap = function() {
                return this.displayValueMap || b()
            }, $st.components.ProductWidget.WarrantyPriceQuote = function(a) {
                this.productID = a[0], this.minItemPrice = a[1], this.maxItemPrice = a[2], this.condition = a[3], this.category = a[4], this.resaleProductID = a[5], this.deductible = a[6], this.servicePlanType = a[7], this.term = a[8], this.price = a[9], this.moreInfoID = a[10];
                var b = a[11],
                    c = $st.components.ProductWidget.getDisplayValueMap();
                c && b in c && (this.display = c[b]), this.catalogRefId = a[12], this.description = "SquareTrade " + this.term + " Year Warranty - " + this.category, this.deselect()
            }, $st.components.ProductWidget.WarrantyPriceQuote.prototype.select = function() {
                this.selected = !0, this.checked = " checked "
            }, $st.components.ProductWidget.WarrantyPriceQuote.prototype.deselect = function() {
                this.selected = !1, this.checked = ""
            }, $st.components.ProductWidget.WarrantyPriceQuote.filterQuotesForItem = function(a, b, c, d) {
                for (var e, f = a.length, g = []; e = a[--f];) e.category === b && e.condition === c && d >= e.minItemPrice && d <= e.maxItemPrice && (g[g.length] = e);
                return g
            }, $st.components.ProductWidget.WarrantyPriceQuote.convertRawPricingData = function(a) {
                var b = [];
                for (var c in a)
                    if (a.hasOwnProperty(c)) {
                        var d = a[c];
                        for (var e in d)
                            if (d.hasOwnProperty(e))
                                for (var f = d[e], g = 0, h = f.length; h > g; g++) {
                                    var i = f[g],
                                        j = new $st.components.ProductWidget.WarrantyPriceQuote(i);
                                    b.push(j)
                                }
                    }
                return b
            }, $st.components.ProductWidget.WarrantyPriceQuote.defaultComparator = function(a, b) {
                var c = $st.components.ProductWidget.WarrantyPriceQuote.priorityComparator(a, b);
                return void 0 !== c ? c : $st.components.ProductWidget.WarrantyPriceQuote.priceComparator(a, b)
            }, $st.components.ProductWidget.WarrantyPriceQuote.priorityComparator = function(a, b) {
                return "priority" in a && "priority" in b ? b.priority === a.priority ? 0 : b.priority > a.priority ? -1 : 1 : void 0
            }, $st.components.ProductWidget.WarrantyPriceQuote.priceComparator = function(a, b) {
                return a.price - b.price
            };
            var c = "st_resale";
            window[c] = window[c] || {}, window[c].onLoadConfig = function(a) {
                var b = $st.components.ProductWidget;
                if (a.categoryMap && b.setCategoryMap(a.categoryMap), a.pricing) {
                    var c = b.WarrantyPriceQuote.convertRawPricingData(a.pricing);
                    b.setWarrantyPriceQuotes(c)
                }
            }, window[c].onLoadTemplates = function(a) {
                $st.components.ProductWidget.setTemplates(a)
            }
        }(),
        function() {
            function a(a, b) {
                var c, d = a.listeningContainers,
                    e = [];
                if (d && d.length) {
                    for (var f = 0, g = d.length; g > f; f++) {
                        var h = $st.core.dom.query("input", d[f]);
                        if (h && h.length)
                            for (var i = 0, j = h.length; j > i; i++) {
                                c = h[i];
                                var k = c.getAttribute("type");
                                ("checkbox" === k || "radio" === k) && e.push(c)
                            }
                    }
                    for (f = 0, g = e.length; g > f; f++)
                        if (c = e[f], c.checked = !1, b) {
                            var l = a.getEventData(c);
                            l.quotetype === b && (c.checked = !0)
                        }
                }
            }
    
            function b(a, b, c) {
                if (a) {
                    var d = $st.resolve(a);
                    if ("function" == typeof d) return d.apply(c, b || [])
                }
            }
    
            function c(a, c) {
                return b(c.warrantySignatureHandlerName, [a]) || [a.productID, a.price, a.description]
            }
            $st.components.ProductWidget.actions = {};
            $st.components.ProductWidget.actions.LoadResourcesAction = $st.defineClass({
                execute: function() {
                    var a = this.model.state,
                        b = $st.components.ProductWidget.CONFIGURABLE_PATHS;
                    if (a.fullyLoaded) return "loaded";
                    for (var c = 0, d = b.length; d > c; c++) {
                        var e = b[c];
                        e in a && $st.components.ProductWidget.loadScriptResource(a[e], this.controller, "load")
                    }
                    return "loading"
                }
            }, $st.mvc.Action), $st.components.ProductWidget.actions.CheckLoadStateAction = $st.defineClass({
                execute: function() {
                    var a = $st.components.ProductWidget.categoryMap,
                        b = $st.components.ProductWidget.templates,
                        c = $st.components.ProductWidget.warrantyPriceQuotes,
                        d = a ? 0 === $st.core.utils.object.keys(a).length : !0,
                        e = b ? 0 === $st.core.utils.object.keys(b).length : !0,
                        f = c ? 0 === c.length : !0;
                    return d || e || f ? "loading" : (this.model.state.fullyLoaded = !0, "loaded")
                }
            }, $st.mvc.Action), $st.components.ProductWidget.actions.ProductEligibilityAction = $st.defineClass({
                execute: function() {
                    var a = this.model.state;
                    if (a.didDetermineProductEligibility) return a.productEligibility;
                    if (a.productEligibility = "eligible", a.productEligibilityHandlerName) {
                        var c = [a.itemCategory, a.itemCondition, a.itemPrice],
                            d = b(a.productEligibilityHandlerName, c);
                        a.didDetermineProductEligibility = "boolean" == typeof d, d === !1 && (a.productEligibility = "ineligible")
                    }
                    return a.productEligibility
                }
            }, $st.mvc.Action), $st.components.ProductWidget.actions.FilterQuotesAction = $st.defineClass({
                execute: function() {
                    var a = $st.components.ProductWidget,
                        b = a.WarrantyPriceQuote,
                        c = this.model.state,
                        d = c.itemPrice,
                        e = c.itemCategory,
                        f = c.itemCondition,
                        g = $st.components.ProductWidget.getCategoryMap();
                    if (g)
                        for (var h = $st.core.utils.object.keys(g), i = 0, j = h.length; j > i; i++) h[i].toLowerCase() === e.toLowerCase() && (e = g[h[i]]);
                    var k = a.getWarrantyPriceQuotes(),
                        l = b.filterQuotesForItem(k, e, f, d);
                    return c.quotes = {
                        filtered: l
                    }, l.length ? "success" : (window.console && console.warn && console.warn("FilterQuotesAction: No applicable quotes filtered from set of", k.length, " available quotes..."), "none")
                }
            }, $st.mvc.Action), $st.components.ProductWidget.actions.PrioritizeFilteredQuotesAction = $st.defineClass({
                execute: function() {
                    var a = this.model.state,
                        b = (this.model.event, a.quotes.filtered);
                    switch (b.sort($st.components.ProductWidget.WarrantyPriceQuote.defaultComparator), b.length) {
                        case 2:
                            a.quotes.upsell = b[1], a.quotes.base = b[0];
                            break;
                        case 1:
                            a.quotes.base = b[0];
                            break;
                        case 0:
                    }
                    return "success"
                }
            }, $st.mvc.Action), $st.components.ProductWidget.actions.PreselectQuoteAction = $st.defineClass({
                execute: function() {
                    {
                        var d = this.model.state;
                        this.model.event
                    }
                    return d.quotes.selected && d.quotes.selected.deselect(), d.quotes.selected = d.quotes[d.selectedQuoteType], a(this.controller, d.selectedQuoteType), d.quotes.selected && (d.quotes.selected.select(), b(d.warrantySelectHandlerName, c(d.quotes.selected, d))), "success"
                }
            }, $st.mvc.Action), $st.components.ProductWidget.actions.TemplateChoiceAction = $st.defineClass({
                execute: function() {
                    var a, c = this.model.state,
                        d = c.quotes;
                    d && (d.base && d.upsell ? a = "two_quotes" : d.base && (a = "one_quote")), c.isOverlay && a && (a = "overlay_" + a), a = a || "none", this.model.templateName = a;
                    var e = this.controller.container;
                    return setTimeout(function() {
                        b(c.templateRenderedHandlerName, [a, e])
                    }), a
                }
            }, $st.mvc.Action), $st.components.ProductWidget.actions.SelectQuoteAction = $st.defineClass({
                execute: function() {
                    var d = this.model.state,
                        e = this.model.event,
                        f = e.data.quotetype;
                    e.data.selectedOptions && e.data.selectedOptions.length && (f = e.data.selectedOptions[0].value);
                    var g = "checked" in e.data ? e.data.checked : !0;
                    d.selectedQuoteType = g ? f : "none", d.quotes.selected && d.quotes.selected.deselect(), d.quotes.selected = d.quotes[d.selectedQuoteType], d.quotes.selected && d.quotes.selected.select(), a(this.controller, d.selectedQuoteType), b(d.warrantySelectHandlerName, c(d.quotes.selected || {}, d))
                }
            }, $st.mvc.Action), $st.components.ProductWidget.actions.PurchaseWarrantyAction = $st.defineClass({
                execute: function() {
                    var a = this.model.state;
                    b(a.warrantyPurchaseHandlerName, c(a.quotes.selected, a))
                },
                validate: function() {
                    if (!this.model.state.quotes.selected) {
                        var a = "No warranty was selected.";
                        this.addError(a)
                    }
                }
            }, $st.mvc.Action), $st.components.ProductWidget.actions.DeclineCoverageAction = $st.defineClass({
                execute: function() {
                    return this.controller.component.selectQuoteByType("none"), $st.components.Overlay.getInstance().close(), b(this.model.state.declineCoverageHandlerName), "success"
                }
            }, $st.mvc.Action), $st.components.ProductWidget.actions.ShowMoreInfoAction = $st.defineClass({
                execute: function() {
                    var a = this.model.state,
                        b = this.model.event,
                        c = "none";
                    b.data && (b.data.overlay && (c = "overlay"), b.data["new-window"] && (c = "new-window")), a.overlayQuoteType = null;
                    for (var d in this.actionMapping.results)
                        for (var e = this.actionMapping.results[d], f = 0, g = e.length; g > f; f++) {
                            var h = e[f],
                                i = h.destination = h.destination || {};
                            if (h.template = null, i.destination && (i.destination.url = null), "overlay" === c && (h.template = b.data.overlay, a.overlayQuoteType = b.data.quotetype, b.preventDefault()), "new-window" === c) {
                                i.destination = i.destination || {};
                                var j = b.data["new-window"].toLowerCase(),
                                    k = b.getTarget();
                                i.destination.url = k && k.hasAttribute && b.target.hasAttribute(j) ? k.getAttribute(j) : j
                            }
                        }
                    return c
                }
            }, $st.mvc.Action)
        }(), $st.namespace("$st.components.ProductWidget"), $st.components.ProductWidget.injectors = {}, $st.components.ProductWidget.injectors.NewWindowInjector = function() {}, $st.components.ProductWidget.injectors.NewWindowInjector.prototype.logger = $st.core.logging, $st.components.ProductWidget.injectors.NewWindowInjector.prototype.inject = function(a) {
            var b = a.destination,
                c = b.windowName || "stmoreinfo",
                d = b.url;
            return d ? window.open(d, c) : void console.warn("No URL for NewWindowInjector?")
        }, $st.components.ProductWidget.injectors.CallbackInjector = function() {}, $st.components.ProductWidget.injectors.CallbackInjector.prototype.logger = $st.core.logging, $st.components.ProductWidget.injectors.CallbackInjector.prototype.inject = function(a) {
            var b = a.destination;
            "function" == typeof b && b(a)
        }, $st.components.ProductWidget.baseConfig = {
            renderers: {
                viewRenderer: {
                    clazz: $st.mvc.plugins.freemarker.renderer.ViewRenderer
                },
                "default": "viewRenderer"
            },
            injectors: {
                chain: {
                    clazz: $st.mvc.plugins.squaretrade.injectors.ChainInjector
                },
                overlay: {
                    clazz: $st.mvc.plugins.squaretrade.injectors.OverlayInjector
                },
                "new-window": {
                    clazz: $st.components.ProductWidget.injectors.NewWindowInjector
                },
                callback: {
                    clazz: $st.components.ProductWidget.injectors.CallbackInjector
                }
            },
            loaders: {
                viewLoader: {
                    clazz: $st.mvc.plugins.freemarker.loader.ViewLoader,
                    config: {
                        templateNamespace: "$st.components.ProductWidget.templates"
                    }
                },
                "default": "viewLoader"
            },
            actions: {
                init: {
                    handler: $st.components.ProductWidget.actions.LoadResourcesAction,
                    results: {
                        loaded: [{
                            destination: {
                                type: "chain",
                                destination: "eligibility"
                            }
                        }]
                    }
                },
                load: {
                    handler: $st.components.ProductWidget.actions.CheckLoadStateAction,
                    results: {
                        loaded: [{
                            destination: {
                                type: "chain",
                                destination: "eligibility"
                            }
                        }]
                    }
                },
                eligibility: {
                    handler: $st.components.ProductWidget.actions.ProductEligibilityAction,
                    results: {
                        eligible: [{
                            destination: {
                                type: "chain",
                                destination: "filter-quotes"
                            }
                        }]
                    }
                },
                "filter-quotes": {
                    handler: $st.components.ProductWidget.actions.FilterQuotesAction,
                    results: {
                        success: [{
                            destination: {
                                type: "chain",
                                destination: "prioritize-filtered-quotes"
                            }
                        }]
                    }
                },
                "prioritize-filtered-quotes": {
                    handler: $st.components.ProductWidget.actions.PrioritizeFilteredQuotesAction,
                    results: {
                        success: [{
                            destination: {
                                type: "chain",
                                destination: "preselect-quote"
                            }
                        }]
                    }
                },
                "preselect-quote": {
                    handler: $st.components.ProductWidget.actions.PreselectQuoteAction,
                    results: {
                        success: [{
                            destination: {
                                type: "chain",
                                destination: "template-choice"
                            }
                        }]
                    }
                },
                "template-choice": {
                    handler: $st.components.ProductWidget.actions.TemplateChoiceAction,
                    results: {
                        none: [{
                            template: "none"
                        }],
                        one_quote: [{
                            template: "one_quote"
                        }],
                        two_quotes: [{
                            template: "two_quotes"
                        }],
                        overlay_one_quote: [{
                            template: "overlay_one_quote",
                            destination: {
                                type: "overlay",
                                destination: {
                                    method: "show",
                                    options: {
                                        isModal: !0
                                    }
                                }
                            }
                        }],
                        overlay_two_quotes: [{
                            template: "overlay_two_quotes",
                            destination: {
                                type: "overlay",
                                destination: {
                                    method: "show",
                                    options: {
                                        isModal: !0
                                    }
                                }
                            }
                        }]
                    }
                },
                select: {
                    handler: $st.components.ProductWidget.actions.SelectQuoteAction
                },
                purchase: {
                    handler: $st.components.ProductWidget.actions.PurchaseWarrantyAction
                },
                decline: {
                    handler: $st.components.ProductWidget.actions.DeclineCoverageAction
                },
                moreinfo: {
                    handler: $st.components.ProductWidget.actions.ShowMoreInfoAction,
                    results: {
                        overlay: [{
                            template: null,
                            destination: {
                                type: "overlay",
                                destination: {
                                    method: "show"
                                }
                            }
                        }],
                        "new-window": [{
                            destination: {
                                type: "new-window",
                                destination: {
                                    url: null
                                }
                            }
                        }]
                    }
                }
            },
            enableHistory: !1,
            enableTracking: !1
        },
        function() {
            "use strict";
            String.prototype.repeat || (String.prototype.repeat = function(a) {
                for (var b = [], c = 0; a > c; c++) b.push(this);
                return b.join("")
            }), String.prototype.trim || (String.prototype.trim = function() {
                return this.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, "")
            });
            var a, b = {
                    assign: function(a) {
                        return a + "; "
                    },
                    include: function(a, b) {
                        return "_output.push(FreeMarker.render({loader: loader, model: _s_, templateName: " + a + ", depth: " + b + "}));"
                    }
                },
                c = {
                    list: function(a, b, c) {
                        var d = a.split(" as "),
                            e = "_i" + q.forEnumerator + "_",
                            f = "_len" + q.forEnumerator + "_",
                            g = d[0],
                            h = d[1];
                        return q.forEnumerator += 1, "for (" + e + " = 0, " + f + " = " + g + " && " + g + ".length; " + e + " < " + f + "; " + e + "++) {\n_s_." + h + " = " + g + "[" + e + "];\n_s_." + h + "_index = " + e + ";\n_s_." + h + "_has_next = ((" + e + " + 1) < " + f + ");\n" + n(b, c + 1) + "\n}\n"
                    },
                    "if": function(a, b, c) {
                        var d, e, f, g = "if (" + a + ") {\n",
                            h = /<#(if|elseif|else)/,
                            i = "",
                            j = b,
                            k = function() {
                                i += j.slice(0, f.index), g += n(i, c), i = "", j = j.slice(f.index + d.length + 2), a = m(j, ">"), e = a.end
                            };
                        for (f = j.match(h); f;) {
                            switch (d = f[1]) {
                                case "if":
                                    e = l("if", j.slice(f.index + 4)), i += j.slice(0, e);
                                    break;
                                case "elseif":
                                    k(), g += "} else if (" + a.text + ") {\n";
                                    break;
                                case "else":
                                    k(), g += "} else {\n"
                            }
                            j = j.slice(e + 1), f = j.match(h)
                        }
                        return g += n(i, c), g + n(j, c) + "}\n"
                    }
                },
                d = function(a) {
                    var b, c, d, e = /(.*?)\$\{/,
                        f = "_output.push(";
                    for (d = e.exec(a); d;) b = d[0].length, c = m(a.slice(b), "}"), f += "'" + d[1] + "' + " + c.text + " + ", a = a.slice(b + c.end + 1), d = e.exec(a);
                    return f += "'" + a + "'", f += ");\n"
                },
                e = {
                    "(": ")",
                    "{": "}",
                    "[": "]",
                    '"': '"',
                    "'": "'",
                    "/": "/"
                },
                f = function(a) {
                    return a.replace(/([\w\.\[\]]+)/g, "_s_.$1")
                },
                g = function(a) {
                    for (var b, c, d = "", h = 0; h < a.length; h++) "string" == typeof a[h] ? d += a[h].match(/^[\?\[\]\d\.]/) || j(a[h].charAt(0)) ? a[h] : "as " == a[h].slice(0, 3) ? " " + a[h] : f(a[h]) : (a[h].tokenWrapper = a[h].tokenWrapper || "(", d += a[h].tokenWrapper + g(a[h].tokens) + e[a[h].tokenWrapper]);
                    if (b = d.split("?"), b.length > 1) {
                        c = b.shift();
                        for (var i in b) {
                            var k;
                            k = "_fm.", k += "_s_" == b[i].slice(0, 3) ? b[i].slice(4) : b[i], k += "(" + c + ")", c = k
                        }
                        d = c
                    }
                    return d
                },
                h = function(a, b) {
                    var c;
                    if (c = a.match(/(.*?)\s+(as\s+\w+)/)) b.push(c[1]), b.push(c[2]);
                    else {
                        c = a.split(" ");
                        for (var d = 0, e = c.length; e > d; d++) b.push(c[d])
                    }
                },
                i = function(a, b) {
                    for (var c, d = 0, f = [], g = 0; g < a.length; g++) {
                        var l = a.charAt(g);
                        if (e[l]) {
                            d != g && h(a.slice(d, g), f), d = g;
                            var m = j(l);
                            c = k({
                                opener: l,
                                closer: e[l],
                                quoted: m
                            }, a.slice(g + 1)), f.push(m ? a.slice(d, d + c + 2) : i(a.slice(d + 1, d + c + 1), {
                                tokenWrapper: l
                            })), g += c + 2, d = g
                        }
                        if (a.charAt(g) == b.endChar || g >= a.length) return d != g && h(a.slice(d, g), f), {
                            tokens: f,
                            end: g,
                            tokenWrapper: b.tokenWrapper
                        }
                    }
                    return h(a.slice(d, a.length), f), {
                        tokens: f,
                        end: a.length,
                        tokenWrapper: b.tokenWrapper
                    }
                },
                j = function(a) {
                    switch (a) {
                        case "'":
                        case '"':
                        case "/":
                            return !0;
                        default:
                            return !1
                    }
                },
                k = function(a, b) {
                    for (var c, d = a.opener, e = a.closer, f = 0, g = 0; g < b.length; g++) {
                        c = g && "\\" === b.charAt(g - 1) && "\\" !== b.charAt(g - 2);
                        var h = b.charAt(g);
                        if (h !== e || c) h !== d || c ? j(h) && !a.quoted && (g += k({
                            opener: h,
                            closer: h,
                            quoted: !0
                        }, b.slice(g + 1)) + 1) : f++;
                        else {
                            if (0 === f) return g;
                            f--
                        }
                    }
                },
                l = function(a, b) {
                    var c, d = RegExp("</?#" + a),
                        e = b,
                        f = 0,
                        g = 0;
                    for (c = e.match(d); c;) {
                        if (f += c.index, "/" == c[0].charAt(1)) {
                            if (0 === g) return f;
                            c.index += 2, f += 2, g--
                        } else g++;
                        f += a.length + 2, e = e.slice(c.index + a.length + 2), c = e.match(d)
                    }
                    throw "Closing " + a + " tag not found"
                },
                m = function(a, b) {
                    var c = i(a, {
                            endChar: b
                        }),
                        d = g(c.tokens);
                    return {
                        text: d,
                        end: c.end
                    }
                },
                n = function(a, e) {
                    if (e = e || 0, a = a && a.length ? a.replace(/\s+/g, " ").trim() : "", "" === a) return "";
                    var f, g, h, i, j, k, o = "";
                    if (f = a.match(/<#(.*?) /), !f) return d(a, e);
                    if (o += n(a.slice(0, f.index), e), h = f[1], j = a.slice(f.index + h.length + 2), g = m(j, ">"), j = j.slice(g.end + 1), b[h]) return o + b[h](g.text, e) + n(j, e);
                    if (c[h]) return k = l(h, j), i = c[h](g.text, j.slice(0, k).trim(), e), j = j.slice(k).trim().slice(4 + h.length), o + i + n(j, e);
                    throw "Unsupported Operator '" + h + "'"
                },
                o = function(a, b) {
                    var c = "var _fm = FreeMarker.formatters;\nvar _output = [];\n" + n(a, b) + '\nreturn _output.join("");\n';
                    return c
                },
                p = {};
            "object" == typeof $st && "function" == typeof $st.namespace ? ($st.namespace("$st.mvc.plugins.freemarker.formatter"), a = $st.mvc.plugins.freemarker.formatter) : a = {};
            var q = {
                _cached: p,
                forEnumerator: 0,
                formatters: a,
                render: function(a) {
                    var b = a.loader,
                        c = b.load({
                            templateName: a.templateName
                        });
                    return "function" != typeof c && (c = q.compile(c, a.depth || 0)), c(b, a.model)
                },
                compile: function(a, b) {
                    var c = a,
                        d = p[c];
                    if (!d) {
                        var e = o(a, b || 0);
                        d = new Function("loader", "_s_", e), p[c] = d
                    }
                    return d
                }
            };
            "undefined" != typeof module && (module.exports = q), "undefined" != typeof window && (window.FreeMarker = q)
        }();        
});
