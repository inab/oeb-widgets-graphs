import { html, LitElement } from 'lit';
import Plotly from 'plotly.js-dist'
import { plotlyStyles } from "./plotly-styles.js";
import { graphStyles } from './graph-styles.js';
import { oebIcon, isBSC } from './utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import pf from 'pareto-frontier';
import * as statistics from 'simple-statistics'
import { Tooltip } from './ui-tooltip.js';
import clusterMaker from 'clusters';

const GRAPH_CONFIG = {
    displayModeBar: false,
    responsive: true,
    hovermode: false
};

export class ScatterPlot extends LitElement {
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
        isDownloading: false,
    };

    constructor() {
        super();

        this.imgLogo = oebIcon;
        this.markerColors = ['#D62728', '#FF7F0E', '#8C564B', '#E377C2', '#4981B6', '#BCBD22', '#9467BD', '#0C9E7B', '#7F7F7F', '#31B8BD', '#FB8072', '#62D353'];
        this.symbols = ['circle', 'triangle-up', 'pentagon', 'cross', 'x', 'star', 'star-diamond', 'square', 'diamond-tall'];
        this.optimal = 'yes';
        this.quartileDataArray = [];
        this.optimalText = 'Optimal View';
        this.optimalTextReset = 'Original View';
        this.viewSelected = "Classification";
        this.viewText = {
            noClassification: 'No Classification',
            square: 'Square Quartiles',
            diagonal: 'Diagonal Quartiles',
            kmeans: 'K-means Clustering',
        };
        this.viewDefault = true;
        this.viewKmeans = false;
        this.viewSquare = false;
        this.viewDiagonal = false;
        this.colorIndex = 0;
        this.currentIndex = 0;
        this.optimalXaxis = [];
        this.optimalYaxis = [];
        this.dataPoints = [];
        this.challengeParticipants = [];
        this.allToolID = "";
        this.showAnnotationSquare = false;
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
        this.dataInline = {};
        this.isDownloading = false;
    }

    attributeChangedCallback(name, oldVal, newVal) {
        this.data = JSON.parse(newVal);
        super.attributeChangedCallback(name, oldVal, JSON.parse(newVal));
    }

    updated() {
        this.graphDiv = this.shadowRoot.querySelector('#scatter-chart');
        this.todoDownload = this.shadowRoot.querySelector('#todownload');
        this.chartCapture = this.shadowRoot.querySelector('#chartCapture');
        this.benchmarkingTable = this.shadowRoot.querySelector('#benchmarkingTable');
        this.toolsCol = this.shadowRoot.querySelector('#toolsCol');
        this.myPlot = Plotly.newPlot(this.graphDiv, [], {}, { displayModeBar: false, responsive: true, hovermode: false });
        this.renderChart();
    }

    renderChart() {
        const traces = [];
        const data = this.data.inline_data;
        
        this.datasetId = this.data._id;
        this.datasetModDate = this.data.dates.modification;
        this.visualizationData = data.visualization;
        this.originalData = this.data;
        this.optimalview = data.visualization.optimization !== undefined ? data.visualization.optimization : null;
        this.challengeParticipants = data.challenge_participants;

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


        if(this.layout == null || this.layout == undefined || this.layout.empty) {
            // Create the chart layout
            layout = {
                autosize: true,
                height: 600,
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
                        size: 16,
                    },
                    itemdoubleclick: "toggle",
                },
                images: this.getImagePosition(this.optimalview),
                showlegend: true,
            };
        } else {
            layout = this.layout;
            layout.images = this.getImagePosition(this.optimalview);
        }

        if(this.layout.yaxis && this.layout.yaxis.range) {
            layout.yaxis.range = this.layout.yaxis.range;
            layout.xaxis.range = this.layout.xaxis.range;
        }

        if(layout.xaxis) {
            layout.xaxis.title = {
                text: this.visualizationData.x_axis,
                font: {
                    family: 'Arial, sans-serif',
                    size: 18,
                    color: 'black',
                    weight: 'bold',
                }
            };
        }

        if(layout.yaxis) {
            layout.yaxis.title = {
                text: this.visualizationData.y_axis,
                font: {
                    family: 'Arial, sans-serif',
                    size: 18,
                    color: 'black',
                    weight: 'bold',
                }
            };
        }

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

    toggleView() {
        this.isOptimal = (typeof this.isOptimal !== 'undefined') ? !this.isOptimal : false;
        this.optimal = this.optimal === 'no' ? 'yes' : 'no';
        if (this.isOptimal) {
            this.setOptimalView();
        } else {
            this.setOriginalView();
        }
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
            let better = this.optimalview;

            // Update data with visible tools
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

        let better = this.optimalview;
        let allToolsWithId = this.allToolID;

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

        let layout = {
            shapes: shapes,
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
                    size: 16,
                },
                itemdoubleclick: "toggle",
            },
            images: this.getImagePosition(this.optimalview),
            showlegend: true,
        }

        if(this.isOptimal || this.optimal == 'yes') {
            layout.xaxis.range = [this.optimalXaxis[0], this.optimalXaxis[1]];
            layout.yaxis.range = [this.optimalYaxis[0], this.optimalYaxis[1]];
        }

        this.layout = layout;

        // Annotations
        this.annotationSquareQuartile(better);

        Plotly.relayout(this.graphDiv, this.layout);
    }

    calculateDiagonalQuartiles(xValues, yValues){
        let toolsNotHidden = xValues.map((x, i) => [x, yValues[i]]);
        let normalizedValues = this.normalizeData(xValues, yValues);
        let [xNorm, yNorm] = [normalizedValues[0], normalizedValues[1]];

        let maxX = Math.max.apply(null, xValues);
        let maxY = Math.max.apply(null, yValues);
        let better = this.optimalview;

        // Calculate the scores for each of the tool. based on their distance to the x and y axis
        let scores = [];

        // Object for store the scores and the coordinates of the tools
        let scoresCoords = {};

        for (let i = 0; i < xNorm.length; i++) {
            if (better == "bottom-right"){
                scores.push(xNorm[i] + (1 - yNorm[i]));
                scoresCoords[xNorm[i] + (1 - yNorm[i])] =  [xValues[i], yValues[i]];

                //append the score to the data array
                toolsNotHidden[i]['score'] = xNorm[i] + (1 - yNorm[i]);
            }
            else if (better == "top-right"){
                scores.push(xNorm[i] + yNorm[i]);
                scoresCoords[xNorm[i] + yNorm[i]] = [xValues[i], yValues[i]];

                //append the score to the data array
                toolsNotHidden[i]['score'] = xNorm[i] + yNorm[i];
            }else if (better == "top-left"){
                scores.push(1 -xNorm[i] + yNorm[i]);
                scoresCoords[(1 -xNorm[i]) + yNorm[i]] = [xValues[i], yValues[i]];

                //append the score to the data array
                toolsNotHidden[i]['score'] = (1 -xNorm[i]) + yNorm[i];
            }
        }
        scores.sort(function(a, b){return b-a});

        let firstQuartile  = statistics.quantile(scores, 0.25);
        let secondQuartile = statistics.quantile(scores, 0.5);
        let thirdQuartile  = statistics.quantile(scores, 0.75);

        let coords = [
            this.getDiagonalLine(scores, scoresCoords, firstQuartile, better, maxX, maxY),
            this.getDiagonalLine(scores, scoresCoords, secondQuartile, better, maxX, maxY),
            this.getDiagonalLine(scores, scoresCoords, thirdQuartile, better, maxX, maxY)
        ]

        // Create shapes
        const shapes = [];
        for (let i = 0; i < coords.length; i++) {
            let [xCoords, yCoords] = [coords[i][0], coords[i][1]];
            const shape = {
                type: 'line',
                x0: xCoords[0],
                y0: yCoords[0],
                x1: xCoords[1],
                y1: yCoords[1],
                line: {
                    color: '#C0D4E8',
                    width: 2,
                    dash: 'dash'
                }
            };

            shapes.push(shape);
        }

        // Get Annotations
        let annotationDiagonal = this.asigneQuartileDiagonal(toolsNotHidden, firstQuartile, secondQuartile, thirdQuartile, better);

        // Diagonal Q. Table
        this.createTableDiagonal(toolsNotHidden);

        let layout = {
            shapes: this.showShapesDiagonal ? shapes : [],
            xaxis: {
                range: [this.optimalXaxis[0], this.optimalXaxis[1]],
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
                range: [this.optimalYaxis[0], this.optimalYaxis[1]],
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
            annotations: this.getOptimizationArrow(this.optimalview).concat(annotationDiagonal),
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

        if(this.layout) {
            this.layout.shapes = this.showShapesDiagonal ? shapes : [];
        }
        this.layout = layout;
        Plotly.relayout(this.graphDiv, this.layout);
    }

    convertValuesToPath(values) {
        if (values.length === 0) return '';

        let path = `M ${values[0][0]},${values[0][1]}`;

        for (let i = 1; i < values.length; i++) {
            path += ` L ${values[i][0]},${values[i][1]}`;
        }

        path += ' Z';
        return path;
    }

    // Helper function to calculate the cross product of vectors OA and OB
    // A positive cross product indicates a counter-clockwise turn, negative indicates a clockwise turncross(o, a, b) {
    cross(o, a, b) {
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    }

    // Function to compute the convex hull of a set of 2D points
    convexHull(points) {
        points.sort((a, b) => a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]);

        const lower = [];
        for (let point of points) {
            while (lower.length >= 2 && this.cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
                lower.pop();
            }
            lower.push(point);
        }

        const upper = [];
        for (let i = points.length - 1; i >= 0; i--) {
            const point = points[i];
            while (upper.length >= 2 && this.cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
                upper.pop();
            }
            upper.push(point);
        }

        upper.pop();
        lower.pop();
        return lower.concat(upper);
    }

    // Function to calculate the centroid of a set of 2D points
    calculateCentroid(points) {
        const xSum = points.reduce((sum, point) => sum + point[0], 0);
        const ySum = points.reduce((sum, point) => sum + point[1], 0);
        return [xSum / points.length, ySum / points.length];
    }

    // Create visualization Kmeans Clustering
    createShapeClustering (dataPoints, toolIDVisible, better, allToolID) {
        clusterMaker.k(4);
        clusterMaker.iterations(500);
        clusterMaker.data(dataPoints);

        // Obtener los resultados de los clusters
        let results = clusterMaker.clusters();
        let sortedResults = JSON.parse(JSON.stringify(results));

        this.orderResultKMeans(sortedResults, better)

        const groupedDataPoints = this.assignGroupToDataPoints(dataPoints, sortedResults);
        this.createDataPointForTables(toolIDVisible, groupedDataPoints, allToolID)

        // Crear shapes basados en los clusters
        this.shapes = sortedResults.map((cluster, index) => {
            const hullPoints = this.convexHull(cluster.points);


            // Create an SVG path for the convex hull polygon
            const path = hullPoints.reduce((acc, point, index) => {
                return acc + (index === 0 ? `M ${point[0]},${point[1]}` : ` L ${point[0]},${point[1]}`);
            }, '') + ' Z';
            const centroid = this.calculateCentroid(cluster.points);

            // Create dashed lines from each point to the centroid
            const lines = cluster.points.map(point => ({
                type: 'line',
                x0: point[0],
                y0: point[1],
                x1: centroid[0],
                y1: centroid[1],
                line: {
                    color: '#2A6CAB',
                    width: 1,
                    dash: 'dash'
            }
        }));

        if(!this.layout.annotations) {
            this.layout.annotations = [];
        }

        // Add an annotation for the cluster label
        this.layout.annotations.push({
            x: centroid[0],
            y: centroid[1],
            text: `Cluster ${index + 1}`,
            showarrow: false,
            font: {
                color: '#2A6CAB',
                size: 12
            },
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            bordercolor: '#2A6CAB',
            borderwidth: 1,
            borderpad: 4
        });

        return [{
                type: 'path',
                path: path,
                line: {
                    color: '#2A6CAB',
                },
                fillcolor: 'rgba(0, 72, 129, 183)',
                opacity: 0.2
            }, ...lines];
        }).flat();

        // Update the layout with the new annotations
        Plotly.relayout(this.graphDiv, this.layout);

        // Crear annotations para los centroides de los clusters
        let count = 0;
        this.annotationKmeans = sortedResults.map((cluster) => {
            const centroidX = cluster.centroid[0];
            const centroidY = cluster.centroid[1];
            count++;

            return {
                xref: 'x',
                yref: 'y',
                x: centroidX,
                xanchor: 'right',
                y: centroidY,
                yanchor: 'bottom',
                text: count,
                showarrow: false,
                font: {
                    size: 30,
                    color: '#5A88B5'
                }
            };
        });

        const layout = {
            shapes: this.showShapesKmeans ? this.shapes : [],
            annotations: this.getOptimizationArrow(this.optimalview).concat(this.annotationKmeans),
        };
        
        Plotly.update(this.graphDiv, {}, layout);
    }

    orderResultKMeans(sortedResults, better) {
        // normalize data to 0-1 range
        let centroidsX = []
        let centroidsY = []

        sortedResults.forEach((element) => {
            centroidsX.push(element.centroid[0])
            centroidsY.push(element.centroid[1])
        })

        let [xNorm, yNorm] = this.normalizeData(centroidsX, centroidsY)

        let scores = [];
        if (better == "top-right") {
            for (let i = 0; i < xNorm.length; i++) {
                let distance = xNorm[i] + yNorm[i];
                scores.push(distance);
                sortedResults[i]['score'] = distance;
            };

        } else if (better == "bottom-right") {
            for (let i = 0; i < xNorm.length; i++) {
                let distance = xNorm[i] + (1 - yNorm[i]);
                scores.push(distance);
                sortedResults[i]['score'] = distance;
            };
        } else if (better == "top-left") {
            for (let i = 0; i < xNorm.length; i++) {
                let distance = (1 - xNorm[i]) + yNorm[i];
                scores.push(distance);
                sortedResults[i]['score'] = distance;
            };
        };

        this.sortByKey(sortedResults, "score");
    }

    sortByKey(array, key) {
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    normalizeData(xValues, yValues) {
        let maxX = Math.max.apply(null, xValues);
        let maxY = Math.max.apply(null, yValues);

        return [xValues.map(x => x / maxX), yValues.map(y => y / maxY)];
    }

    assignGroupToDataPoints(dataPoints, sortedResults) {
        const groupedDataPoints = [];
        for (let i = 0; i < dataPoints.length; i++) {
            const dataPoint = dataPoints[i];
            for (let j = 0; j < sortedResults.length; j++) {
                const group = sortedResults[j];
                // Verificar si el punto está en el grupo
                if (group.points.some(groupPoint => this.isEqual(groupPoint, dataPoint))) {
                    groupedDataPoints.push([...dataPoint, j + 1]);
                    break;
                }
            }
        }

        return groupedDataPoints;
    }

    isEqual(point1, point2) {
        return point1[0] === point2[0] && point1[1] === point2[1];
    }

    // Create data for Table
    createDataPointForTables (visibleTools, groupedDataPoints, allToolID) {
        this.quartileDataArray = [];
        allToolID.forEach((tool) => {
            const index = visibleTools.indexOf(tool);
            let cuartil = 0;
            let label = '--';
            if (index !== -1) {
            cuartil = groupedDataPoints[index][2];
            label = cuartil.toString();
            }

            this.quartileDataArray.push({ tool_id: tool, cuartil: cuartil, label: label });
        })
    }

    asigneQuartileDiagonal(dataTools, firstQuartile, secondQuartile, thirdQuartile, better) {
        let poly = [[],[],[],[]];

        dataTools.forEach(element => {
            if (better == 'top-left'){
                if (element.score <= firstQuartile) {
                    element.quartile = 4;
                    poly[0].push([element[0], element[1], element.quartile]);
                } else if (element.score <= secondQuartile) {
                    element.quartile = 3;
                    poly[1].push([element[0], element[1], element.quartile]);
                } else if (element.score <= thirdQuartile) {
                    element.quartile = 2;
                    poly[3].push([element[0], element[1], element.quartile]);
                } else {
                    element.quartile = 1;
                    poly[2].push([element[0], element[1], element.quartile]);
                }
            } else{
                if (element.score <= firstQuartile) {
                    element.quartile = 4;
                    poly[0].push([element[0], element[1], element.quartile]);
                } else if (element.score <= secondQuartile) {
                    element.quartile = 3;
                    poly[1].push([element[0], element[1], element.quartile]);
                } else if (element.score <= thirdQuartile) {
                    element.quartile = 2;
                    poly[2].push([element[0], element[1], element.quartile]);
                } else {
                    element.quartile = 1;
                    poly[3].push([element[0], element[1], element.quartile]);
                }
            }
        });

        let annotationDiagonal = [];
        poly.forEach((group) => {
            let center = (this.getCentroid(group))
            const centroidX = center[0];
            const centroidY = center[1];
            const quartile = group[0][2];

            let annotationD = {
                xref: 'x',
                yref: 'y',
                x: centroidX,
                xanchor: 'right',
                y: centroidY,
                yanchor: 'bottom',
                text: quartile,
                showarrow: false,
                font: {
                    size: 30,
                    color: '#5A88B5'
                }
            }

            annotationDiagonal.push(annotationD)
        });


        return annotationDiagonal
    }

    createTableDiagonal(visibleTool) {
        this.quartileDataArray = [];

        this.allToolID.forEach((tool) => {
            const toolName = tool;
            const visibleToolInfo = visibleTool.find(item => item[0] === this.xValues[this.allToolID.indexOf(tool)]);

            let quartile = 0;
            let label = '--';

            if (visibleToolInfo) {
                quartile = visibleToolInfo.quartile;
                label = quartile.toString();
            }

            this.quartileDataArray.push({ tool_id: toolName, cuartil: quartile, label: label });
        });
    }

    // Sort tools for Square Quartiles
    sortToolsForSquare(better, allToolsWithId, visibleToolID, cuartilesX, cuartilesY, xValues, yValues) {
        this.quartileDataArray = [];
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
            this.quartileDataArray.push({ tool_id: tool, cuartil: cuartil, label: label });
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

        const annotations = this.getOptimizationArrow(this.optimalview);

        if(this.layout) {
            this.layout.annotations = this.showAnnotationSquare ? annotations.concat(newAnnotation) : [];
        }
    }

    // Asigna position
    asignaPositionCuartil(better){
        // 1: top, 2y3: Middle, 4:Botton
        let num_bottom_right, num_bottom_left, num_top_right, num_top_left;
        if (better == "bottom-right") {
            num_bottom_right = "Top"; // 1
            num_bottom_left = "Interquartile"; // 2
            num_top_right = "Interquartile"; // 3
            num_top_left = "Bottom"; // 4
        }
        else if (better == "top-right") {
            num_bottom_right = "Interquartile"; // 3
            num_bottom_left = "Bottom"; // 4
            num_top_right = "Top"; // 1
            num_top_left = "Interquartile"; // 2

        } else if (better == "top-left") {
            num_bottom_right = "Bottom"; // 4
            num_bottom_left = "Interquartile"; // 3
            num_top_right = "Interquartile"; // 2
            num_top_left = "Top"; // 1
        }

        let positions = [{ position: 'bottom-right', numCuartil: num_bottom_right },
            { position: 'bottom-left', numCuartil: num_bottom_left },
            { position: 'top-right', numCuartil: num_top_right },
            { position: 'top-left', numCuartil: num_top_left },]

        return positions
    }

    resetChart() {
        this.sorted = false;

        // Redimensionar el gráfico
        Plotly.Plots.resize(this.graphDiv);

        // Reset the Plot
        this.quartileDataArray = []
        this.viewDefault = true;
        this.viewKmeans = false;
        this.viewSquare = false;
        this.viewDiagonal = false;
        this.showShapesKmeans = false;
        this.showShapesSquare = false;
        this.showAnnotationSquare = false;
        this.viewSelected = "Classification";

        let plot = this.graphDiv.data;
        if(plot && plot.length > 0) {
            const numTraces = plot.length;
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

                // Then modify
                const layout = {
                    shapes: false ? shapes : [],
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
                            size: 16,
                        },
                        itemdoubleclick: "toggle",
                    },
                    images: this.getImagePosition(this.optimalview),
                    showlegend: true,
                };

                this.layout = layout;

                // Update only the trace data, without changing the layout
                Plotly.update(this.graphDiv, newTraces, layout, 1);
            }

            // restarts the traces
            Plotly.restyle(this.graphDiv, { visible: visibleArray });
        }
    }

    async downloadChart(format) {
        try {
            const layout = this.graphDiv.layout;
            //layout.images[0].opacity = 0.5;
            Plotly.update(this.graphDiv, layout);

            if(format === 'png') {
                if (this.viewSquare || this.viewKmeans || this.viewDiagonal) {
                    await new Promise(resolve => setTimeout(resolve, 200));

                    const toDownloadDiv = this.todoDownload;
                    const table = this.benchmarkingTable;

                    const toolsCol = this.toolsCol;
                    toolsCol.classList.remove('responsive-table');

                    // Crear una fila en blanco temporalmente para evitar el movimiento de la ultima celda.
                    const tableBody = table.querySelector('tbody');
                    const blankRow = document.createElement('tr');
                    const numCols = tableBody.rows[0].cells.length;
                    for (let i = 0; i < numCols; i++) {
                        const newCell = document.createElement('td');
                        newCell.innerHTML = '&nbsp;'; // Añadir espacio en blanco
                        newCell.style.border = 'none'; // Quitar el borde
                        blankRow.appendChild(newCell);
                    }
                    tableBody.appendChild(blankRow);

                    const downloadCanvas = await html2canvas(toDownloadDiv, {
                        scrollX: 0,
                        scrollY: 0,
                        width: toDownloadDiv.offsetWidth,
                        height: toDownloadDiv.offsetHeight,
                        //scale: 2
                    });

                    // Eliminar la fila en blanco después de la captura
                    tableBody.removeChild(blankRow);
                    const downloadImage = downloadCanvas.toDataURL(`image/${format}`);
                    const link = document.createElement('a');
                    link.href = downloadImage;
                    link.download = `benchmarking_chart_${this.datasetId}.${format}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    toolsCol.classList.add('responsive-table');
                } else {
                    const toDownloadDiv = this.chartCapture;
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
                }
            } else if(format === 'pdf') {
                const pdf = new jsPDF();
                pdf.setFontSize(12);
                pdf.setFont(undefined, 'bold');
                pdf.text(`Benchmarking Results of ${this.datasetId} at ${this.formatDateString(this.datasetModDate)}`, 105, 10, null, null, 'center');

                // Get chart image as base64 data URI
                const chartImageURI = await Plotly.toImage(this.graphDiv, { format: 'png', width: 750, height: 600 });
                pdf.addImage(chartImageURI, 'PNG', 10, 20);

                if (this.viewSquare || this.viewKmeans || this.viewDiagonal) {
                    const columns = ["Participants", this.viewKmeans ? "Clusters" : "Quartile"];

                    const toolsCol = this.toolsCol;
                    toolsCol.classList.remove('responsive-table');

                    // Extract data from quartileDataArray
                    const rows = this.quartileDataArray.map(q => [q.tool_id, q.label]);
                    const quantileNumber = this.quartileDataArray.map(q => q.cuartil);
                    const markerColors = ['#D62728', '#FF7F0E', '#8C564B', '#E377C2', '#4981B6', '#BCBD22', '#9467BD', '#0C9E7B', '#7F7F7F', '#31B8BD', '#FB8072', '#62D353']

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
                            halign: 'left',
                        },
                        headStyles: {
                            fillColor: [108, 117, 125]
                        },
                        willDrawCell: function (data) {
                            if (data.row.section === 'body') {
                                // Check if the column header matches 'Quartile'
                                if (data.column.dataKey === 1) {
                                // Access the raw value of the cell
                                const rowIndex = data.row.index;
                                const quartileValue = quantileNumber[rowIndex];
                                // Set fill color based on quartile value
                                if (quartileValue === 1) {
                                    pdf.setFillColor(237, 248, 233)
                                } else if (quartileValue === 2) {
                                    pdf.setFillColor(186, 228, 179)
                                } else if (quartileValue === 3) {
                                    pdf.setFillColor(116, 196, 118)
                                } else if (quartileValue === 4) {
                                    pdf.setFillColor(35, 139, 69)
                                }
                                } else if (data.column.dataKey === 0) {
                                    // Draw colored "div" in Tool column
                                    const rowIndex = data.row.index;
                                    const color = markerColors[rowIndex % markerColors.length];
                                    pdf.setFillColor(color);

                                    // Dibuja el rectángulo coloreado
                                    pdf.rect(data.cell.x -2, data.cell.y, 10, data.cell.height, 'F');
                                    // Restaura el color de relleno original
                                    pdf.setFillColor(255, 255, 255);
                                }
                            }
                        },
                    });
                    toolsCol.classList.add('responsive-table');
                }

                // Save the PDF
                pdf.save(`benchmarking_chart_${this.datasetId}.${format}`);
            } else if(format === 'svg') {
                const options = { format, height: 700, width: 800 };
                Plotly.toImage(this.graphDiv, options).then((url) => {
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `benchmarking_chart_${this.datasetId}.${format}`;
                    link.click();
                })
                .catch((error) => {
                    console.error(`Error downloading graphic as ${format}`, error);
                });
            } else if(format === 'json') {
                const chartData = this.originalData // Obtener datos del gráfico
                const jsonData = JSON.stringify(chartData);
                const link = document.createElement('a');
                link.href = `data:text/json;charset=utf-8,${encodeURIComponent(jsonData)}`;
                link.download = `${this.datasetId}.json`;
                link.click();
            }

        } catch (error) {
            console.error(error);
        }
    }

    // Handle the click on the table row
    handleTableRowClick(index) {
        const traceIndex = index + 2; // Adjust the index
        this.toggleTraceVisibility(traceIndex);
        this.updatePlotOnSelection(traceIndex)
    }

    // Toggle trace visibility
    toggleTraceVisibility(traceIndex) {
        let graphData = this.graphDiv.data;
        let graphLayout = this.graphDiv.layout;

        if (graphData.length <= 5){
            return;
        }

        // Check the visibility state of the trace
        let isVisible = graphData[traceIndex].visible;
        if (isVisible === undefined) {
            isVisible = true;
        }

        // Count the number of currently visible traces
        let visibleCount = 0;
        graphData.forEach(trace => {
            if(trace.visible) {
                visibleCount++;
            }
        });

        // If there are only four visible traces and the trace being toggled is currently visible, return without changing its visibility
        if (visibleCount === 6 && isVisible !== 'legendonly') {
            return;
        }

        // Update the visibility state of the trace
        graphData[traceIndex].visible = isVisible === true ? 'legendonly' : true;

        // Update the chart with the new data
        Plotly.react(this.graphDiv, graphData, graphLayout);
    }

    setOptimalView() {
        let layout = {
            autosize: true,
            height: 600,
            xaxis: {
                range: [this.optimalXaxis[0], this.optimalXaxis[1]],
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
                    size: 16,
                },
                itemdoubleclick: "toggle",
            },
            images: this.getImagePosition(this.optimalview),
            showlegend: true,
        };

        if(this.layout.shapes) {
            layout.shapes = this.layout.shapes;
        }

        if(this.layout.annotations) {
            layout.annotations = this.layout.annotations;
        }

        this.layout = layout;

        Plotly.relayout(this.graphDiv, this.layout);
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
                    size: 16,
                },
                itemdoubleclick: "toggle",
            },
            images: this.getImagePosition(this.optimalview),
            showlegend: true,
        };

        this.optimal = "no";

        Plotly.relayout(this.graphDiv, layout);
    }

    setClassificationView(classificationType) {
        Plotly.redraw(this.graphDiv)
        if(classificationType == 'noClassification') {
            this.resetChart();
        } else if(classificationType == 'toggleQuartilesVisibility') {
            this.setQuartilesVisibility();
        } else if(classificationType == 'toggleDiagonalQuartile') {
            this.setDiagonalQuartile();
        } else {
            this.setKMeansVisivility();
        }
    }

    setQuartilesVisibility() {
        if (!this.optimalview){
            return;
        }

        let plot = this.graphDiv.data;

        if(plot && plot.length > 0) {
            const numTraces = plot.length;

            // Resize graph
            this.sorted = true;

            // Reset visibilities. Hide the Kmeans and Show the Square
            this.showShapesKmeans = false;
            this.viewDefault = false;
            this.viewKmeans = false;
            this.viewDiagonal = false;
            this.viewSquare = true;
            this.showShapesSquare = true;
            this.showAnnotationSquare = true;
            this.viewSelected = this.viewText.square;

            // Update visibility of Points
            this.dataPoints.forEach(array => { array.hidden = false; });

            // Calculate Pareto Frontier
            const updatedVisibleTools = this.dataPoints.filter(tool => !tool.hidden);
            const direction = this.formatOptimalDisplay(this.optimalview);
            const newParetoPoints = pf.getParetoFrontier(updatedVisibleTools, { optimize: direction });
            const newTraces = { x: [newParetoPoints.map(point => point[0])], y: [newParetoPoints.map(point => point[1])] };

            if(this.layout) {
                this.layout.annotation = this.getOptimizationArrow(this.optimalview);
            }

            const layout = {
                shapes: false ? shapes : [],
                annotations: this.getOptimizationArrow(this.optimalview),
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
                showlegend: true
            };

            const visibleArray = Array(numTraces).fill(true);
            this.showAdditionalTable = true;


            this.calculateQuartiles(this.xValues, this.yValues, this.allToolID);

            Plotly.update(this.graphDiv, newTraces, this.layout, 1);
            Plotly.update(this.graphDiv, { visible: visibleArray });
            this.updated();
        }
    }

    setDiagonalQuartile() {
        if (!this.optimalview){
            return;
        }

        let plot = this.graphDiv.data;

        if(plot && plot.length > 0) {
            const numTraces = plot.length;

            // Resize graph
            this.sorted = true;

            // Reset visibilities. Hide the Kmeans and Show the Square.
            this.viewDefault = false;
            this.viewDiagonal = true;
            this.viewSquare = false;
            this.viewKmeans = false;
            this.showShapesKmeans = false;
            this.showShapesSquare = false;
            this.showShapesDiagonal = true;
            this.viewSelected = this.viewText.diagonal;

            // Update visibility of Points
            this.dataPoints.forEach(array => { array.hidden = false; });

            // Calculate Pareto Frontier
            const updatedVisibleTools = this.dataPoints.filter(tool => !tool.hidden);
            const direction = this.formatOptimalDisplay(this.optimalview);
            const newParetoPoints = pf.getParetoFrontier(updatedVisibleTools, { optimize: direction });
            const newTraces = { x: [newParetoPoints.map(point => point[0])], y: [newParetoPoints.map(point => point[1])] };


            if(this.layout) {
                this.layout.shapes = false ? shapes : [];
            }

            const layout = {
                shapes: false ? shapes : [],
                annotations: this.getOptimizationArrow(this.optimalview),
                xaxis: {
                    range: [this.optimalXaxis[0], this.optimalXaxis[1]],
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
                    range: [this.optimalYaxis[0], this.optimalYaxis[1]],
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
                        size: 16,
                    },
                    itemdoubleclick: "toggle",
                },
                images: this.getImagePosition(this.optimalview),
                showlegend: true
            };

            const visibleArray = Array(numTraces).fill(true);

            this.showAdditionalTable = true;

            this.calculateDiagonalQuartiles(this.xValues, this.yValues);

            Plotly.update(this.graphDiv, newTraces, layout);
            Plotly.update(this.graphDiv, { visible: visibleArray });
            this.updated();
        }
    }

    setKMeansVisivility() {
        if (!this.optimalview){
            return;
        }

        let plot = this.graphDiv.data;

        if(plot && plot.length > 0) {
            const numTraces = plot.length;

            // Resize graph
            this.sorted = true;

            // Reset visibilities. Hide the Square and Show the Kmeans
            this.showShapesSquare = false;
            this.showAnnotationSquare = false;
            this.viewSquare = false;
            this.viewDiagonal = false;
            this.viewKmeans = true;
            this.viewDefault = false;
            this.showShapesKmeans = true;
            this.viewSelected = this.viewText.kmeans;

            // Update visibility of Points
            this.dataPoints.forEach(array => { array.hidden = false; });

            // Calculate Pareto Frontier
            const updatedVisibleTools = this.dataPoints.filter(tool => !tool.hidden);
            const direction = this.formatOptimalDisplay(this.optimalview);
            const newParetoPoints = pf.getParetoFrontier(updatedVisibleTools, { optimize: direction });
            const newTraces = { x: [newParetoPoints.map(point => point[0])], y: [newParetoPoints.map(point => point[1])] };

            // Update visibility of traces in legend
            const visibleArray = Array(numTraces).fill(true);
            const layout = {
                shapes: false ? this.shapes : [],
                annotations: this.getOptimizationArrow(this.optimalview)
            };

            // Create shape clustering
            let better = this.optimalview
            this.createShapeClustering(this.dataPoints, this.toolID, better, this.allToolID);

            // Plotly.update(this.graphDiv, newTraces, layout, 1);
            // Plotly.update(this.graphDiv, { visible: visibleArray });

            this.updated();
        }
    }

    // Get coordinates for line
    getDiagonalLine (scores, scoresCoords, quartile, better, maxX, maxY) {
        let target;
        for(let i = 0; i < scores.length; i++){
            if(scores[i] <= quartile){

                // When la longitud de las tools es menor de la esperada se ejecuta este condicional.
                if (i == 0){
                    i = 1;
                }

                target = [
                    [
                        scoresCoords[scores[i - 1]][0],
                        scoresCoords[scores[i - 1]][1]
                    ],[
                        scoresCoords[scores[i]][0],
                        scoresCoords[scores[i]][1]
                    ]
                ];
                break;
            }
        }

        let halfPoint = [(target[0][0] + target[1][0]) / 2, (target[0][1] + target[1][1]) / 2]

        // Draw the line depending on which is the optimal corner
        let xCoords;
        let yCoords;

        if (better == "bottom-right"){
            xCoords = [halfPoint[0] - 2 * maxX, halfPoint[0] + 2 * maxX];
            yCoords = [halfPoint[1] - 2 * maxY, halfPoint[1] + 2 * maxY];
        } else if (better == "top-right"){
            xCoords = [halfPoint[0] + 2 * maxX, halfPoint[0] - 2 * maxX];
            yCoords = [halfPoint[1] - 2 * maxY, halfPoint[1] + 2 * maxY];
        } else if (better == "top-left"){
            xCoords = [halfPoint[0] + 2 * maxX, halfPoint[0] - 2 * maxX];
            yCoords = [halfPoint[1] + 2 * maxY, halfPoint[1] - 2 * maxY];
        };

        return [xCoords, yCoords];
    }

    getCentroid(coord) {
        var center = coord.reduce(function (x,y) {
            return [x[0] + y[0]/coord.length, x[1] + y[1]/coord.length]
        }, [0,0])

        return center;
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

    formatDateString(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    // Image Position
    getImagePosition(optimization) {
        const ImagePositions = [];
        let positionX, positionY;

        // Posicion contraria
        switch (optimization) {
            case 'top-left':
                positionX = 1;
                positionY = .07;
                break;
            case 'top-right':
                positionX = .07;
                positionY = .05;
                break;
            case 'bottom-left':
                positionX = 1;
                positionY = .8;
                break;
            case 'bottom-right':
                positionX = .07;
                positionY = .8;
                break;
            default:
                positionX = .07;
                positionY = .05;
                break;
        }

        const imagesPosition = {
            x: positionX,
            y: positionY,
            sizex: .07,
            sizey: .18,
            source: this.imgLogo,
            xref: "paper",
            yref: "paper",
            xanchor: "right",
            yanchor: "bottom",
            opacity: isBSC() ? 0 : .7
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
                        <div class="btn-group btn-graphs" role="group" aria-label="">
                            <div class="dropdown classification-dropdown">
                                <button type="button" class="btn dropbtn first-btn">
                                    <span>${ this.viewSelected }</span>
                                    <div class="btn-icon-wrapper"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
                                    </div>
                                </button>
                                <div class="dropdown-content">
                                    <div class="${ this.viewDefault ? 'active disabled' : '' }"
                                        @click="${() => this.setClassificationView('noClassification') }">
                                        ${ this.viewText.noClassification }
                                    </div>
                                    ${ this.challengeParticipants.length > 1 ? html`
                                        <div class="${ this.viewSquare ? 'active disabled' : '' }"
                                            @click="${() => this.setClassificationView('toggleQuartilesVisibility') }">
                                             ${ this.viewText.square }
                                    </div>
                                    ` : '' }
                                    <div class="${ this.viewDiagonal ? 'active disabled' : '' }"
                                        @click="${() => this.setClassificationView('toggleDiagonalQuartile') }">
                                        ${ this.viewText.diagonal }
                                    </div>
                                    <div class="${ this.viewKmeans ? 'active disabled' : '' }"
                                        @click="${() => this.setClassificationView('toggleKmeansVisibility') }">
                                        ${ this.viewText.kmeans }
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
                                <button type="button" class="btn dropbtn download-btn">
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
                    <div class=${ this.sorted ? 'col-8': 'col-12' } id="chartCapture">
                        <div class="chart" id="scatter-chart"></div>
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
                    ${ this.showAdditionalTable && this.sorted ? html`
                        <div class="col-4">
                            <div class="tools-col responsive-table" id="toolsCol">
                                <table class="tools-table responsive-table" id="benchmarkingTable">
                                    <thead>
                                        <tr>
                                            <th class="tools-th">Participants</th>
                                            <th class="classify-th">
                                                <span>${ this.viewKmeans ? 'Clusters' : 'Quartile' }</span>
                                                <ui-tooltip
                                                    for="anchor"
                                                    icon="info"
                                                    textTitle="The Square quartile label"
                                                    textBody="Quartiles 2 and 3 are 'Mid (M)', representing average rankings, while 'Top (T)' 
                                                        denotes quartiles above average and 'Bottom (B)' those below, offering clarity in ranking.">
                                                </ui-tooltip>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${ this.showAdditionalTable ? html`
                                            ${ this.quartileDataArray.map((quartile, index) => html`
                                                <tr>
                                                    <td class="toolColumn" @click="${() => handleTableRowClick(index) }">
                                                        <div class="color-box" style="background-color: ${ this.markerColors[index % this.markerColors.length] }"></div>
                                                        <span>${ quartile.tool_id }</span>
                                                    </td>
                                                    <td class="${'quartil-' + quartile.cuartil}">${ quartile.label }</td>
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

window.customElements.define('scatter-plot', ScatterPlot);