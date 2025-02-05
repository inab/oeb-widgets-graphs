import {html, css, LitElement} from 'lit';
import { Task } from '@lit/task';

import { WidgetElement } from '../widget-element.js';
import { OebLoader } from '../oeb-loader.js';
import { fetchDataInfo } from '../utils.js';

export default class WidgetTest extends LitElement {
    dataJSON = './files/LINEPLOT_NEW.json';
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
        if(visualization.representations && visualization.representations[0].type && visualization.representations[0].type === 'line-plot') {
            type = 'line-plot'
        }
        
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
        } else if(type === 'line-plot') {
            // Process challenge_participants data for LinePlot
            // Get axis names
            const x_axis = data?.inline_data?.visualization?.representations?.find(
                (representation) => representation.metrics_series.some((metric) => metric.axis === 'x')
            )?.metrics_series.find((metric) => metric.axis === 'x');

            const y_axis = data?.inline_data?.visualization?.representations?.find(
                (representation) => representation.metrics_series.some((metric) => metric.axis === 'y')
            )?.metrics_series.find((metric) => metric.axis === 'y');

            // Build data for LinePlot
            data?.inline_data?.challenge_participants.forEach(participant => {
                let x_value = function() {
                    if (x_axis.metric_id === participant.metric_id) {
                        return participant.values;
                    }
                    return null;
                };

                let y_value = function() {
                    if (y_axis.metric_id === participant.metric_id) {
                        return participant.values;
                    }
                    return null;
                };

                let participant_new = dataObj.inline_data.challenge_participants.find(p => p.name === participant.label);
                if(!participant_new) {
                    participant_new = {
                        metric_id: participant.metric_id,
                        name: participant.label,
                        x_value: [],
                        y_value: [],
                        t_error: [],
                        x_optimization: '',
                        y_optimization: ''
                    }
                    dataObj.inline_data.challenge_participants.push(participant_new);
                }

                let x_result = x_value();
                if (x_result) {
                    participant_new.x_value = [...participant_new.x_value, ...x_result];
                }

                let y_result = y_value();
                if (y_result) {
                    let new_axis = {
                        y_value_axis: y_result.map(({v}) => v),
                        error_value_axis: y_result.map(({e}) => e)
                    }

                    participant_new.y_value = [...participant_new.y_value, ...new_axis.y_value_axis];
                    participant_new.t_error = [...participant_new.t_error, ...new_axis.error_value_axis];
                }
            });

            dataObj.inline_data.visualization = {
                x_axis: x_axis.title,
                y_axis: y_axis.title,
                x_optimization: x_axis.optimization ?? 'maximize',
                y_optimization: y_axis.optimization ?? 'maximize',
                type: type,
                dates: ''
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