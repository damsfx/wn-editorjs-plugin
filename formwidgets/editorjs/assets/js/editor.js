/*
 * Rich text editor with blocks form field control (WYSIWYG)
 *
 * Data attributes:
 * - data-control="editor" - enables the rich editor plugin
 *
 * JavaScript API:
 * $('input').editor()
 *
 */

+function ($) {
    "use strict";
    var Base = $.oc.foundation.base,
        BaseProto = Base.prototype

    // Editor CLASS DEFINITION
    // ============================

    var Editor = function (element, options) {
        this.options = options
        this.$el = $(element)
        this.$form = this.$el.closest('form')
        this.$input = this.$form.find('#' + this.$el.attr('id') + '_input')

        $.oc.foundation.controlUtils.markDisposable(element)

        Base.call(this)

        this.init()
    }

    Editor.prototype = Object.create(BaseProto)
    Editor.prototype.constructor = Editor

    Editor.prototype.init = function () {

        this.editor = new EditorJS({
            holder: this.$el.attr('id'),
            tools: {
                // header: Header,
                // list: List,
                linkTool: {
                    class: LinkTool,
                    config: {
                        endpoint: '/editorjs/linkTool',
                    }
                },
                paragraph: {
                    config: {
                        placeholder: this.$el.data('placeholder') ? this.$el.data('placeholder') : 'Tell your story...'
                    }
                }
            }
        });
        this.initProxy()
    }

    Editor.prototype.initProxy = function () {
        this.$form.on('oc.beforeRequest', this.proxy(this.onFormBeforeRequest))
    }

    /*
     * Instantly synchronizes HTML content.
     */
    Editor.prototype.onFormBeforeRequest = function (ev) {
        this.$input.val(this.getHtml());
    }

    Editor.prototype.getHtml = function () {
        $.ajax({
            url: '/editorjs/save',
            beforeSend: function( xhr ) {
                xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
            }
        })
    }

    // Editor PLUGIN DEFINITION
    // ============================

    var old = $.fn.Editor

    $.fn.Editor = function (option) {
        var args = Array.prototype.slice.call(arguments, 1), result
        this.each(function () {
            var $this = $(this)
            var data = $this.data('oc.Editor')
            var options = $.extend({}, Editor.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('oc.Editor', (data = new Editor(this, options)))
            if (typeof option == 'string') result = data[option].apply(data, args)
            if (typeof result != 'undefined') return false
        })

        return result ? result : this
    }

    $.fn.Editor.Constructor = Editor

    // Editor NO CONFLICT
    // =================

    $.fn.Editor.noConflict = function () {
        $.fn.Editor = old
        return this
    }

    // Editor DATA-API
    // ===============

    $(document).render(function () {
        $('[data-control="editor"]').Editor();
    })

}(window.jQuery);