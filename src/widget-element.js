import {html, css, LitElement} from 'lit';

import { BarPlot } from './bar-plot'

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