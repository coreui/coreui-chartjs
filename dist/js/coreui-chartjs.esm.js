/*!
  * CoreUI Plugins - Chart.js for CoreUI 3 v2.0.0 (https://coreui.io)
  * Copyright 2020 creativeLabs Łukasz Holeczek
  * Licensed under MIT (https://coreui.io/license/)
  */
import 'chart.js';

/**
 * --------------------------------------------------------------------------
 * Custom Tooltips for Chart.js (vv2.0.0-beta.0): custom-tooltips.js
 * Licensed under MIT (https://coreui.io/plugins/chart.js)
 * --------------------------------------------------------------------------
 */
function customTooltips(tooltipModel) {
  // Add unique id if not exist
  var _setCanvasId = () => {
    var _idMaker = () => {
      var _hex = 16;
      var _multiplier = 0x10000;
      return ((1 + Math.random()) * _multiplier | 0).toString(_hex);
    };

    var _canvasId = "_canvas-" + (_idMaker() + _idMaker());

    this._chart.canvas.id = _canvasId;
    return _canvasId;
  };

  var ClassName = {
    ABOVE: 'c-above',
    BELOW: 'c-below',
    CHARTJS_TOOLTIP: 'c-chartjs-tooltip',
    NO_TRANSFORM: 'c-no-transform',
    TOOLTIP_BODY: 'c-tooltip-body',
    TOOLTIP_BODY_ITEM: 'c-tooltip-body-item',
    TOOLTIP_BODY_ITEM_COLOR: 'c-tooltip-body-item-color',
    TOOLTIP_BODY_ITEM_LABEL: 'c-tooltip-body-item-label',
    TOOLTIP_BODY_ITEM_VALUE: 'c-tooltip-body-item-value',
    TOOLTIP_HEADER: 'c-tooltip-header',
    TOOLTIP_HEADER_ITEM: 'c-tooltip-header-item'
  };
  var Selector = {
    DIV: 'div',
    SPAN: 'span',
    TOOLTIP: (this._chart.canvas.id || _setCanvasId()) + "-tooltip"
  };
  var tooltip = document.getElementById(Selector.TOOLTIP);

  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = Selector.TOOLTIP;
    tooltip.className = ClassName.CHARTJS_TOOLTIP;

    this._chart.canvas.parentNode.appendChild(tooltip);
  } // Hide if no tooltip


  if (tooltipModel.opacity === 0) {
    tooltip.style.opacity = 0;
    return;
  } // Set caret Position


  tooltip.classList.remove(ClassName.ABOVE, ClassName.BELOW, ClassName.NO_TRANSFORM);

  if (tooltipModel.yAlign) {
    tooltip.classList.add(tooltipModel.yAlign);
  } else {
    tooltip.classList.add(ClassName.NO_TRANSFORM);
  } // Set Text


  if (tooltipModel.body) {
    var titleLines = tooltipModel.title || [];
    var tooltipHeader = document.createElement(Selector.DIV);
    tooltipHeader.className = ClassName.TOOLTIP_HEADER;
    titleLines.forEach(title => {
      var tooltipHeaderTitle = document.createElement(Selector.DIV);
      tooltipHeaderTitle.className = ClassName.TOOLTIP_HEADER_ITEM;
      tooltipHeaderTitle.innerHTML = title;
      tooltipHeader.appendChild(tooltipHeaderTitle);
    });
    var tooltipBody = document.createElement(Selector.DIV);
    tooltipBody.className = ClassName.TOOLTIP_BODY;
    var tooltipBodyItems = tooltipModel.body.map(item => item.lines);
    tooltipBodyItems.forEach((item, i) => {
      var tooltipBodyItem = document.createElement(Selector.DIV);
      tooltipBodyItem.className = ClassName.TOOLTIP_BODY_ITEM;
      var colors = tooltipModel.labelColors[i];
      var tooltipBodyItemColor = document.createElement(Selector.SPAN);
      tooltipBodyItemColor.className = ClassName.TOOLTIP_BODY_ITEM_COLOR;
      tooltipBodyItemColor.style.backgroundColor = colors.backgroundColor;
      tooltipBodyItem.appendChild(tooltipBodyItemColor);

      if (item[0].split(':').length > 1) {
        var tooltipBodyItemLabel = document.createElement(Selector.SPAN);
        tooltipBodyItemLabel.className = ClassName.TOOLTIP_BODY_ITEM_LABEL;
        tooltipBodyItemLabel.innerHTML = item[0].split(': ')[0];
        tooltipBodyItem.appendChild(tooltipBodyItemLabel);
        var tooltipBodyItemValue = document.createElement(Selector.SPAN);
        tooltipBodyItemValue.className = ClassName.TOOLTIP_BODY_ITEM_VALUE;
        tooltipBodyItemValue.innerHTML = item[0].split(': ').pop();
        tooltipBodyItem.appendChild(tooltipBodyItemValue);
      } else {
        var _tooltipBodyItemValue = document.createElement(Selector.SPAN);

        _tooltipBodyItemValue.className = ClassName.TOOLTIP_BODY_ITEM_VALUE;
        _tooltipBodyItemValue.innerHTML = item[0];
        tooltipBodyItem.appendChild(_tooltipBodyItemValue);
      }

      tooltipBody.appendChild(tooltipBodyItem);
    });
    tooltip.innerHTML = '';
    tooltip.appendChild(tooltipHeader);
    tooltip.appendChild(tooltipBody);
  }

  var position = this._chart.canvas.getBoundingClientRect();

  var positionY = this._chart.canvas.offsetTop;
  var positionX = this._chart.canvas.offsetLeft;
  var positionLeft = positionX + tooltipModel.caretX;
  var positionTop = positionY + tooltipModel.caretY; // eslint-disable-next-line

  var halfWidth = tooltipModel.width / 2;

  if (positionLeft + halfWidth > position.width) {
    positionLeft -= halfWidth;
  } else if (positionLeft < halfWidth) {
    positionLeft += halfWidth;
  } // Display, position, and set styles for font


  tooltip.style.opacity = 1;
  tooltip.style.left = positionLeft + "px";
  tooltip.style.top = positionTop + "px";
}

export { customTooltips };
//# sourceMappingURL=coreui-chartjs.esm.js.map
