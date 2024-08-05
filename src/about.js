import { html, css, LitElement } from 'lit';

export class About extends LitElement {
    // The way how you can define some dynamic CSS styles
    static styles = css`p { color: blue }`;

    // Define props of component
    static properties = {
        caption: {
            type: String,
        }
    };

    // Init component - here we can call functions that will be executed before component will be rendered
    constructor() {
        super();
        this.caption = 'Default value of caption';
    }

    // And template of the component
    render() {
        return html`<p>About us: ${this.caption}</p>`;
    }
}
customElements.define('about-card', About);