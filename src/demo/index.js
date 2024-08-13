import {html, css, LitElement} from 'lit';
import { Task } from '@lit/task';

import { WidgetElement } from '../widget-element.js';
import { OebLoader } from '../oeb-loader.js';
import { fetchDataInfo } from '../utils.js';

export default class WidgetTest extends LitElement {
    dataJSON = './SCATTERPLOT.json';

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
        let visualization = (data.inline_data && data.inline_data.visualization) ? data.inline_data.visualization : data.visualization
        let type = visualization.type
        let dataObj = {}

        if(type == 'radar-plot') {
            dataObj = {
                _id: data._id,
                name: data.name,
                dates: data.dates,
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
            // const metrics_names = await this.getMetricsNames(visualization.x_axis, visualization.y_axis);
            dataObj.inline_data.visualization = {
                type: visualization.type,
                y_axis: visualization.y_axis,
                optimization: visualization.optimization?visualization.optimization:null
            };
        } else if(type === 'radar-plot') {
            // Process challenge_participants data for RadarPlot
            data.assessments.forEach(participant => {
                const preparedParticipant = {
                    id: participant._id,
                    label: participant.label,
                    value: participant.value,
                    error: participant.error
                };
                dataObj.inline_data.challenge_participants.push(preparedParticipant);
            });

            // Process visualization data for RadarPlot
            const visualization = data.visualization;
            dataObj.inline_data.visualization = {
                type: visualization.type,
                dates: visualization.dates,
                schema_url: visualization.schema_url,
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