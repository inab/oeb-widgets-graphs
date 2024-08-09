import { html, LitElement } from 'lit';
import Plotly from 'plotly.js-dist'
import { plotlyStyles } from "./plotly-styles.js";
import { graphStyles } from './graph-styles.js';
import { oebIcon, isBSC } from './utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Tooltip } from './ui-tooltip.js';

const GRAPH_CONFIG = {
    displayModeBar: false,
    responsive: true,
    hovermode: false
};

export class BoxPlot extends LitElement {
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
        isOptimal: true,
        viewSelected: "Classification",
        tracesTable: [],
        orientation: 'v',
        graphStyleSelected: 'empty'
    };

    constructor() {
        super();

        this.imgLogo = oebIcon;
        this.orientationMenu = {
            'h': 'Horizontal',
            'v': 'Vertical'
        };
        this.graphStyleMenu = {
            'm': 'Mean',
            'sd': 'Standard Deviation',
            'empty': 'Default Style',
        };
        this.graphStyleText = 'Graph Style',
        this.viewText = {
            'default': 'Default Sort',
            'minimum': 'Minimum Sort',
            'maximus': 'Maximus Sort'
        },
        this.isSorted = false;
        this.sortedName = 'Default Sort';
        this.viewSelected = "Default Sort";
        this.viewDefault = true;
        this.challengeParticipants = [];
        this.markerColors = ['#D62728', '#FF7F0E', '#8C564B', '#E377C2', '#4981B6', '#BCBD22', '#9467BD', '#0C9E7B', '#7F7F7F', '#31B8BD', '#FB8072', '#62D353'];
        this.traces = [];
        this.originalTraces = [];
        this.tracesTable = [];
        this.layout = {
            autosize: true,
            height: 600,
            margin: { l: 60, r: 30, t: 0, b: 10, pad: 4 },
            legend: {
                orientation: 'h',
                x: 0,
                y: -0.2,
                xref: 'paper',
                yref: 'paper',
                font: {
                    size: 16,
                },
                itemdoubleclick: "toggle",
            },
            images: this.getImagePosition(this.optimalview),
            showlegend: true,
        };
    }

    attributeChangedCallback(name, oldVal, newVal) {
        this.data = JSON.parse(newVal);
        super.attributeChangedCallback(name, oldVal, JSON.parse(newVal));
    }

    updated() {
        this.graphDiv = this.shadowRoot.querySelector('#box-chart');
        this.todoDownload = this.shadowRoot.querySelector('#todownload');
        this.chartCapture = this.shadowRoot.querySelector('#chartCapture');
        this.benchmarkingTable = this.shadowRoot.querySelector('#benchmarkingTable');
        this.myPlot = Plotly.newPlot(this.graphDiv, [], {}, { displayModeBar: false, responsive: true, hovermode: false });
        this.renderChart();
    }

    firstUpdated() {
        const data = this.data.inline_data;
        this.datasetId = this.data._id;
        this.datasetModDate = this.data.dates.modification;
        this.visualizationData = data.visualization;
        this.originalData = this.data;
        this.optimalview = data.visualization.optimization !== undefined ? data.visualization.optimization : null;
        this.challengeParticipants = data.challenge_participants;
        this.orientation = this.orientationMenu.v;
        this.sortedName = data.visualization.optimization ?? this.viewText.default;
        this.sorted = data.visualization.optimization ?? false;

        this.graphStyleSelected = 'empty';

        let traces = [];
        // Build traces
        for (let i = 0; i < data.challenge_participants.length; i++) {
            const participant = data.challenge_participants[i];

            const trace = {
                name: participant.name,
                x: [participant.name],
                q1: [participant.q1],
                median: [participant.median],
                q3: [participant.q3],
                lowerfence: [participant.lowerfence],
                upperfence: [participant.upperfence],
                mean: [participant.mean],
                boxmean: false,
                type: 'box',
                orientation: 'v',
                marker:{
                    color: this.markerColors[i]
                }
            };
            traces.push(trace);
        }

        if(this.sorted) {
            (this.sortedName == 'minimum') ? traces.sort((a, b) => a.median[0] > b.median[0]) : this.traces.sort((a, b) => a.median[0] < b.median[0])
            this.viewSelected = this.viewText[this.sortedName];
        }

        // Copy original traces to reset current filter states
        this.originalTraces = traces;
        this.traces = traces;
    }

    renderChart() {
        // Order de default traces in some order
        if(this.sorted) {
            (this.sortedName == 'minimum') ? this.traces.sort((a, b) => a.median[0] > b.median[0]) : this.traces.sort((a, b) => a.median[0] < b.median[0]);
            this.viewSelected = this.viewText[this.sortedName];
        }

        if(this.orientation == 'Horizontal') {
            delete this.layout.xaxis
            this.layout.yaxis = {
                title: {
                    text: this.visualizationData.y_axis,
                    font: {
                        family: 'Arial, sans-serif',
                        size: 18,
                        color: 'black',
                        weight: 'bold',
                    },
                }
            }
        } else {
            delete this.layout.xaxis
            this.layout.yaxis = {
                title: {
                    text: this.visualizationData.y_axis,
                    font: {
                        family: 'Arial, sans-serif',
                        size: 18,
                        color: 'black',
                        weight: 'bold',
                    },
                }
            }
        }

        let layout = null;
        if(this.layout == null || this.layout == undefined || this.layout.empty) {
            this.layout = {
                title: '',
                autosize: true,
                height: 600,
                legend: {"orientation": "h"},
                showlegend: true,
                margin: { l: 50, r: 50, t: 100, b: 110, pad: 4 },
                images: [
                    {
                        source: this.imgLogo,
                        xref: "paper",
                        yref: "paper",
                        x: 0.95,
                        y: 1.17,
                        sizex: 0.1,
                        sizey: 0.3,
                        xanchor: "right",
                        yanchor: "top",
                        opacity: 0
                    }
                ]
            };
        } else {
            layout = this.layout;
            layout.images = this.getImagePosition(this.optimalview);
        }

        Plotly.newPlot(this.graphDiv, this.traces, layout, GRAPH_CONFIG).then((gd) => {
            // Animate traces from opacity 0 to 1
            Plotly.animate(gd, {
                data: this.traces.map((trace, index) => ({
                    opacity: 1,
                })),
                traces: Array.from(Array(this.traces.length).keys()),
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

            // Get ranges from the scatter plot
            const layoutObj = gd.layout;
            if(!this.optimalXaxis || this.optimalXaxis.length == 0) {
                this.optimalXaxis = layoutObj.xaxis.range;
                this.optimalYaxis = layoutObj.yaxis.range;
            }

            // Capture legend event
            gd.on('plotly_legendclick', (event) => {
                let traceIndex = event.curveNumber;

                // If Pareto was clicked (index 0) do nothing
                if (traceIndex === 0) {
                    return false;
                } else if (traceIndex === 1) {
                    return true;
                } else {
                    // Update the graph based on the selected trace
                    // Si response es false la trace no se oculta de la legend
                    let response = this.updatePlotOnSelection(traceIndex);
                    if (response == false) {
                        return false;
                    }
                }
            });
        });
    }

    repaintGraph(tracesArray) {
        let traces = this.traces;
        let layout = this.layout;

        Plotly.newPlot(this.graphDiv, traces, layout, GRAPH_CONFIG).then((gd) => {
            // Animate traces from opacity 0 to 1
            Plotly.animate(gd, {
                data: traces.map((trace, index) => ({
                    opacity: 1,
                })),
                traces: Array.from(Array(traces.length).keys()),
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

            // Get ranges from the scatter plot
            const layoutObj = gd.layout;
            if(!this.optimalXaxis || this.optimalXaxis.length == 0) {
                this.optimalXaxis = layoutObj.xaxis.range;
                this.optimalYaxis = layoutObj.yaxis.range;
            }

            // Capture legend event
            gd.on('plotly_legendclick', (event) => {
                let traceIndex = event.curveNumber;

                // If Pareto was clicked (index 0) do nothing
                if (traceIndex === 0) {
                    return false;
                } else if (traceIndex === 1) {
                    return true;
                } else {
                    // Update the graph based on the selected trace
                    // Si response es false la trace no se oculta de la legend
                    let response = this.updatePlotOnSelection(traceIndex);
                    if (response == false) {
                        return false;
                    }
                }
            });
        });
    }

    handleChangeSort(sortType) {
        this.tracesTable = [];
        let data = this.traces;

        // Sort the traces based on the sortType
        if (sortType === 'minimum') {
            data.sort((a, b) => a.median[0] - b.median[0]);
        } else if (sortType === 'maximus') {
            data.sort((a, b) => b.median[0] - a.median[0]);
        } else {
            data = this.originalData;
        }
    
        // this.traces = data;
        this.tracesTable = data;
        this.sortedName = sortType;
        this.viewSelected = this.viewText[sortType];

        this.isSorted = (sortType != 'default') ? true : false;
        this.showAdditionalTable = true;

        this.repaintGraph(data);
    }

    handleChangeOrientation(selectedOrientation) {
        this.orientation = this.orientationMenu[selectedOrientation];

        this.traces.map((item) => {
            item.orientation = selectedOrientation
            if(selectedOrientation == 'h'){
                delete item.x
                item.y = [ item.name ]
            } else {
                delete item.y
                item.x = [ item.name ]
            }
        })

        this.layout = {
            title: '',
            autosize: true,
            legend: {"orientation": "h"},
            showlegend: true,
            height: 600,
            margin: { l: 50, r: 50, t: 100, b: 110, pad: 4 },
            images: this.getImagePosition(this.optimalview)
        }

        if(selectedOrientation == 'h') {
            delete this.layout.yaxis
            this.layout.xaxis = {
                title: {
                    text: this.visualizationData.y_axis,
                    font: {
                        family: 'Arial, sans-serif',
                        size: 18,
                        color: 'black',
                        weight: 'bold',
                    },
                }
            }
        } else {
            delete this.layout.xaxis
            this.layout.yaxis = {
                title: {
                    text: this.visualizationData.y_axis,
                    font: {
                        family: 'Arial, sans-serif',
                        size: 18,
                        color: 'black',
                        weight: 'bold',
                    },
                }
            }
        }

        Plotly.react(this.graphDiv, this.traces, this.layout);
    }

    handleChangeStyle(style) {
        this.graphStyleText = (style !== 'empty') ? this.graphStyleMenu[style] : 'Graph Style';
        this.graphStyleSelected = style;

        this.traces.map((item) => {
            if(style == 'm') {
                item.boxmean = true;
            } else if(style == 'sd') {
                item.boxmean = 'sd';
            } else {
                item.boxmean = false;
            }
        });
        Plotly.react(this.graphDiv, this.traces, this.layout);
    }

    formatDateString(dateString) {
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
            sizex: .05,
            sizey: .15,
            xanchor: "right",
            yanchor: "top",
            opacity: isBSC() ? 0 : .7
        }]
    }

    render() {
        return html`
            <div class="bar-plot oeb-graph">
                <div class="graph-row" id="graph-filters">
                    <div class="col-8">
                        <div class="btn-group btn-graphs" role="group" aria-label="">
                            <div class="dropdown classification-dropdown">
                                <button type="button" class="btn dropbtn first-btn">
                                    <span>${ this.viewSelected }</span>
                                    <div class="btn-icon-wrapper"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg></div>
                                </button>
                                <div class="dropdown-content">
                                    <div class="${ !this.sorted ? 'active disabled' : '' }"
                                        @click="${() => this.handleChangeSort('default') }">
                                        ${ this.viewText.default }
                                    </div>
                                    ${ this.challengeParticipants.length > 1 ? html`
                                        <div class="${ (this.sorted && this.sortedName == 'minimum') ? 'active disabled' : '' }"
                                            @click="${() => this.handleChangeSort('minimum') }">
                                             ${ this.viewText.minimum }
                                    </div>
                                    ` : '' }
                                    <div class="${ (this.sorted && this.sortedName == 'maximus') ? 'active disabled' : '' }"
                                        @click="${() => this.handleChangeSort('maximus') }">
                                        ${ this.viewText.maximus }
                                    </div>
                                </div>
                            </div>
                            <div class="dropdown orientation-dropdown">
                                <button type="button" class="btn btn-xl btn-center dropbtn">
                                    <span>${ this.orientation }</span>
                                    <div class="btn-icon-wrapper"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg></div>
                                </button>
                                <div class="dropdown-content">
                                    <div class="${ (this.orientation && this.orientation=='Horizontal') ? 'active disabled' : '' }"
                                        @click="${() => this.handleChangeOrientation('h') }">
                                        ${ this.orientationMenu.h }
                                    </div>
                                    ${ this.challengeParticipants.length > 1 ? html`
                                        <div class="${ (this.orientation && this.orientation=='Vertical') ? 'active disabled' : '' }"
                                            @click="${() => this.handleChangeOrientation('v') }">
                                             ${ this.orientationMenu.v }
                                    </div>
                                    ` : '' }
                                </div>
                            </div>
                            <div class="dropdown style-dropdown">
                                <button type="button" class="btn btn-xl btn-center dropbtn">
                                    <span>${ this.graphStyleText }</span>
                                    <div class="btn-icon-wrapper"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg></div>
                                </button>
                                <div class="dropdown-content">
                                    <div class="${ (this.graphStyleSelected && this.graphStyleSelected=='m') ? 'active disabled' : '' }"
                                        @click="${() => this.handleChangeStyle('m') }">
                                        ${ this.graphStyleMenu.m }
                                    </div>
                                    ${ this.challengeParticipants.length > 1 ? html`
                                        <div class="${ (this.graphStyleSelected && this.graphStyleSelected=='sd') ? 'active disabled' : '' }"
                                            @click="${() => this.handleChangeStyle('sd') }">
                                            ${ this.graphStyleMenu.sd }
                                    </div>
                                    ` : '' }
                                    <div class="${ (this.graphStyleSelected && this.graphStyleSelected=='empty') ? 'active disabled' : '' }"
                                        @click="${() => this.handleChangeStyle('empty') }">
                                        ${ this.graphStyleMenu.empty }
                                    </div>
                                </div>
                            </div>
                            <div class="dropdown download-dropdown">
                                <button type="button" class="btn dropbtn btn-xl download-btn">
                                    <span>Download</span>
                                    <div class="btn-icon-wrapper"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg></div>
                                </button>
                                <div class="dropdown-content">
                                    <div class=""
                                        @click="${{handleEvent: () => this.downloadChart('svg'), once: false }}">
                                        SVG (only plot)
                                    </div>
                                    <div class=""
                                        @click="${{handleEvent: () => this.downloadChart('png'), once: false }}">
                                        PNG
                                    </div>
                                    <div class=""
                                        @click="${{handleEvent: () => this.downloadChart('pdf'), once: false }}">
                                        PDF
                                    </div>
                                    <div class=""
                                        @click="${{handleEvent: () => this.downloadChart('json'), once: false }}">
                                        JSON (raw data)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="graph-row" id="todownload">
                    <div class=${ this.isSorted ? 'col-8': 'col-12' } id="chartCapture">
                        <div class="chart" id="box-chart"></div>
                        <div class="info-table">
                            <table class="custom-table">
                                <tbody>
                                    <tr>
                                        <th class="first-th">Dataset ID</th>
                                        <td>${ this.datasetId }</td>
                                        <th>Last Update</th>
                                        <td class="last-td">${ this.formatDateString(this.datasetModDate) }</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    ${ this.showAdditionalTable ? html`
                        <div class="col-4">
                            <div class="tools-col">
                                <table class="tools-table" id="benchmarkingTable">
                                    <thead>
                                        <tr>
                                            <th class="tools-th">Participants</th>
                                            <th class="classify-th">
                                                <span>${ this.viewKmeans ? 'Clusters' : 'Quartile' }</span>
                                                <ui-tooltip
                                                    for="anchor"
                                                    icon="info"
                                                    textTitle="The performance label"
                                                    textBody="The values will be displayed in the graph data order 'optimization'.<br/>
                                                        Else, the default order should be the received data order.<br/>
                                                        Its possible to change display order by click in 'Sort & Classify Data' button.">
                                                </ui-tooltip>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${ this.showAdditionalTable ? html`
                                            ${ this.tracesTable.map((trace, index) => html`
                                                <tr>
                                                    <td class="toolColumn" @click="${() => handleTableRowClick(index) }">
                                                        <div class="color-box" style="background-color: ${ trace.marker.color }"></div>
                                                        <span>${ trace.name }</span>
                                                    </td>
                                                    <td class="">${ trace.median[0] }</td>
                                                </tr>
                                            `) }
                                    ` : '' }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ` : '' }
                </div>
            </div>
        `;
    }
}

window.customElements.define('box-plot', BoxPlot);