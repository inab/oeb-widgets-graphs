import { css, html, LitElement } from 'lit';
import Plotly from 'plotly.js-dist'
import { plotlyStyles } from "./plotly-styles.js";
import { graphStyles } from './graph-styles.js';
import { oebIcon, isBSC } from './utils';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Tooltip } from './ui-tooltip.js';
import { color } from 'd3';

const GRAPH_CONFIG = {
    displayModeBar: false,
    responsive: true,
    hovermode: false
};

export class RadarPlot extends LitElement {
    static get styles() {
        return [
            plotlyStyles,
            graphStyles,
            css`
                .scale-details { margin: 0 25px 20px; }
                .scale-details summary { cursor: pointer; font-weight: 600; }
                .scale-table-wrapper { overflow-x: auto; }
                .scale-table { min-width: 500px; }
                .scale-table th, .scale-table td { padding: 6px; }
                @media (max-width: 640px) {
                    .scale-details { margin-left: 0; margin-right: 0; }
                }
            `
        ];
    }

    static properties = {
        data: '',
        datasetId: '',
        sorted: false,
        showAdditionalTable: false,
        tracesTable: [],
        normalized: { state: true },
    };

    constructor() {
        super();

        this.imgLogo = oebIcon;
        this.normalized = false;
        this.layout = {
            autosize: true,
            height: 600,
            margin: { l: 50, r: 50, t: 100, b: 110, pad: 4 },
            polar: {
                radialaxis: {
                    visible: true,
                }
            },
            images: this.getImagePosition(this.optimalview),
            showlegend: true
        }

        this.traces = [];
        this.tracesLabels = [];
        this.tracesEntries = [];
        this.tracesDescription = [];
        this.datasetModDate = '';
        this.markerColors = ['(242, 131, 131, .6)', '(160, 191, 219, .6)', '(232, 167, 109, .6)', '(176, 132, 123, .6)', '(235, 155, 210, .6)', '(219, 219, 125, .6)', '(195, 169, 219, .6)', '(131, 214, 194, .6)', '(217, 215, 215, .6)', '(140, 216, 219, .6)', '(242, 153, 143, .6)', '(161, 227, 152, .6)'];
        this.markerColorsLines = ['#D62728', '#4981B6', '#FF7F0E', '#8C564B', '#E377C2', '#BCBD22', '#9467BD', '#0C9E7B', '#7F7F7F', '#31B8BD', '#FB8072', '#62D353'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        this.data = JSON.parse(newVal);
        super.attributeChangedCallback(name, oldVal, JSON.parse(newVal));
    }

    updated() {
        this.graphDiv = this.shadowRoot.querySelector('#radar-chart');
        this.todoDownload = this.shadowRoot.querySelector('#todownload');
        this.chartCapture = this.shadowRoot.querySelector('#chartCapture');
        this.myPlot = Plotly.newPlot(this.graphDiv, [], {}, { displayModeBar: false, responsive: true, hovermode: false });
        this.renderChart();
    }

    firstUpdated() {
        this.datasetId = this.data._id ?? this.data.series_type;
        this.datasetModDate = this.data.visualization.dates?.modification ?? '';
        this.representations = this.data.visualization?.representations[0].metrics_series;
        
        const dataObj = {
            _id: this.datasetId,
            dates: this.datasetModDate,
            inline_data: {
                challenge_participants:[],
                visualization:{}
            }
        }

        this.data?.challenge_participants.forEach(participant => {
            let participant_new = dataObj.inline_data.challenge_participants.find(p => p.name === participant.label);
            if(!participant_new) {
                participant_new = {
                    name: participant.label,
                    type: 'scatterpolar',
                    fill: 'toself',
                    theta: [],
                    r_value: [],
                    optimization: ''
                }
                dataObj.inline_data.challenge_participants.push(participant_new);
            }
            participant_new.r_value = [ ...participant_new.r_value, participant.values[0].v];
            participant_new.theta = [ ...participant_new.theta, participant.metric_id];
        });

        // Metrics declaring "scale" (linear|log) are normalized to 0-1 per axis so
        // metrics with different units or unbounded ranges can share one chart.
        this.normalized = this.representations.some(item => item.scale);
        this.axisBounds = this.normalized ? this.getAxisBounds(dataObj.inline_data.challenge_participants) : {};

        this.dataTraces = dataObj.inline_data.challenge_participants.map((participant, index) => {
            let theta_full_value = participant.theta.map(theta_value => {
                let found_item = this.representations.find(item => item.metric_id == theta_value);
                return found_item ? found_item.metric_id + " (<i>" + found_item.title + "</i>): " : 'Unknown';
            });
            theta_full_value.push(theta_full_value[0]);

            let adjusted_r = participant.r_value.map((value, i) => {
                let metric = participant.theta[i];
                let metricData = this.representations.find(item => item.metric_id == metric);
        
                if (metricData && metricData.optimization === "minimize") {
                    return -value;
                } else {
                    return value;
                }
            });

            let hoverValues = participant.r_value.map((value, i) => this.formatRealValue(participant.theta[i], value));
            if (this.normalized) {
                adjusted_r = participant.r_value.map((value, i) => this.normalizeValue(participant.theta[i], value));
                hoverValues.push(hoverValues[0]);
                theta_full_value = theta_full_value.map((label, i) => `<b>${label}</b> ${hoverValues[i]}`);
            }

            adjusted_r.push(adjusted_r[0]);

            let trace = {
                name: participant.name,
                mode: "markers+lines",
                line: {
                    color: this.markerColorsLines[index],
                    width   :   "2",
                    dash    :   "solid",
                    shape    :   "linear"
                },
                r: adjusted_r,
                theta: participant.theta.concat(participant.theta[0]),
                theta_full: this.representations.find((item) => item.metric_id == participant.name),
                text: participant.name || "No name",
                hovertext: participant.name,
                customdata: theta_full_value,
                type: 'scatterpolar',
                marker: {
                    color: this.markerColorsLines[index],
                },
                fill: 'toself',
                fillcolor: this.markerColors[index],
                hovertemplate : this.normalized ? "%{customdata}<extra></extra>" : "<b>%{customdata}</b> %{r:.2f}<extra></extra>",
            }
            this.traces.push(trace);
        });

        this.layout = {
            autosize: true,
            height: 600,
            legend: {
                "orientation": "h",
                x: 0,
                y: -0.2,
                xref: 'paper',
                yref: 'paper',
                font: {
                    size: 16,
                },
                itemdoubleclick: "toggle",
            },
            polar: {
                radialaxis: {
                    visible: true,
                    ...(this.normalized ? { range: [0, 1], tickvals: [0, 0.25, 0.5, 0.75, 1], ticktext: ['worst', '', '', '', 'best'] } : {}),
                    color: "red",
                    gridcolor : "white",
                    linecolor : "white",
                    tickcolor : "white",
                    tickfont : {
                        size : 12,
                        color : "#444"
                    },
                },
                angularaxis: {
                    gridcolor : "white",
                    linecolor : "white",
                    tickcolor : "white",
                },
                bgcolor:"#E5ECF6",
                bordercolor: "#E5ECF6",
                outlinecolor : "#E5ECF6",
            },
            showlegend: true,
            margin: { l: 50, r: 50, t: 100, b: 110, pad: 4 },
            images: this.getImagePosition()
        };
    }

    getMetricSpec(metricId) {
        return this.representations.find(item => item.metric_id == metricId) ?? {};
    }

    getAxisBounds(participants) {
        const bounds = {};
        participants.forEach(participant => {
            participant.theta.forEach((metricId) => {
                const values = participant.r_value.filter((_, j) => participant.theta[j] === metricId);
                const observedMin = Math.min(...values);
                const observedMax = Math.max(...values);
                const current = bounds[metricId] ?? { min: Infinity, max: -Infinity };
                bounds[metricId] = { min: Math.min(current.min, observedMin), max: Math.max(current.max, observedMax) };
            });
        });
        Object.entries(bounds).forEach(([metricId, range]) => {
            const spec = this.getMetricSpec(metricId);
            if (spec.scale === 'log') {
                range.min = spec.min ?? 10 ** Math.floor(Math.log10(range.min));
                range.max = spec.max ?? 10 ** Math.ceil(Math.log10(range.max));
            } else {
                range.min = spec.min ?? Math.min(0, range.min);
                range.max = spec.max ?? range.max;
            }
        });
        return bounds;
    }

    // Maps a value to 0-1 where 1 is always the best result for the metric.
    normalizeValue(metricId, value) {
        const spec = this.getMetricSpec(metricId);
        const { min, max } = this.axisBounds[metricId];
        const transform = spec.scale === 'log' ? Math.log10 : (v) => v;
        const span = transform(max) - transform(min);
        let ratio = span > 0 ? (transform(Math.max(value, min)) - transform(min)) / span : 0.5;
        ratio = Math.min(1, Math.max(0, ratio));
        return spec.optimization === 'minimize' ? 1 - ratio : ratio;
    }

    formatRealValue(metricId, value) {
        const unit = this.getMetricSpec(metricId).unit;
        const formatted = Math.abs(value) >= 1000 ? value.toLocaleString('en-US') : +value.toPrecision(4);
        return unit ? `${formatted} ${unit}` : `${formatted}`;
    }

    getLongDescription(text) {
        text = text.toUpperCase() ? text.toUpperCase() : text;
        switch (text) {
            case 'OA':
                return 'Overall accuracy';
            case 'SP':
                return 'Statistical Parity';
            case 'EO':
                return 'Equal Opportunity';
            case 'PE':
                return 'Predictive Equality';
            case 'FNR':
                return 'False Negative Rate';
            case 'TN':
                return 'True Negative';
            case 'TP':
                return 'True Positive';
            case 'FN':
                return 'False Negative';
            case 'FP':
                return 'False Positive';
            case 'DI':
                return 'Disparate Impact';
            case 'AD':
                return 'Accuracy Difference';
            case 'DCA':
                return 'Difference in Conditional Acceptance';
            case 'DCR':
                return 'Difference in Conditional Rejection';
            case 'TE':
                return 'Treatment Equality';
            case 'CI':
                return 'Class Imbalance';
            case 'FPLP':
                return 'Female Positive Label Percentage';
            case 'FNLP: ':
                return 'Female Negative Label Percentage';
            case 'PLI: ':
                return 'Positive Label Imbalance';
            case 'NLI: ':
                return 'Negative Label Imbalance';
            case 'MCDD: ':
                return 'Male Conditional Demography';
            case 'FCDD: ':
                return 'Female Conditional Demography';
        }
    }

    renderChart() {
        let layout = this.layout;

        Plotly.newPlot(this.graphDiv, this.traces, layout, GRAPH_CONFIG).then((gd) => {
            // Animate traces from opacity 0 to 1
            Plotly.animate(gd, {
                data: this.traces,
                layout: layout,
                height: 600,
            }, {
                transition: {
                    duration: 1000,
                    easing: 'cubic-in-out',
                },
                frame: {
                    duration: 500,
                },
            });
        });
    }

    formatDateString(dateString) {
        if(dateString === '') {
            return "";
        }
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    getImagePosition() {
        return [{
            source: this.imgLogo,
            xref: "paper",
            yref: "paper",
            x: 0.98,
            y: 1.17,
            sizex: .1,
            sizey: .2,
            xanchor: "right",
            yanchor: "top",
            opacity: isBSC() ? 0 : .7
        }]
    }

    async downloadChart(format) {
        try {
            const layout = this.graphDiv.layout;
            layout.images[0].opacity = 0.5;
            Plotly.update(this.graphDiv, layout);

            if (format === 'pdf') {
                const pdf = new jsPDF();
                pdf.setFontSize(12);
                pdf.setFont(undefined, 'bold');
                pdf.text(`Benchmarking Results of ${this.datasetId} at ${this.formatDateString(this.datasetModDate)}`, 105, 10, null, null, 'center');

                // Get chart image as base64 data URI
                const chartImageURI = await Plotly.toImage(this.graphDiv, { format: 'png', width: 750, height: 600 });

                pdf.addImage(chartImageURI, 'PNG', 10, 20);
                // Save the PDF
                pdf.save(`benchmarking_chart__quartiles_${this.datasetId}.${format}`);
            } else if (format === 'svg') {
                Plotly.downloadImage(this.graphDiv, { format: 'svg', width: 800, height: 600, filename: `benchmarking_chart_${this.datasetId}` });
            } else if (format === 'png') {
                Plotly.downloadImage(this.graphDiv, { format: 'png', width: 800, height: 600, filename: `benchmarking_chart_${this.datasetId}` });
            }
        } catch (error) {
            console.log(error);
        }
    }

    render() {
        return html`
            <div class="bar-plot oeb-graph">
                <div class="graph-row" id="graph-filters">
                    <div class="col-8">
                    </div>
                </div>
                <p class="legend-hint">Click a participant in the legend to show or hide it.</p>
                ${this.normalized ? html`
                    <p class="legend-hint">Each metric uses its own scale and bounds, mapped to a shared 0–1 chart scale. See metric scales below the chart.</p>
                ` : ''}
                <div class="graph-row" id="todownload">
                    <div class=${ this.isSorted ? 'col-8': 'col-12' } id="chartCapture">
                        <div class="chart" id="radar-chart"></div>
                        ${this.normalized ? html`
                            <details class="scale-details" open>
                                <summary>Metric scales and bounds</summary>
                                <p>Raw ranges are mapped independently; the outer edge represents the preferred direction for each metric. Hover over the chart for original values.</p>
                                <div class="scale-table-wrapper">
                                    <table class="custom-table scale-table">
                                        <thead>
                                            <tr><th scope="col">Metric</th><th scope="col">Scale</th><th scope="col">Raw range</th><th scope="col">Outer edge</th></tr>
                                        </thead>
                                        <tbody>
                                            ${Object.entries(this.axisBounds).map(([metricId, bounds]) => {
                                                const spec = this.getMetricSpec(metricId);
                                                return html`<tr>
                                                    <th scope="row">${metricId}${spec.title ? ` (${spec.title})` : ''}</th>
                                                    <td>${spec.scale === 'log' ? 'Logarithmic' : 'Linear'}</td>
                                                    <td>${bounds.min} – ${bounds.max}${spec.unit ? ` ${spec.unit}` : ''}</td>
                                                    <td>${spec.optimization === 'minimize' ? 'Lower' : 'Higher'}</td>
                                                </tr>`;
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </details>
                        ` : ''}
                        <div class="info-table">
                            <table class="custom-table">
                                <tbody>
                                    <tr>
                                        <th class="first-th">Dataset ID</th>
                                        <td>${ this.datasetId }</td>
                                        ${this.datasetModDate != '' ? html `<th>Last Update</th>` : '' }
                                        ${this.datasetModDate != '' ? html `<td class="last-td">${ this.formatDateString(this.datasetModDate) }</td>` : ''}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

window.customElements.define('radar-plot',RadarPlot);