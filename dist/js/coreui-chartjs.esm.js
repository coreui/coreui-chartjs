/*!
  * CoreUI Plugins - Chart.js for CoreUI 3 v2.0.0-alpha.0 (https://coreui.io)
  * Copyright 2019 Łukasz Holeczek
  * Licensed under MIT (https://coreui.io/plugins/chart.js)
  */
/**
 * --------------------------------------------------------------------------
 * Custom Tooltips for Chart.js (v2.0.0-alpha.0): custom-tooltips.js
 * Licensed under MIT (https://coreui.io/plugins/chart.js)
 * --------------------------------------------------------------------------
 */
function CustomTooltips(tooltipModel) {
  // Add unique id if not exist
  const _setCanvasId = () => {
    const _idMaker = () => {
      const _hex = 16;
      const _multiplier = 0x10000;
      return ((1 + Math.random()) * _multiplier | 0).toString(_hex);
    };

    const _canvasId = "_canvas-" + (_idMaker() + _idMaker());

    this._chart.canvas.id = _canvasId;
    return _canvasId;
  }; // eslint-disable-next-line no-nested-ternary


  const PREFIX = window.CoreUIDefaults ? window.CoreUIDefaults.prefix ? window.CoreUIDefaults.prefix : 'c-' : 'c-';
  const ClassName = {
    ABOVE: PREFIX + "above",
    BELOW: PREFIX + "below",
    CHARTJS_TOOLTIP: PREFIX + "chartjs-tooltip",
    NO_TRANSFORM: PREFIX + "no-transform",
    TOOLTIP_BODY: PREFIX + "tooltip-body",
    TOOLTIP_BODY_ITEM: PREFIX + "tooltip-body-item",
    TOOLTIP_BODY_ITEM_COLOR: PREFIX + "tooltip-body-item-color",
    TOOLTIP_BODY_ITEM_LABEL: PREFIX + "tooltip-body-item-label",
    TOOLTIP_BODY_ITEM_VALUE: PREFIX + "tooltip-body-item-value",
    TOOLTIP_HEADER: PREFIX + "tooltip-header",
    TOOLTIP_HEADER_ITEM: PREFIX + "tooltip-header-item"
  };
  const Selector = {
    DIV: 'div',
    SPAN: 'span',
    TOOLTIP: (this._chart.canvas.id || _setCanvasId()) + "-tooltip"
  };
  let tooltip = document.getElementById(Selector.TOOLTIP);

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
    const titleLines = tooltipModel.title || [];
    const tooltipHeader = document.createElement(Selector.DIV);
    tooltipHeader.className = ClassName.TOOLTIP_HEADER;
    titleLines.forEach(title => {
      const tooltipHeaderTitle = document.createElement(Selector.DIV);
      tooltipHeaderTitle.className = ClassName.TOOLTIP_HEADER_ITEM;
      tooltipHeaderTitle.innerHTML = title;
      tooltipHeader.appendChild(tooltipHeaderTitle);
    });
    const tooltipBody = document.createElement(Selector.DIV);
    tooltipBody.className = ClassName.TOOLTIP_BODY;
    const tooltipBodyItems = tooltipModel.body.map(item => item.lines);
    tooltipBodyItems.forEach((item, i) => {
      const tooltipBodyItem = document.createElement(Selector.DIV);
      tooltipBodyItem.className = ClassName.TOOLTIP_BODY_ITEM;
      const colors = tooltipModel.labelColors[i];
      const tooltipBodyItemColor = document.createElement(Selector.SPAN);
      tooltipBodyItemColor.className = ClassName.TOOLTIP_BODY_ITEM_COLOR;
      tooltipBodyItemColor.style.backgroundColor = colors.backgroundColor;
      tooltipBodyItem.appendChild(tooltipBodyItemColor);

      if (item[0].split(':').length > 1) {
        const tooltipBodyItemLabel = document.createElement(Selector.SPAN);
        tooltipBodyItemLabel.className = ClassName.TOOLTIP_BODY_ITEM_LABEL;
        tooltipBodyItemLabel.innerHTML = item[0].split(': ')[0];
        tooltipBodyItem.appendChild(tooltipBodyItemLabel);
        const tooltipBodyItemValue = document.createElement(Selector.SPAN);
        tooltipBodyItemValue.className = ClassName.TOOLTIP_BODY_ITEM_VALUE;
        tooltipBodyItemValue.innerHTML = item[0].split(': ').pop();
        tooltipBodyItem.appendChild(tooltipBodyItemValue);
      } else {
        const tooltipBodyItemValue = document.createElement(Selector.SPAN);
        tooltipBodyItemValue.className = ClassName.TOOLTIP_BODY_ITEM_VALUE;
        tooltipBodyItemValue.innerHTML = item[0];
        tooltipBodyItem.appendChild(tooltipBodyItemValue);
      }

      tooltipBody.appendChild(tooltipBodyItem);
    });
    tooltip.innerHTML = '';
    tooltip.appendChild(tooltipHeader);
    tooltip.appendChild(tooltipBody);
  }

  const position = this._chart.canvas.getBoundingClientRect();

  const positionY = this._chart.canvas.offsetTop;
  const positionX = this._chart.canvas.offsetLeft;
  let positionLeft = positionX + tooltipModel.caretX;
  const positionTop = positionY + tooltipModel.caretY; // eslint-disable-next-line

  const halfWidth = tooltipModel.width / 2;

  if (positionLeft + halfWidth > position.width) {
    positionLeft -= halfWidth;
  } else if (positionLeft < halfWidth) {
    positionLeft += halfWidth;
  } // Display, position, and set styles for font


  tooltip.style.opacity = 1;
  tooltip.style.left = positionLeft + "px";
  tooltip.style.top = positionTop + "px";
}

/**
 * --------------------------------------------------------------------------
 * Custom Tooltips for Chart.js (v2.0.0-alpha.0): index.esm.js
 * Licensed under MIT (https://github.com/@coreui/coreui-chartjs/LICENSE)
 * --------------------------------------------------------------------------
 */

export { CustomTooltips };
//# sourceMappingURL=coreui-chartjs.esm.js.map
