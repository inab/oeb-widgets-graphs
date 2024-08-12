import {html, css, LitElement} from 'lit';

import { BarPlot } from './bar-plot'
import { ScatterPlot } from './scatter-plot';
import { BoxPlot } from './box-plot';
import { RadarPlot } from './radar-plot';

export class WidgetElement extends LitElement {
  static properties = {
    data: {},
    type: ''
  };

  constructor() {
    super()
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal);
  }

  renderComponent() {
    if(this.type == 'bar-plot') {
      return html`<bar-plot data = ${ this.data }></bar-plot>`
    } else if(this.type == '2D-plot') {
      return html`<scatter-plot data = ${ this.data }></scatter-plot>`
    } else if(this.type == 'box-plot') {
      return html`<box-plot data = ${ this.data }></box-plot>`
    } else if(this.type == 'radar-plot') {
      return html`<radar-plot data = ${ this.data }></radar-plot>`
    } else {
      return html`<p>No element</p>`
    }
  }

  render() {
    return html`
      <div class="widget-element">
        <div>${ this.renderComponent() }</div>
      </div>
    `;
  }

  // If you need to write a custom CSS styles that will work
  // with your props in the component, just use styles() function
  static get styles() {
    return css`
      .main__div {
        background-color: #fafafa;
      }
    `
  }
}

window.customElements.define('widget-element', WidgetElement)