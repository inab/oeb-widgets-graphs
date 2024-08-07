import { html, LitElement } from 'lit';
import Plotly from 'plotly.js-dist'
import { plotlyStyles } from "./plotly-styles.js";
import { graphStyles } from './graph-styles.js';
import { oebIcon } from './utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

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
        datasetId: '',
        sorted: false,
        showAdditionalTable: false,
        isOptimal: false
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
        this.sortText = 'Sort & Classify Data';
        this.sortTextRaw = 'Return To Raw Results';
        this.optimalText = 'Optimal View';
        this.optimalTextReset = 'Original View';
    }

    attributeChangedCallback(name, oldVal, newVal) {
        this.data = JSON.parse(newVal);
        super.attributeChangedCallback(name, oldVal, JSON.parse(newVal));
    }

    updated() {
        this.graphDiv = this.shadowRoot.querySelector('#bar-chart');
        this.todoDownload = this.shadowRoot.querySelector('#todownload');
        this.chartCapture = this.shadowRoot.querySelector('#chartCapture');
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

    async toggleOptimal() {
        try {
            if(this.optimal === 'no') {
                this.isOptimal = true;
                Plotly.Plots.resize(this.graphDiv);
                await new Promise(resolve => setTimeout(resolve, 100));

                let data;
                if (this.sortOrder !== 'raw') {
                    // If data has been sorted, use the sorted data
                    data = this.originalData.inline_data.challenge_participants.slice().sort((a, b) => b.metric_value - a.metric_value);
                } else {
                    // Otherwise, use the original data
                    data = this.originalData.inline_data.challenge_participants;
                }

                const metricValues = data.map(entry => entry.metric_value);
                const minMetric = Math.min(...metricValues);
                const maxMetric = Math.max(...metricValues);

                // Calculate range between min and max metrics
                const metricRange = maxMetric - minMetric;

                // Calculate new y-axis range with a slight buffer based on metric range
                const minY = Math.max(0, minMetric - metricRange * 0.2);
                const maxY = maxMetric + metricRange * 0.08;

                // Update plot layout with new y-axis range
                Plotly.relayout(this.graphDiv, { 'yaxis.range': [minY, maxY] });

                // Animate the bars
                this.animateBars(data);
            } else {
                this.isOptimal = false;

                let data;
                if (this.sortOrder !== 'raw') {
                    // If data has been sorted, use the sorted data
                    data = this.originalData.inline_data.challenge_participants.slice().sort((a, b) => b.metric_value - a.metric_value);
                } else {
                    // Otherwise, use the original data
                    data = this.originalData.inline_data.challenge_participants;
                }
                // Return to original data view by restoring the original y-axis range
                const originalLayout = {
                    'yaxis.range': [0, Math.max(...data.map(entry => entry.metric_value)) + 0.1]
                };

                // Update plot layout with original y-axis range
                Plotly.relayout(this.graphDiv, originalLayout);

                // Animate the bars after adjusting the y-axis range
                this.animateBars(data);
            }

            // Update optimal value to indicate original view is active
            this.optimal = this.optimal === 'no' ? 'yes' : 'no';

            //this.isOptimal = this.optimal === 'yes' ? true : false;
        } catch (error) {
            console.error('Error in optimalView:', error);
        }
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

                if (this.sortOrder === 'sorted' && Object.keys(this.quartileData).length > 1) {
                    // Define your columns
                    const columns = ["Participants", "Quartile"];

                    // Extract data from quartileDataArray
                    const rows = this.quartileDataArray.map(q => [q.tool, q.quartile.quartile]);

                    // Generate autoTable with custom styles
                    pdf.autoTable({
                        head: [columns],
                        body: rows,
                        startY: 190,
                        theme: 'grid',
                        tableWidth: 'auto',
                        styles: {
                        cellPadding: 1,
                        fontSize: 8,
                        overflow: 'linebreak',
                        halign: 'center'
                        },
                        headStyles: {
                            fillColor: [108, 117, 125]
                        },
                        willDrawCell: function (data) {
                            if (data.row.section === 'body') {
                                // Check if the column header matches 'Quartile'
                                if (data.column.dataKey === 1) {
                                    // Access the raw value of the cell
                                    const quartileValue = data.cell.raw;
                                    if (quartileValue === 1) {
                                        pdf.setFillColor(237, 248, 233)
                                    } else if (quartileValue === 2) {
                                        pdf.setFillColor(186, 228, 179)
                                    } else if (quartileValue === 3) {
                                        pdf.setFillColor(116, 196, 118)
                                    } else if (quartileValue === 4) {
                                        pdf.setFillColor(35, 139, 69)
                                    }
                                }
                            }
                        },
                    });

                    // Save the PDF
                    pdf.save(`benchmarking_chart__quartiles_${this.datasetId}.${format}`);
                } else {
                    // Save the PDF
                    pdf.save(`benchmarking_chart_${this.datasetId}.${format}`);
                }
            } else if (format === 'svg') {
                Plotly.downloadImage(this.graphDiv, { format: 'svg', width: 800, height: 600, filename: `benchmarking_chart_${this.datasetId}` });
            } else {
                // Download chart with table
                if (this.sortOrder === 'sorted' && Object.keys(this.quartileData).length > 1) {
                    const toDownloadDiv = this.todoDownload;
                    const downloadCanvas = await html2canvas(toDownloadDiv, {
                        scrollX: 0,
                        scrollY: 0,
                        width: toDownloadDiv.offsetWidth,
                        height: toDownloadDiv.offsetHeight,
                    });

                    const downloadImage = downloadCanvas.toDataURL(`image/${format}`);

                    const link = document.createElement('a');
                    link.href = downloadImage;
                    link.download = `benchmarking_chart_${this.datasetId}.${format}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    const toDownloadChart = this.chartCapture;
                    const downloadChart = await html2canvas(toDownloadChart, {
                        scrollX: 0,
                        scrollY: 0,
                        width: toDownloadChart.offsetWidth,
                        height: toDownloadChart.offsetHeight,
                    });
                    const chartDownloadImage = downloadChart.toDataURL(`image/${format}`);
                    const chartLink = document.createElement('a');
                    chartLink.href = chartDownloadImage;
                    chartLink.download = `benchmarking_chart_${this.datasetId}.${format}`;
                    document.body.appendChild(chartLink);
                    chartLink.click();
                    document.body.removeChild(chartLink);
                }
            }
        } catch (error) {
            console.error('Error downloading chart:', error);
        }
    }

    getSortText() {
        if(this.sorted) {
            return html` ${ this.sortTextRaw } `;
        } else {
            return html` ${ this.sortText } `;
        }
    }

    getOptimalText() {
        if(this.isOptimal) {
            return html` ${ this.optimalTextReset } `;
        } else {
            return html` ${ this.optimalText } `;
        }
    }

    render() {
        return html`
            <div class="bar-plot oeb-graph">
                <div class="graph-row" id="graph-filters">
                    <div class="col-8">
                        <div class="btn-group btn-graphs" role="group" aria-label="Basic example">
                            <button type="button" id="sortOrderBtn" class="btn btn-secondary"
                                @click="${ this.toggleSortOrder }">
                                <span>${ this.getSortText() }</span>
                            </button>
                            <button type="button" id="optimalBtn" class="btn btn-secondary"
                                @click="${ this.toggleOptimal }">
                                <span>${ this.getOptimalText() }</span>
                            </button>
                            <div class="dropdown">
                                <button type="button" class="btn dropbtn">Download</button>
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="graph-row" id="todownload">
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