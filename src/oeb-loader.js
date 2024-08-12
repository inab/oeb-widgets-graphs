import { html, LitElement } from 'lit';
import  { loaderStyles } from './loader-styles.js';

export class OebLoader extends LitElement {
    static get styles() {
        return [
            loaderStyles
        ];
    }

    constructor() {
        super()
    }

    render () {
        return html`
            <div class="loader-container">
                <div class="loader-wrapper">
                    <span class="loader"></span>
                    <span class="text-loader">Loading</span>
                </div>
                
            </div>
        `
    }
}

window.customElements.define('oeb-loader', OebLoader);