import {html, css, LitElement} from 'lit';
import { Task } from '@lit/task';

import { WidgetElement } from '../widget-element.js';
import { OebLoader } from '../oeb-loader.js';
import { fetchDataInfo } from '../utils.js';

export default class WidgetTest extends LitElement {
    static samples = [
        { label: 'Line plot', file: 'LINEPLOT.json' },
        { label: 'Bar plot', file: 'BARPLOT.json' },
        { label: 'Scatter plot', file: 'SCATTERPLOT.json' },
        { label: 'Box plot', file: 'BOXPLOT.json' },
        { label: 'Radar plot', file: 'RADARPLOT.json' },
    ];

    static properties = {
        _data: { state: true },
        dataJSON: { state: true }
    }

    _jsonInfoData = new Task(this, {
        task: async ([dataJSON], { signal }) => {
            return this.fetchDataAndRender(await fetchDataInfo(dataJSON, signal));
        },
        args: () => [this.dataJSON],
    });

    constructor() {
        super()
        this.dataJSON = './files/' + WidgetTest.samples[0].file;
        this.data = "";
        this.visualizationType = '';
    }

    fetchDataAndRender(data) {
        let visualization = (data.inline_data && data.inline_data.visualization) ? data.inline_data.visualization : data.visualization
        let type = visualization.type
        let dataObj = {}
        if(visualization.representations && visualization.representations[0].type && visualization.representations[0].type === 'line-plot') {
            type = 'line-plot'
        } else if(visualization.representations && visualization.representations[0].type && visualization.representations[0].type === 'radar-plot') {
            type = 'radar-plot'
        }

        if(type == 'radar-plot') {
            dataObj = {
                _id: data.series_type,
                name: data.series_type,
                dates: data.dates ?? '',
                inline_data: {
                    challenge_participants:[],
                    visualization:{}
                }
            }
        } else {
            dataObj = {
                _id: data._id,
                dates: data.dates,
                dataset_contact_ids: data.dataset_contact_ids,
                inline_data: {
                    challenge_participants:[],
                    visualization:{}
                }
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
        } else if(type === '2D-plot') {
            // Process challenge_participants data for ScatterPlot
            data.inline_data.challenge_participants.forEach(participant => {
                const preparedParticipant = {
                    tool_id: participant.tool_id,
                    metric_x: participant.metric_x,
                    stderr_x: participant.stderr_x,
                    metric_y: participant.metric_y,
                    stderr_y: participant.stderr_y
                };
                dataObj.inline_data.challenge_participants.push(preparedParticipant);
            });
            // Process visualization data for ScatterPlot
            const visualization = data.inline_data.visualization;
            // const metrics_names = await this.getMetricsNames(visualization.x_axis, visualization.y_axis);
            dataObj.inline_data.visualization = {
                type: visualization.type,
                x_axis: visualization.x_axis,
                y_axis: visualization.y_axis,
                optimization: visualization.optimization
            };
        } else if(type === 'box-plot') {
            // Process challenge_participants data for ScatterPlot
            data.inline_data.challenge_participants.forEach(participant => {
                const preparedParticipant = {
                    name: participant.name,
                    metric_id: participant.metric_id,
                    q1: participant.q1,
                    mean: participant.mean,
                    median: participant.median,
                    q3: participant.q3,
                    lowerfence: participant.lowerfence,
                    upperfence: participant.upperfence
                };
                dataObj.inline_data.challenge_participants.push(preparedParticipant);
            });
            // Process visualization data for ScatterPlot
            const visualization = data.inline_data.visualization;
            dataObj.inline_data.visualization = {
                type: visualization.type,
                y_axis: visualization.y_axis,
                optimization: visualization.optimization?visualization.optimization:null
            };
        } else if(type === 'radar-plot') {
            dataObj.inline_data.challenge_participant = data.challenge_participants;
            dataObj.inline_data.visualization = {
                type: type,
                dates: ''
            };
            dataObj = data;

        } else if(type === 'line-plot') {
            dataObj.inline_data.challenge_participants = data.inline_data.challenge_participants;

            dataObj.inline_data.visualization = {
                type: type,
                dates: ''
            };

            dataObj = data;
        }
    
        if (visualization && type) {
            this.visualizationType = type;
        }

        return JSON.stringify(dataObj);
    }

    render() {
        return html`
            <div style="display:flex;gap:8px;flex-wrap:wrap;padding:8px;font-family:sans-serif">
                ${WidgetTest.samples.map(({ label, file }) => html`
                    <button
                        style="padding:6px 12px;cursor:pointer;border:1px solid #888;border-radius:4px;background:${this.dataJSON.endsWith('/' + file) ? '#0b7285' : '#fff'};color:${this.dataJSON.endsWith('/' + file) ? '#fff' : '#000'}"
                        @click=${() => { this.dataJSON = './files/' + file; }}>
                        ${label}
                    </button>`)}
            </div>
            <div>
                ${this._jsonInfoData.render({
                    initial: () => html`<oeb-loader></oeb-loader>`,
                    pending: () => html`<oeb-loader></oeb-loader>`,
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