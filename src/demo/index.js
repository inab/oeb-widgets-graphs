import {html, css, LitElement} from 'lit';
import { Task } from '@lit/task';

import { WidgetElement } from '../widget-element.js';
import { OebLoader } from '../oeb-loader.js';
import { fetchDataInfo } from '../utils.js';

export default class WidgetTest extends LitElement {
    static groups = [
        { label: 'Line plot', description: 'Trends and relationships between numerical variables.', samples: [
            { label: 'ROC curve', file: 'LINEPLOT.json', description: 'FPR (minimize) vs TPR (maximize).' },
            { label: 'Precision-recall', file: 'LINEPLOT_PRECISION_RECALL.json', description: 'Both axes maximize.' },
        ] },
        { label: 'Bar plot', description: 'One metric compared across participants, with quartile classification.', samples: [
            { label: 'Default', file: 'BARPLOT.json', description: 'Positive values, highest ranked first.' },
            { label: 'Mixed signs', file: 'BARPLOT_NEGATIVE_MIXED.json', description: 'Bars above and below the zero baseline.' },
            { label: 'All negative', file: 'BARPLOT_NEGATIVE_ALL.json', description: 'Every value below zero.' },
            { label: 'Minimize', file: 'BARPLOT_MINIMIZE.json', description: 'Lower is better: ranked lowest first. Use "Reverse Order" after sorting to invert.' },
        ] },
        { label: 'Scatter plot', description: 'Two metrics compared, with quartile and clustering classifications.', samples: [
            { label: 'Top-right', file: 'SCATTERPLOT.json', description: 'Both metrics maximize. Square, diagonal and K-means classifications.' },
            { label: 'Top-left', file: 'SCATTERPLOT_TOP_LEFT.json', description: 'X minimize, Y maximize.' },
            { label: 'Bottom-right', file: 'SCATTERPLOT_BOTTOM_RIGHT.json', description: 'X maximize, Y minimize.' },
            { label: 'Bottom-left', file: 'SCATTERPLOT_BOTTOM_LEFT.json', description: 'Both metrics minimize.' },
            { label: 'Negative values', file: 'SCATTERPLOT_NEGATIVE.json', description: 'Points in all four quadrants around zero.' },
        ] },
        { label: 'Box plot', description: 'Distribution of a metric per participant.', samples: [
            { label: 'Minimum', file: 'BOXPLOT.json', description: 'Optimization "minimum": sorted by lowest median first.' },
            { label: 'Maximum', file: 'BOXPLOT_MAXIMIZE.json', description: 'Optimization "maximus": sorted by highest median first.' },
            { label: 'No optimization', file: 'BOXPLOT_NO_OPTIMIZATION.json', description: 'No optimization defined: raw order, no preselected sorting.' },
            { label: 'Negative values', file: 'BOXPLOT_NEGATIVE.json', description: 'Boxes below and above zero.' },
        ] },
        { label: 'Radar plot', description: 'Several metrics per tool on a common center.', samples: [
            { label: 'Standard', file: 'RADARPLOT.json', description: 'Raw values, no normalization (metrics on similar scales).' },
            { label: 'Technical (normalized)', file: 'RADARPLOT_TECHNICAL.json', description: 'Per-axis 0-1 normalization with log scale for RAM, runtime, I/O and throughput.' },
        ] },
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
        this.dataJSON = './files/' + WidgetTest.groups[0].samples[0].file;
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
                type: visualization.type,
                optimization: visualization.optimization
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

    isActive(file) {
        return this.dataJSON.endsWith('/' + file);
    }

    render() {
        const activeGroup = WidgetTest.groups.find(group =>
            group.samples.some(({ file }) => this.isActive(file)));
        const activeSample = activeGroup.samples.find(({ file }) => this.isActive(file));
        const select = (file) => { this.dataJSON = './files/' + file; };
        return html`
            <style>
                .demo { font-family: sans-serif; padding: 12px 16px; border-bottom: 1px solid #ddd; }
                .demo h1 { margin: 0 0 2px; font-size: 20px; }
                .demo .subtitle { margin: 0 0 12px; color: #666; font-size: 13px; }
                .demo .tabs, .demo .variants { display: flex; gap: 6px; flex-wrap: wrap; }
                .demo .tabs { border-bottom: 2px solid #0b7285; }
                .demo .tab { padding: 8px 16px; cursor: pointer; border: 1px solid #ccc; border-bottom: none;
                    border-radius: 6px 6px 0 0; background: #f1f3f5; color: #333; }
                .demo .tab.active { background: #0b7285; color: #fff; border-color: #0b7285; }
                .demo .variants { margin-top: 10px; align-items: center; }
                .demo .variants-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: .05em; }
                .demo .pill { padding: 4px 12px; cursor: pointer; border: 1px solid #0b7285; border-radius: 999px;
                    background: #fff; color: #0b7285; }
                .demo .pill.active { background: #0b7285; color: #fff; }
                .demo .description { margin: 10px 0 0; font-size: 13px; color: #444; }
            </style>
            <div class="demo">
                <h1>OEB Widgets Graphs</h1>
                <p class="subtitle">Demo of every plot type and its data variants</p>
                <div class="tabs">
                    ${WidgetTest.groups.map(group => html`
                        <button class="tab ${group === activeGroup ? 'active' : ''}"
                            @click=${() => select(group.samples[0].file)}>${group.label}</button>`)}
                </div>
                ${activeGroup.samples.length > 1 ? html`
                    <div class="variants">
                        <span class="variants-label">Sample</span>
                        ${activeGroup.samples.map(({ label, file }) => html`
                            <button class="pill ${this.isActive(file) ? 'active' : ''}"
                                @click=${() => select(file)}>${label}</button>`)}
                    </div>` : ''}
                <p class="description"><strong>${activeGroup.label}:</strong> ${activeGroup.description}
                    ${activeSample.description}</p>
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