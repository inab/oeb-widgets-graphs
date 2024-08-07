import { html, LitElement } from 'lit';
import Plotly from 'plotly.js-dist'
import { plotlyStyles } from "./plotly-styles.js";
import { graphStyles } from './graph-styles.js';
import { oebIcon } from './utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import pf from 'pareto-frontier';

export class ScatterPlot extends LitElement {
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
        isOptimal: true
    };

    constructor() {
        super();

        this.markerColors = ['#D62728', '#FF7F0E', '#8C564B', '#E377C2', '#4981B6', '#BCBD22', '#9467BD', '#0C9E7B', '#7F7F7F', '#31B8BD', '#FB8072', '#62D353'];
        this.symbols = ['circle', 'triangle-up', 'pentagon', 'cross', 'x', 'star', 'star-diamond', 'square', 'diamond-tall'];
        this.optimal = 'no';
        this.quartileDataArray = [];
        this.optimalText = 'Optimal View';
        this.optimalTextReset = 'Original View';
        this.colorIndex = 0;
        this.currentIndex = 0;
        this.optimalXaxis = [];
        this.optimalYaxis = [];
        this.dataPoints = [];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        this.data = JSON.parse(newVal);
        super.attributeChangedCallback(name, oldVal, JSON.parse(newVal));
    }

    updated() {
        this.graphDiv = this.shadowRoot.querySelector('#scatter-chart');
        this.myPlot = Plotly.newPlot(this.graphDiv, [], this.layout, { displayModeBar: false, responsive: true, hovermode: false });
        this.renderChart();
    }

    renderChart() {
        if(this.data) {
            const data = this.data.inline_data;
            this.datasetId = this.data._id;
            this.datasetModDate = this.data.dates.modification;
            this.visualizationData = data.visualization;
            this.originalData = this.data;
            this.optimalview = data.visualization.optimization !== undefined ? data.visualization.optimization : null;

            const traces = [];

            // Data for the Pareto frontier and Quartile
            this.xValues = data.challenge_participants.map((participant) => participant.metric_x);
            this.yValues = data.challenge_participants.map((participant) => participant.metric_y);
            this.toolID = data.challenge_participants.map((participant) => participant.tool_id);
            this.allToolID = data.challenge_participants.map((participant) => participant.tool_id);

            this.dataPoints = data.challenge_participants.map((participant) => [
                participant.metric_x,
                participant.metric_y,
            ]);

            if (this.optimalview != null) {
                let direction = this.formatOptimalDisplay(this.optimalview);
                let paretoPoints = pf.getParetoFrontier(this.dataPoints, { optimize: direction });

                // If the pareto returns only one point, we create two extra points to represent it.
                if(paretoPoints.length == 1) {
                    const extraPoint = [paretoPoints[0][0], 0];
                    const extraPoint2 = [Math.max(...this.xValues), paretoPoints[0][1]];
                    paretoPoints.unshift(extraPoint);
                    paretoPoints.push(extraPoint2);
                }

                const globalParetoTrace = {
                    x: paretoPoints.map((point) => point[0]),
                    y: paretoPoints.map((point) => point[1]),
                    mode: 'lines',
                    type: 'scatter',
                    name: '<span style="color:black;">Global Pareto Frontier</span>',
                    line: {
                        dash: 'dot',
                        width: 2,
                        color: 'rgb(152, 152, 152)',
                    },
                    opacity: 0,
                };

                const dynamicParetoTrace = {
                    x: paretoPoints.map((point) => point[0]),
                    y: paretoPoints.map((point) => point[1]),
                    mode: 'lines',
                    type: 'scatter',
                    name: 'Dynamic Pareto Frontier',
                    line: {
                        dash: 'dot',
                        width: 2,
                        color: 'rgb(244, 124, 33)',
                    },
                    opacity: 0,
                };

                // Add the pareto trace to the trace array
                traces.push(globalParetoTrace, dynamicParetoTrace);
            } else {
                const globalParetoTrace = {
                    x: ['0'],
                    y: ['0'],
                    mode: 'lines',
                    type: 'scatter',
                    name: '<span style="color:black;">Global Pareto Frontier</span>',
                    line: {
                        dash: 'dot',
                        width: 2,
                        color: 'rgb(152, 152, 152)',
                    },
                    opacity: 0,
                };

                const dynamicParetoTrace = {
                    x: ['0'],
                    y: ['0'],
                    mode: 'lines',
                    type: 'scatter',
                    name: 'Dynamic Pareto Frontier',
                    line: {
                        dash: 'dot',
                        width: 2,
                        color: 'rgb(244, 124, 33)',
                    },
                    opacity: 0,
                };

                traces.push(globalParetoTrace, dynamicParetoTrace);
            }

            // Go through each object in challenge participants
            // Create traces
            for (let i = 0; i < data.challenge_participants.length; i++) {
                const participant = data.challenge_participants[i];

                const trace = {
                    x: [participant.metric_x],
                    y: [participant.metric_y],
                    mode: 'markers',
                    type: 'scatter',
                    marker: {
                        size: 14,
                        symbol: this.getSymbol(),
                        color: this.getColor(),
                    },
                    name: participant.tool_id,
                    showlegend: true,
                    error_x: {
                        type: 'data',
                        array: [participant.stderr_x],
                        visible: true,
                        color: '#000000',
                        width: 2,
                        thickness: 0.3,
                    },
                    error_y: {
                        type: 'data',
                        array: [participant.stderr_y],
                        visible: true,
                        color: '#000000',
                        width: 2,
                        thickness: 0.3,
                    },
                    opacity: 0,
                };
                traces.push(trace);
            }

            let layout = null;
            if(this.layout == null) {
                // Create the chart layout
                layout = {
                    autosize: true,
                    height: 800,
                    annotations: this.getOptimizationArrow(this.optimalview),
                    xaxis: {
                        title: {
                            text: this.visualizationData.x_axis,
                            font: {
                                family: 'Arial, sans-serif',
                                size: 18,
                                color: 'black',
                                weight: 'bold',
                            },
                        },
                    },
                    yaxis: {
                        title: {
                            text: this.visualizationData.y_axis,
                            font: {
                                family: 'Arial, sans-serif',
                                size: 18,
                                color: 'black',
                                weight: 'bold',
                            },
                        },
                    },
                    margin: { l: 60, r: 30, t: 0, b: 10, pad: 4 },
                    legend: {
                        orientation: 'h',
                        x: 0,
                        y: -0.2,
                        xref: 'paper',
                        yref: 'paper',
                        font: {
                            size: 18,
                        },
                        itemdoubleclick: "toggle",
                    },
                    images: this.getImagePosition(this.optimalview),
                    showlegend: true,
                };
            } else {
                layout = this.layout;
            }

            const config = {
                displayModeBar: false,
                responsive: true,
                hovermode: false,
            };

            // Create the chart with initial opacity set to 0
            Plotly.newPlot(this.graphDiv, traces, layout, config).then((gd) => {
                // Animate traces from opacity 0 to 1
                Plotly.animate(gd, {
                    data: traces.map((trace, index) => ({
                        opacity: 1,
                    })),
                    traces: Array.from(Array(traces.length).keys()),
                    layout: {},
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
                this.optimalXaxis = layoutObj.xaxis.range;
                this.optimalYaxis = layoutObj.yaxis.range;

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
    }

    toggleView() {
        this.isOptimal = !this.isOptimal;
        if (this.isOptimal) {
            this.setOriginalView();
        } else {
            this.setOptimalView();
        }
        this.optimal = this.optimal === 'no' ? 'yes' : 'no';
    }

    // Function to format the optimal display direction
    formatOptimalDisplay(optimization) {
        let direction = null;
        if (optimization){
            if (optimization == 'top-right') {
                direction = 'topRight';
            } else if (optimization == 'top-left') {
                direction = 'topLeft';
            } else if (optimization == 'bottom-right') {
                direction = 'bottomRight';
            }else if (optimization == 'bottom-left') {
                direction = 'bottomLeft';
            }
            return direction
        }else{
            return null
        }
    }

    // Update the graph based on the selected trace
    updatePlotOnSelection(traceIndex) {
        traceIndex = traceIndex - 2;

        const toolHidden = this.dataPoints[traceIndex].hidden;

        if(!toolHidden) {
            const visibleTools = this.dataPoints.filter((tool) => !tool.hidden);
            if (visibleTools.length <= 4) {
                this.showMessageError = true;
                this.dismissCountDown = 5;

                const timer = setInterval(() => {
                    if (this.dismissCountDown > 0) {
                        this.dismissCountDown -= 1;
                    } else {
                        this.showMessageError = false;
                        clearInterval(timer);
                    }
                }, 1000);
                return false;
            }
        } else {
            this.showMessageError = false;
        }

        this.dataPoints[traceIndex].hidden = !toolHidden;

        const updatedVisibleTools = this.dataPoints.filter((tool) => !tool.hidden);

        const newTraces = null;
        if(this.optimalview != null) {
            let direction = this.formatOptimalDisplay(this.optimalview);
            const newParetoPoints = pf.getParetoFrontier(updatedVisibleTools, { optimize: direction });

            this.newTraces = {
                x: [newParetoPoints.map((point) => point[0])],
                y: [newParetoPoints.map((point) => point[1])]
            };
        }

        // Update Square Quartiles
        // ----------------------------------------------------------------
        if(this.viewSquare === true) {
            // If the Square view is active, the quartiles are calculated with the visible traces
            const updatedXCoordinates = updatedVisibleTools.map((participant) => participant[0]);
            const updatedYCoordinates = updatedVisibleTools.map((participant) => participant[1]);

            // Create a list of visible tools with their hiding status
            const visibleTools = this.toolID.map((tool, index) => ({
                name: tool,
                hidden: this.dataPoints[index].hidden
            })).filter(tool => !tool.hidden);

            // List of visible tools
            const visibleToolNames = visibleTools.map(tool => tool.name);
            // Update data with visible tools
            this.calculateQuartiles(updatedXCoordinates, updatedYCoordinates, visibleToolNames);
            this.setOptimalView()
        }

        // Update Diagonal Quartiles
        // ----------------------------------------------------------------
        if(this.viewDiagonal === true){
            const updatedXCoordinates = updatedVisibleTools.map((participant) => participant[0])
            const updatedYCoordinates = updatedVisibleTools.map((participant) => participant[1])

            // Update data with visible tools
            this.getDiagonalQuartile(updatedXCoordinates, updatedYCoordinates);
            this.setOptimalView()
        }

        // If the K-means view is active, K-means Clustering is recalculated, otherwise it is not.
        if (this.viewKmeans === true) {

            // Create a list of visible tools with their hiding status
            const visibleTools = this.toolID.map((tool, index) => ({
                name: tool,
                hidden: this.dataPoints[index].hidden
            })).filter(tool => !tool.hidden);

            // List of visible tools
            const visibleToolNames = visibleTools.map(tool => tool.name);

            // Recalculate Clustering
            let better = this.optimalview
            this.createShapeClustering(updatedVisibleTools, visibleToolNames, better, this.allToolID);
            this.showShapesKmeans = true;

            // Create a new layout
            const layout = {
                shapes: this.showShapesKmeans ? this.shapes : [],
                annotations: this.getOptimizationArrow(this.optimalview).concat(this.annotationKmeans)
            };
            Plotly.update(this.graphDiv, newTraces, layout, 1);
        }

        Plotly.update(this.graphDiv, this.newTraces, {}, 1);
    }

    // Calculate square quartiles
    calculateQuartiles (xValues, yValues, toolID){
        const cuartilesX = statistics.quantile(xValues, 0.5);
        const cuartilesY = statistics.quantile(yValues, 0.5);

        let better = this.optimalview
        let allToolsWithId = this.allToolID
        this.sortToolsForSquare(better, allToolsWithId, toolID, cuartilesX, cuartilesY, xValues, yValues)

        // Lines 
        const shapes = [
            {
                type: 'line',
                x0: cuartilesX,
                x1: cuartilesX,
                y0: 0,
                y1: Math.max(...yValues) + Math.max(cuartilesY),
                line: {
                color: '#C0D4E8',
                width: 2,
                dash: 'dash'
                }
            },
            {
                type: 'line',
                y0: cuartilesY,
                y1: cuartilesY,
                x0: 0,
                x1: Math.max(...xValues) + Math.max(cuartilesX),
                line: {
                color: '#C0D4E8',
                width: 2,
                dash: 'dash'
                }
            },
        ];

        // Annotations
        this.annotationSquareQuartile(better)
        // Add Quartiles
        const layout = {
            shapes: this.showShapesSquare ? shapes : [],
        };
        Plotly.relayout(this.$refs.chart, layout);
    }

    // Sort tools for Square Quartiles
    sortToolsForSquare(better, allToolsWithId, visibleToolID, cuartilesX, cuartilesY, xValues, yValues) {
        this.tableData = [];
        allToolsWithId.forEach((tool) => { // Iterate over all tools
            const index = visibleToolID.indexOf(tool);
            const x = index !== -1 ? xValues[index] : null; // Get index and values x, y
            const y = index !== -1 ? yValues[index] : null; // Get index and values x, y
            
            let cuartil = 0;
            let label = '--';

            if (index !== -1) { // Si la herramienta está presente en visibleToolID
                if (better === "bottom-right") {
                if (x >= cuartilesX && y <= cuartilesY) {
                    cuartil = 1;
                    label = 'Top';
                } else if (x >= cuartilesX && y > cuartilesY) {
                    cuartil = 3;
                    label = 'Interquartile';
                } else if (x < cuartilesX && y > cuartilesY) {
                    cuartil = 4;
                    label = 'Bottom';
                } else if (x < cuartilesX && y <= cuartilesY) {
                    cuartil = 2;
                    label = 'Interquartile';
                }
                } else if (better === "top-right") {
                if (x >= cuartilesX && y < cuartilesY) {
                    cuartil = 3;
                    label = 'Interquartile';
                } else if (x >= cuartilesX && y >= cuartilesY) {
                    cuartil = 1;
                    label = 'Top';
                } else if (x < cuartilesX && y >= cuartilesY) {
                    cuartil = 2;
                    label = 'Interquartile';
                } else if (x < cuartilesX && y < cuartilesY) {
                    cuartil = 4;
                    label = 'Bottom';
                }
                } else if (better === "top-left") {
                if (x >= cuartilesX && y < cuartilesY) {
                    cuartil = 4;
                    label = 'Bottom';
                } else if (x >= cuartilesX && y >= cuartilesY) {
                    cuartil = 2;
                    label = 'Interquartile';
                } else if (x < cuartilesX && y >= cuartilesY) {
                    cuartil = 1;
                    label = 'Top';
                } else if (x < cuartilesX && y < cuartilesY) {
                    cuartil = 3;
                    label = 'Interquartile';
                }
                }
            }
            this.tableData.push({ tool_id: tool, cuartil: cuartil, label: label });
        });
    }

    // Annotation for Square Quartiles
    annotationSquareQuartile (better){
        // Create Annotation
        let position = this.asignaPositionCuartil(better)
        // Add label to the position (Top, Interquartile, Botton)
        const newAnnotation = position.map(({ position, numCuartil }) => {
            let annotation = {};
            switch (position) {
                case 'top-left':
                annotation = {
                    xref: 'paper',
                    yref: 'paper',
                    x: 0.01,
                    xanchor: 'left',
                    y: 1,
                    yanchor: 'top',
                    text: numCuartil,
                    showarrow: false,
                    font: {
                    size: 20,
                    color: '#5A88B5'
                    }
                };
                break;
                case 'bottom-right':
                annotation = {
                    xref: 'paper',
                    yref: 'paper',
                    x: 0.90,
                    xanchor: 'left',
                    y: 0.05,
                    yanchor: 'bottom',
                    text: numCuartil,
                    showarrow: false,
                    font: {
                    size: 20,
                    color: '#5A88B5'
                    }
                };
                break;
                case 'bottom-left':
                annotation = {
                    xref: 'paper',
                    yref: 'paper',
                    x: 0.01,
                    xanchor: 'left',
                    y: 0.10,
                    yanchor: 'top',
                    text: numCuartil,
                    showarrow: false,
                    font: {
                    size: 20,
                    color: '#5A88B5'
                    }
                };
                break;
                case 'top-right':
                annotation = {
                    xref: 'paper',
                    yref: 'paper',
                    x: 0.90,
                    xanchor: 'left',
                    y: 0.98,
                    yanchor: 'top',
                    text: numCuartil,
                    showarrow: false,
                    font: {
                    size: 20,
                    color: '#5A88B5'
                    }
                };
                break;
                default:
                break;
            }
            return annotation;
        });

        const annotations = this.getOptimizationArrow(this.optimalview)
        const layout = {
            annotations: this.showAnnotationSquare ? annotations.concat(newAnnotation) : [],
        };
        Plotly.relayout(this.graphDiv, layout);
    }

    resetChart() {
        this.sorted = false;

        // Redimensionar el gráfico
        Plotly.Plots.resize(this.graphDiv);

        // Reset the Plot
        this.tableData = []
        this.viewKmeans = false;
        this.viewSquare = false;
        this.viewDiagonal = false;
        this.showShapesKmeans = false;
        this.showShapesSquare = false;
        this.showAnnotationSquare = false;

        let plot = this.graphDiv.data;
        if(plot && plot.data){
            const numTraces = plot.data.length;
            const visibleArray = Array(numTraces).fill(true);

            this.dataPoints.forEach(array => { array.hidden = false; });
            const updatedVisibleTools = this.dataPoints.filter((tool) => !tool.hidden);

            if (this.optimalview != null){
                let direction = this.formatOptimalDisplay(this.optimalview);
                const newParetoPoints = pf.getParetoFrontier(updatedVisibleTools, { optimize: direction });
                
                // If the pareto returns only one point, we create two extra points to represent it.
                if (newParetoPoints.length == 1) {
                    const extraPoint = [newParetoPoints[0][0], 0];
                    const extraPoint2 = [Math.max(...this.xValues), newParetoPoints[0][1]];
                    newParetoPoints.unshift(extraPoint);
                    newParetoPoints.push(extraPoint2);
                }

                // Update the trace of the Pareto frontier
                const newTraces = {
                    x: [newParetoPoints.map((point) => point[0])],
                    y: [newParetoPoints.map((point) => point[1])]
                };

                // Modificar despues
                const layout = {
                    shapes: false ? shapes : [],
                    annotations: this.getOptimizationArrow(this.optimalview)
                };

                this.layout = layout;

                // Update only the trace data, without changing the layout
                Plotly.update(this.graphDiv, newTraces, layout, 1);
            }
            
            // restarts the traces
            Plotly.restyle(this.graphDiv, { visible: visibleArray });
        }
    }

    setOptimalView() {
        let layout = {
            xaxis: {
                title: {
                    text: this.visualizationData.x_axis,
                    font: {
                        family: 'Arial, sans-serif',
                        size: 18,
                        color: 'black',
                        weight: 'bold',
                    },
                }
            },
            yaxis: {
                title: {
                    text: this.visualizationData.y_axis,
                    font: {
                        family: 'Arial, sans-serif',
                        size: 18,
                        color: 'black',
                        weight: 'bold',
                    },
                },
            },
            margin: { l: 60, r: 30, t: 0, b: 10, pad: 4 },
            legend: {
                orientation: 'h',
                x: 0,
                y: -0.2,
                xref: 'paper',
                yref: 'paper',
                font: {
                    size: 18,
                },
                itemdoubleclick: "toggle",
            },
            images: this.getImagePosition(this.optimalview),
            showlegend: true,
        };

        this.layout = layout;
        Plotly.relayout(this.graphDiv, layout);
    }

    // Original View (Real dimensions)
    setOriginalView() {
        const layout = {
            xaxis: {
                range: [0, Math.max(...this.xValues) + (Math.min(...this.xValues) / 3)],
                title: {
                    text: this.visualizationData.x_axis,
                    font: {
                        family: 'Arial, sans-serif',
                        size: 18,
                        color: 'black',
                        weight: 'bold',
                    },
                }
            },
            yaxis: {
                range: [0, Math.max(...this.yValues) + 0.05],
                title: {
                    text: this.visualizationData.y_axis,
                    font: {
                        family: 'Arial, sans-serif',
                        size: 18,
                        color: 'black',
                        weight: 'bold',
                    },
                },
            },
            margin: { l: 60, r: 30, t: 0, b: 10, pad: 4 },
            legend: {
                orientation: 'h',
                x: 0,
                y: -0.2,
                xref: 'paper',
                yref: 'paper',
                font: {
                    size: 18,
                },
                itemdoubleclick: "toggle",
            },
            images: this.getImagePosition(this.optimalview),
            showlegend: true,
        };

        this.layout = layout;
        Plotly.relayout(this.graphDiv, layout);
    }

    // Color of the traces
    getColor() {
        const currentColor = this.markerColors[this.colorIndex];
        this.colorIndex = (this.colorIndex + 1) % this.markerColors.length;
        return currentColor;
    }

    // Symbol of the traces
    getSymbol() {
        const currentSymbol = this.symbols[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.symbols.length;
        return currentSymbol;
    }

    // This function creates the annotations for the optimization arrow
    // If optimization is null it returns an empty array
    getOptimizationArrow(optimization) {
        const arrowAnnotations = [];
        let arrowX, arrowY;
        let axAdjustment = 0;
        let ayAdjustment = 0;

        // If optimization create annotations for the arrow
        if (optimization){
            // Determine arrow position based on optimization
            switch (optimization) {
                case 'top-left':
                arrowX = 0;
                arrowY = 0.98;
                axAdjustment = 35;
                ayAdjustment = 30;
                break;

            case 'top-right':
                arrowX = 0.98;
                arrowY = 0.98;
                axAdjustment = -30;
                ayAdjustment = 35;
                break;

            case 'bottom-right':
                arrowX = 1;
                arrowY = 0;
                axAdjustment = -30;
                ayAdjustment = -30;
                break;

            default:
                // By default, place the arrow in the upper left corner
                arrowX = 0;
                arrowY = 0;
                axAdjustment = 30;
                ayAdjustment = -35;
            }

            // Crear la anotación para la flecha
            const arrowAnnotation = {
                x: arrowX,
                y: arrowY,
                xref: 'paper',
                yref: 'paper',
                text: 'Optimal corner',
                font: {
                color: '#6C757D'
                },
                showarrow: true,
                arrowhead: 3,
                ax: axAdjustment,
                ay: ayAdjustment,
                arrowsize: 1,
                arrowcolor: '#6C757D'
            };

            arrowAnnotations.push(arrowAnnotation);
            return arrowAnnotations;
        }else{
            return null;
        }
    }

    // Image Position
    getImagePosition(optimization) {
        const ImagePositions = [];

        let positionX, positionY;

        // Posicion contraria
        switch (optimization) {
            case 'top-left':
                positionX = 1
                positionY = 0
                break;
            case 'top-right':
                positionX = 0.1
                positionY = 0
                break;
            case 'bottom-left':
                positionX = 1
                positionY = 0.9
                break;
            case 'bottom-right':
                positionX = 0.1
                positionY = 0.8
                break;
            default:
                positionX = 0.1
                positionY = 0
                break;
        }

        const imagesPosition = {
            x: positionX,
            y: positionY,
            sizex: 0.1,
            sizey: 0.3,
            source: this.imgLogo,
            xref: "paper",
            yref: "paper",
            xanchor: "right",
            yanchor: "bottom",
            "opacity": 0,
        }

        ImagePositions.push(imagesPosition)

        return ImagePositions
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
                        <div class="dropdown classification-dropdown">
                                <button type="button" class="btn dropbtn first-btn">Classification</button>
                                <div class="dropdown-content">
                                    <div class=""
                                        >
                                        No Classification
                                    </div>
                                    <div class=""
                                        >
                                        Square Quartiles
                                    </div>
                                    <div class=""
                                        >
                                        Diagonal Quartiles
                                    </div>
                                    <div class=""
                                        >
                                        K-Means Clustering
                                    </div>
                                </div>
                            </div>
                            <button type="button" id="optimalBtn" class="btn btn-secondary"
                                @click="${ this.toggleView }">
                                <span>${ this.getOptimalText() }</span>
                            </button>
                            <button type="button" id="optimalBtn" class="btn btn-secondary"
                                @click="${ this.resetChart }">
                                <span>Reset Chart</span>
                            </button>
                            <div class="dropdown download-dropdown">
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
                <div class="graph-row" id="tododownload">
                    <div class=${ this.sorted ? 'col-8': 'col-12' } id="chartCapture">
                        <div class="chart" id="scatter-chart"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

window.customElements.define('scatter-plot', ScatterPlot);