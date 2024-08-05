import {html, css, LitElement} from 'lit';
import { Task } from '@lit/task';

import { WidgetElement } from '../widget-element';
import { fetchDataInfo } from '../utils.js';

export default class WidgetTest extends LitElement {
    dataJSON = './OEBD00700000NI.json';

    static properties = {
        _data: { state: true }
    }

    _jsonInfoData = new Task(this, {
        task: async ([dataJSON], { signal }) => {
            return this.fetchDataAndRender(await fetchDataInfo(dataJSON, signal));
        },
        args: () => [this.dataJSON],
    });

    constructor() {
        super()

        this.data = "";
        this.visualizationType = '';
    }

    fetchDataAndRender(data) {
        let visualization = data.inline_data.visualization
        let type = visualization.type
    
        let dataObj = {
            _id: data._id,
            dates: data.dates,
            dataset_contact_ids: data.dataset_contact_ids,
            inline_data: {
                challenge_participants:[],
                visualization:{}
            }
        }
    
        if (type === 'bar-plot'){
            // Process challenge_participants data for BarPlot
            data.inline_data.challenge_participants.forEach(participant => {
                    const preparedParticipant = {
                    tool_id: participant.tool_id,
                    metric_value: participant.metric_value,
                    stderr: participant.stderr
                };
                dataObj.inline_data.challenge_participants.push(preparedParticipant);
            });
    
            // Process visualization data for BarPlot
            const visualization = data.inline_data.visualization;
            dataObj.inline_data.visualization = {
                metric: visualization.metric,
                type: visualization.type
            };
        }
    
        if (visualization && type) {
            this.visualizationType = type;
        }
        return JSON.stringify(dataObj);
    }

    render() {
        return html`
            <div>
                ${this._jsonInfoData.render({
                    initial: () => html`<p>Loading...</p>`,
                    pending: () => html`<p>Loading...</p>`,
                    complete: ( dataResult ) =>{
                        return html`
                            <widget-element
                                data = ${ dataResult }
                                type = ${ this.visualizationType }>
                            </widget-element>
                        `
                    }
                })}
            </div>
        `

    }
}

window.customElements.define('widget-test', WidgetTest)