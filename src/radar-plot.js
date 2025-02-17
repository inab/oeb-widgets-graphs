import { html, LitElement } from 'lit';
import Plotly from 'plotly.js-dist'
import { plotlyStyles } from "./plotly-styles.js";
import { graphStyles } from './graph-styles.js';
import { oebIcon, isBSC } from './utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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
            graphStyles
        ];
    }

    static properties = {
        data: '',
        datasetId: '',
        sorted: false,
        showAdditionalTable: false,
        tracesTable: [],
    };

    constructor() {
        super();

        this.imgLogo = oebIcon;
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

        this.dataTraces = dataObj.inline_data.challenge_participants.map((participant, index) => {
            participant.r_value.push(participant.r_value[0]);
            participant.theta.push(participant.theta[0]);

            let trace = {
                name: participant.name,
                mode: "markers+lines",
                line: {
                    color: this.markerColorsLines[index],
                    width   :   "2",
                    dash    :   "solid",
                    shape    :   "linear"
                },
                r: participant.r_value,
                theta: participant.theta,
                text: participant.name || "No name",
                hovertext: participant.name,
                type: 'scatterpolar',
                marker: {
                    color: this.markerColorsLines[index],
                },
                fill: 'toself',
                fillcolor: this.markerColors[index],
                hovertemplate : "<b>%{theta}</b> %{r:.2f}<extra></extra>",
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
                <div class="graph-row" id="todownload">
                    <div class=${ this.isSorted ? 'col-8': 'col-12' } id="chartCapture">
                        <div class="chart" id="radar-chart"></div>
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