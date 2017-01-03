/**
 * vConsole Default Tab
 *
 * @author WechatFE
 */

import $ from '../lib/query.js';
import * as tool from '../lib/tool.js';
import VConsoleLogTab from './log.js';
import tplTabbox from './tabbox_bigview.html';
import tplItemCode from './item_code.html';

class VConsoleBigViewTab extends VConsoleLogTab {

  constructor(...args) {
    super(...args);
    this.tplTabbox = tplTabbox;
    this.windowOnError = null;
  }

  onReady() {
    let that = this;
    super.onReady();
    window.mode = function (i) {
      // alert((window.location.href + "bigview_mode=" + i))
      document.cookie="bigview_mode="+i;
      // window.location.href = (window.location.href + "bigview_mode=" + i)
    }
    // $.bind($.one('.vc-cmd', this.$tabbox), 'click', function(e) {
//       e.preventDefault();
//       alert($(this))
//     });
  }

  /**
   * replace window.console & window.onerror with vConsole method
   * @private
   */
  mockConsole() {
    super.mockConsole();
    var that = this;
    if (tool.isFunction(window.onerror)) {
      this.windowOnError = window.onerror;
    }
    window.onerror = function(message, source, lineNo, colNo, error) {
      let msg = message;
      if (source) {
        msg += "\n" + source.replace(location.origin, '');
      }
      if (lineNo || colNo) {
        msg += ':' + lineNo + ':' + colNo;
      }
      that.printLog({logType:'error', logs:[msg], noOrigin:true});
      if (tool.isFunction(that.windowOnError)) {
        that.windowOnError.call(window, message, source, lineNo, colNo, error);
      }
    };
  }

  /**
   * 
   * @private
   */
  evalCommand(cmd) {
    // print command to console
    this.printLog({
      logType: 'log',
      content: $.render(tplItemCode, {content: cmd, type: 'input'}),
      noMeta: true,
      style: ''
    });
    // eval
    try {
      let result = eval(cmd);
      // print result to console
      let $content;
      if (tool.isArray(result) || tool.isObject(result)) {
        $content = this.getFoldedLine(result);
      } else {
        if (tool.isNull(result)) {
          result = 'null';
        } else if (tool.isUndefined(result)) {
          result = 'undefined';
        } else if (tool.isFunction(result)) {
          result = 'function()'
        } else if (tool.isString(result)) {
          result = '"' + result + '"';
        }
        $content = $.render(tplItemCode, {content: result, type: 'output'});
      }
      this.printLog({
        logType: 'log',
        content: $content,
        noMeta: true,
        style: ''
      });
    } catch (e) {
      this.printLog({
        logType: 'error',
        logs: [e.message],
        noMeta: true,
        style: ''
      });
    }
  }

} // END class

export default VConsoleBigViewTab;