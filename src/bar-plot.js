import { html, css, LitElement, unsafeCSS  } from 'lit';
import Plotly from 'plotly.js-dist'
import { plotlyStyles } from "./plotly-styles.js";
import { graphStyles } from './graph-styles.js';
import { oebIcon } from './utils';
import { Tooltip } from './ui-tooltip.js';

export class BarPlot extends LitElement {
    imgLogo = oebIcon

    static get styles() {
        return [
            plotlyStyles,
            graphStyles
        ];
    }

    static properties = {
        data: '',
        datasetId : '',
        sorted: false,
        showAdditionalTable : false
    };

    constructor() {
        super();

        this.datasetModDate = '';
        this.originalData = '';
        this.layout = {};
        this.staticNode = null;
        this.sortOrder = 'raw';
        this.optimal = 'no';
        this.quartileDataArray = [];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        this.data = JSON.parse(newVal);
        super.attributeChangedCallback(name, oldVal, JSON.parse(newVal));
    }

    updated() {
        this.graphDiv = this.shadowRoot.querySelector('#bar-chart');
        this.myPlot = Plotly.newPlot(this.graphDiv, [], this.layout, { displayModeBar: false, responsive: true, hovermode: false });
        this.renderChart();
    }

    renderChart() {
        if(this.data) {
            const data = this.data.inline_data;

            this.datasetId = this.data._id;
            this.datasetModDate = this.data.dates.modification;
            this.originalData = this.data;

            const maxMetricValue = Math.max(...data.challenge_participants.map(entry => entry.metric_value));
            this.x = data.challenge_participants.map(entry => entry.tool_id);
            const y = data.challenge_participants.map(() => 0);
            const colors = Array(this.x.length).fill('#0b579f');

            const initialTrace = {
                x: this.x,
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

            if(this.showAdditionalTable) {
                // Add quartile labels
                this.addQuartileLabels();
            }

            this.repaintGraphHover();
            Plotly.newPlot(this.graphDiv, [initialTrace], this.layout, config);
        }
    }

    connectedCallback() {
        super.connectedCallback();

        this.datasetModDate = this.data.dates.modification;

        // Repaint the graph on hover
        this.repaintGraphHover();

        setTimeout(() => {
            const actualTrace = {
                y: this.data.inline_data.challenge_participants.map(entry => entry.metric_value)
            };
            // Animate the transition from 0 to actual values
            Plotly.animate(this.graphDiv, {
                data: [actualTrace],
                transition: {
                    duration: 1000,
                    easing: 'ease-in-out'
                }
            });
        });
    }

    // Graph hover effects
    repaintGraphHover() {
        setTimeout(() => {
            let graph = this.graphDiv;
            let x = this.x;
            this.graphDiv.on('plotly_hover', (event) => {
                const pn = event.points[0].pointNumber;
                const hoverColors = Array(x.length).fill('#0b579f'); // Reset colors
                hoverColors[pn] = '#f47c21'; // Change color on hover (you can adjust the color)

                const update = { 'marker': { color: hoverColors } };
                Plotly.restyle(graph, update);
            });

            this.graphDiv.on('plotly_unhover', () => {
                const unhoverColors = Array(x.length).fill('#0b579f'); // Reset colors
                const update = { 'marker': { color: unhoverColors } };
                Plotly.restyle(graph, update);
            });

            
        });
    }

    formatDateString(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    // ----------------------------------------------------------------
    // ANIMATIONS
    // ----------------------------------------------------------------
    animateBars(data) {
        const x = data.map(entry => entry.tool_id);
        const y = data.map(() => 0); // Start with all bars at 0

        const update = {
            x: [x],
            y: [y],
        };

        Plotly.update(this.graphDiv, update);

        const actualTrace = {
            y: data.map(entry => entry.metric_value),
        };

        // Animate the transition from 0 to actual values
        Plotly.animate(this.graphDiv, {
            data: [actualTrace],
            traces: [0],
            transition: {
                duration: 1000,
                easing: 'ease-in-out',
            },
        });
    }

    animateLine(shapeIndex) {
        const layout = this.graphDiv.layout;
        const shape = layout.shapes[shapeIndex];
        const yTarget = 1; // End at the top

        let y = 0; // Start from the bottom

        const animateStep = () => {
            if (y <= yTarget) {
                // Update the y-coordinate of the line shape
                shape.y1 = y;

                // Update the layout with the modified shape
                Plotly.relayout(this.graphDiv, { shapes: layout.shapes });

                // Increment y and trigger the next animation step
                y += 0.03; // Adjust the speed as needed
                requestAnimationFrame(animateStep);
            }
        };

        // Start the animation
        animateStep();
    }

    async toggleSortOrder() {
        if(this.sortOrder === 'raw') {
            this.sorted = true;
            Plotly.Plots.resize(this.graphDiv);
            await new Promise(resolve => setTimeout(resolve, 100));

            this.showAdditionalTable = true;
            const sortedData = this.originalData.inline_data.challenge_participants.slice().sort((a, b) => b.metric_value - a.metric_value);

            this.updateChart(sortedData);

            // Call the animateBars function after updating the chart
            this.animateBars(sortedData);

            // Calculate quartiles and update the table data
            this.quartileData = this.calculateQuartiles(sortedData);

            this.quartileDataArray = this.getQuartileData(this.quartileData);

            // Add lines between quartile groups
            this.addLinesBetweenQuartiles();

            // Add quartile labels
            this.addQuartileLabels();

            Plotly.update(this.graphDiv)
        } else {
            this.sorted = false;
            Plotly.Plots.resize(this.graphDiv);
            await new Promise(resolve => setTimeout(resolve, 100));

            this.showAdditionalTable = false;
            this.updateChart(this.originalData.inline_data.challenge_participants);

            // Call the animateBars function after updating the chart
            this.animateBars(this.originalData.inline_data.challenge_participants);

            this.quartileData = {};

            this.quartileDataArray = {};

            // Remove lines between quartile groups
            this.removeLinesBetweenQuartiles();

            // Clear quartile labels
            this.clearQuartileLabels();
        }

        this.sortOrder = this.sortOrder === 'raw' ? 'sorted' : 'raw';
    }

    getQuartileData(data) {
        const array = Object.entries(data).map(([tool, quartile]) => ({ tool, quartile }));
        // Sort the array alphabetically
        return array.sort((a, b) => a.tool.localeCompare(b.tool));
    }

    updateChart(data) {
        const x = data.map(entry => entry.tool_id);
        const y = data.map(entry => entry.metric_value);

        const update = {
            x: [x],
            y: [y],
        };

        Plotly.update(this.graphDiv, update);
    }

    calculateQuartiles(data) {
        const sortedValues = data.map(entry => entry.metric_value).sort((a, b) => a - b);
        const middleIndex = Math.floor(data.length / 2);

        let q1, q2, q3;
        // Calculate Q2
        if (sortedValues.length % 2 === 0) {
            // Even length
            q2 = (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
        } else {
            // Odd length
            q2 = sortedValues[middleIndex];
        }

        const lowerArray = sortedValues.filter(value => value < q2);
        const upperArray = sortedValues.filter(value => value > q2);

        // Calculate median for lowerArray and upperArray
        q1 = this.calculateMedians(lowerArray);
        q3 = this.calculateMedians(upperArray);

        // Create an object to store metric positions
        const metricPositions = {};

        // Assign positions to metrics based on quartiles with the polarity of the dataset
        data.forEach(entry => {
            const metricValue = entry.metric_value;
            if (this.datasetPolarity === "minimum") {
                if (metricValue <= q1) {
                metricPositions[entry.tool_id] = { quartile: 1, bgColor: 'rgb(237, 248, 233)' };
                } else if (metricValue > q1 && metricValue <= q2) {
                metricPositions[entry.tool_id] = { quartile: 2, bgColor: 'rgb(186, 228, 179)' };
                } else if (metricValue > q2 && metricValue < q3) {
                metricPositions[entry.tool_id] = { quartile: 3, bgColor: 'rgb(116, 196, 118)' };
                } else if (metricValue >= q3) {
                metricPositions[entry.tool_id] = { quartile: 4, bgColor: 'rgb(35, 139, 69)' };
                }
            } else {
                if (metricValue <= q1) {
                metricPositions[entry.tool_id] = { quartile: 4, bgColor: 'rgb(35, 139, 69)' };
                } else if (metricValue > q1 && metricValue <= q2) {
                metricPositions[entry.tool_id] = { quartile: 3, bgColor: 'rgb(116, 196, 118)' };
                } else if (metricValue > q2 && metricValue < q3) {
                metricPositions[entry.tool_id] = { quartile: 2, bgColor: 'rgb(186, 228, 179)' };
                } else if (metricValue >= q3) {
                metricPositions[entry.tool_id] = { quartile: 1, bgColor: 'rgb(237, 248, 233)' };
                }
            }
        });
        return metricPositions;
    }

    // Function to calculate medians in odd or even arrays.
    // ----------------------------------------------------------------
    calculateMedians(inputArray) {
        const sortedArray = [...inputArray].sort((a, b) => a - b);

        // Median number
        const middleIndex = Math.floor(sortedArray.length / 2);

        if (inputArray.length % 2 === 0) {
            // Even length
            const middleValues = [sortedArray[middleIndex - 1], sortedArray[middleIndex]];
            return (middleValues[0] + middleValues[1]) / 2;
        } else {
            // Odd length
            return sortedArray[middleIndex];
        }
    }

    addLinesBetweenQuartiles() {
        const layout = this.graphDiv.layout;

        // Ensure layout.shapes is initialized as an array
        layout.shapes = layout.shapes || [];

        const tools = Object.keys(this.quartileData);

        // Iterate over the tools to find transitions between quartiles
        for (let i = 1; i < tools.length; i++) {
            const currentTool = this.quartileData[tools[i]];
            const previousTool = this.quartileData[tools[i - 1]];

            // If the quartile of the current tool is different from the previous tool, draw a line between them
            if (currentTool.quartile !== previousTool.quartile) {
                // Calculate the x-position for the line between the current and previous tools
                const linePosition = (i + i - 1) / 2;

                // Add a line shape to the layout with initial y-positions at the bottom
                layout.shapes.push({
                type: 'line',
                xref: 'x',
                yref: 'paper',
                x0: linePosition,
                x1: linePosition,
                y0: 0,  // Start from the bottom
                y1: 0,  // Start from the bottom
                line: {
                    color: 'rgba(11, 87, 159, 0.5)',
                    width: 1,
                    dash: 'dashdot'
                }
                });

                // Animate the line upwards to its final position
                this.animateLine(layout.shapes.length - 1);
            }
        }

        // Update the layout with the new shapes
        Plotly.relayout(this.graphDiv, { shapes: layout.shapes });
    }

    addQuartileLabels() {
        const layout = this.graphDiv.layout;

        // Ensure layout.annotations is initialized as an array
        layout.annotations = layout.annotations || [];

        const tools = Object.keys(this.quartileData);
        const quartileCounts = {}; // Object to store the count of quartiles for each quartile number

        // Count the occurrences of each quartile number
        tools.forEach(tool => {
            const quartile = this.quartileData[tool].quartile;
            quartileCounts[quartile] = (quartileCounts[quartile] || 0) + 1;
        });

        // Identify quartiles with only one tool
        let uniqueQuartiles = Object.keys(quartileCounts).filter(quartile => quartileCounts[quartile] === 1);

        // Set to keep track of added label positions
        const addedLabelPositions = new Set();

        // Iterate over the tools to add quartile labels
        tools.forEach(tool => {
            const quartile = this.quartileData[tool].quartile;

            // Calculate the label position based on quartile count
            let labelPosition;
            if (quartileCounts[quartile] === 1) {
                // If quartile occurs only once, place the label above the tool
                labelPosition = tools.indexOf(tool);
            } else {
                // If quartile occurs multiple times, calculate the midpoint between tools with the same quartile
                const positions = tools.reduce((acc, curr, index) => {
                if (this.quartileData[curr].quartile === quartile) {
                    acc.push(index);
                }
                return acc;
                }, []);

                const sum = positions.reduce((sum, pos) => sum + pos, 0);
                labelPosition = sum / positions.length;
            }

            // Add label only if it hasn't been added at this position
            if (!addedLabelPositions.has(labelPosition)) {
                // Add a label annotation to the layout
                layout.annotations.push({
                    x: labelPosition,
                    y: 1.03, // Top of the chart
                    xref: 'x',
                    yref: 'paper',
                    text: `Q${quartile}`,
                    showarrow: false,
                    font: {
                    size: 16,
                    color: 'rgba(11, 87, 159, 0.5)'
                    }
                });

                // Add the label position to the set of added positions
                addedLabelPositions.add(labelPosition);
            }
        });

        this.layout = layout;

        // Update the layout with the new annotations
        Plotly.relayout(this.graphDiv, { annotations: layout.annotations });
    }

    removeLinesBetweenQuartiles() {
        const layout = this.graphDiv.layout;

        // Remove existing shapes
        if(layout.shapes) {
            layout.shapes = layout.shapes.filter(shape => shape.type !== 'line');
        }

        // Update the plotly layout
        Plotly.update(this.graphDiv, {}, layout);
    }

    clearQuartileLabels() {
        const layout = this.graphDiv.layout;

        // Ensure layout.annotations is initialized as an array
        layout.annotations = [];

        // Update the layout with the cleared annotations
        Plotly.relayout(this.graphDiv, { annotations: layout.annotations });
    }

    render() {
        return html`
            <div class="bar-plot oeb-graph">
                <div class="row" id="graph-filters">
                    <div class="col-8">
                        <div class="btn-group btn-graphs" role="group" aria-label="Basic example">
                            <button type="button" id="sortOrderBtn" class="btn btn-secondary" @click="${ this.toggleSortOrder }">Sort & Classify Data</button>
                            <button type="button" id="optimalBtn" class="btn btn-secondary">Optimal View</button>
                            <button type="button" id="resetBtn" class="btn btn-secondary">Reset View</button>
                        </div>
                    </div>
                </div>
                <div class="row" id="todownload">
                    <div class=${ this.sorted ? 'col-8': 'col-12' } id="chartCapture">
                        <div class="chart" id="bar-chart"></div>
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
                            <table class="tools-table">
                                <thead>
                                    <tr>
                                        <th class="tools-th">Participants</th>
                                        <th class="classify-th">
                                            Quartile
                                            <ui-tooltip 
                                                for="anchor"
                                                icon="info"
                                                textTitle="The Square quartile label"
                                                textBody="By default, the highest values will be displayed in the first quartile.
                                                    Inversely if it is specified">
                                            </ui-tooltip>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${ this.showAdditionalTable ? html`
                                        ${ this.quartileDataArray.map(quartile => html`
                                            <tr>
                                                <td>${ quartile.tool }</td>
                                                <td style="background-color: ${ quartile.quartile.bgColor }">${ quartile.quartile.quartile }</td>
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

window.customElements.define('bar-plot', BarPlot);