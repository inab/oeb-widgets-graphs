import { html, css, LitElement, unsafeCSS  } from 'lit';
import Plotly from 'plotly.js-dist'
import style from "./styles.css?inline";
import { oebIcon } from './utils';

export class BarPlot extends LitElement {
    imgLogo = oebIcon

    static styles = unsafeCSS(style);

    static properties = {
        data: ''
    };

    attributeChangedCallback(name, oldVal, newVal) {
        this.data = JSON.parse(newVal);
        super.attributeChangedCallback(name, oldVal, JSON.parse(newVal));
    }

    firstUpdated() {
        this.staticNode = this.shadowRoot.querySelector('#bar-chart');
        console.log("staticNode:", this.staticNode);
        this.renderChart();
    }

    constructor() {
        super();

        this.datasetId = '';
        this.datasetModDate = '';
        this.originalData = '';
        this.layout = {};
        this.staticNode = null;
    }

    renderChart() {
        console.log("renderChart barplot:", this.data);
        if(this.data) {
            const data = this.data.inline_data;

            this.datasetId = this.data._id;
            this.datasetModDate = this.data.dates.modified;
            this.originalData = this.data;
            console.log(data)

            const maxMetricValue = Math.max(...data.challenge_participants.map(entry => entry.metric_value));
            const x = data.challenge_participants.map(entry => entry.tool_id);
            const y = data.challenge_participants.map(() => 0);
            const colors = Array(x.length).fill('#0b579f');

            const initialTrace = {
                x,
                y,
                type: 'bar',
                marker: {
                    color: colors
                }
            };

            this.layout = {
                title: '',
                autosize: true,
                height: 800,
                xaxis: {
                    title: {
                        text: 'participants',
                        standoff: 30,
                        font: {
                        family: 'Arial, sans-serif',
                        size: 18,
                        color: 'black',
                        weight: 'bold'
                        }
                    },
                    fixedrange: true,
                    tickangle: -45,
                    tickfont: { size: 16 }
                },
                yaxis: {
                    title: {
                        text: data.visualization.metric,
                        font: {
                        family: 'Arial, sans-serif',
                        size: 18,
                        color: 'black',
                        weight: 'bold'
                        }
                    },
                    fixedrange: true,
                    range: [0, maxMetricValue + 0.1],
                    tickfont: { size: 14 }
                },
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

            const config = {
                displayModeBar: false,
                responsive: true,
                hovermode: false
            };

            

            var graphDiv = this.staticNode;

            console.log("this.staticNode:", this.staticNode)

            console.log("graphDiv:", graphDiv);

            Plotly.newPlot(graphDiv, [initialTrace], this.layout, config);

            const myPlot = graphDiv;

            console.log("myPlot:", myPlot);


            myPlot.on('plotly_hover', (event) => {
                const pn = event.points[0].pointNumber;
                const hoverColors = Array(x.length).fill('#0b579f'); // Reset colors
                hoverColors[pn] = '#f47c21'; // Change color on hover (you can adjust the color)
                const update = { 'marker': { color: hoverColors } };
                Plotly.restyle(graphDiv, update);
            });

            myPlot.on('plotly_unhover', () => {
                const unhoverColors = Array(x.length).fill('#0b579f'); // Reset colors
                const update = { 'marker': { color: unhoverColors } };
                Plotly.restyle(graphDiv, update);
            });

            setTimeout(() => {
                const actualTrace = {   
                    y: data.challenge_participants.map(entry => entry.metric_value)
                };
        
                // Animate the transition from 0 to actual values
                Plotly.animate(myPlot, {
                    data: [actualTrace],
                    traces: [0],
                    transition: {
                        duration: 1000,
                        easing: 'ease-in-out'
                    }
                });
                this.loading = false;
            }, 500);

            const chartContainer = myPlot;
            chartContainer.addEventListener('mouseover', (event) => {
                if (event.target.classList.contains('cursor-pointer')) {
                event.preventDefault();
                event.target.style.cursor = 'default';
                }
            });
        }
    }

    render() {
        return html`
            <div class="bar-plot">
                <div class="row">
                    <div class="col-8">
                        <div class="btn-group btn-graphs" role="group" aria-label="Basic example">
                            <button type="button" class="btn btn-secondary">Left</button>
                            <button type="button" class="btn btn-secondary">Middle</button>
                            <button type="button" class="btn btn-secondary">Right</button>
                        </div>
                    </div>
                </div>
                <div class="row" id="todownload">
                    <div class="col-8" id="chartCapture">
                        <div class="chart" id="bar-chart"></div>
                        <div class="info-table">
                            info-table
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

window.customElements.define('bar-plot', BarPlot);