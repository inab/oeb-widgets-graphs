import { html, LitElement } from 'lit';
import Plotly from 'plotly.js-dist'
import { plotlyStyles } from "./plotly-styles.js";
import { graphStyles } from './graph-styles.js';
import { oebIcon, isBSC } from './utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import * as statistics from 'simple-statistics'
import regression from 'regression';

const GRAPH_CONFIG = {
  displayModeBar: false,
  responsive: true,
  hovermode: false
};

export class LinePlot extends LitElement {
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
    showQuartileTable: false,
    showAverageTable: false,
    showInterquartileTable: false,
    showTrend: false,
    viewSelected: "No Classification",
    mode: "linesmarkers",
  };

  constructor() {
    super();

    this.imgLogo = oebIcon;
    this.layout = {};
    this.originalData = '';
    this.datasetModDate = '';
    this.viewSelected = "Default View";
    this.viewSelectedKey = "default";
    this.mode = "linesmarkers";
    this.threshold = [];
    this.quartileData = [];
    this.averageData = [];
    this.interquartileData = [];
    this.modeText = {
      lines: "lines",
      markers: "markers",
      linesmarkers: "lines+markers"
    };
    this.originalTraces = [];
    this.viewText = {
      default: "Default View",
      quartiles: "Quartiles",
      average: "Average",
      interquartile: "Interquartile range",
      trend: "Trend"
    };
    this.viewTooltipTitle = {
      quartiles: "The Square quartile label",
      average: "The Average Value Indicator",
      interquartile: "The Interquartile Range (IQR)",
    };
    this.viewTooltipBody = {
      quartiles: "By default, the highest values will be displayed in the first quartile. Inversely if it is specified.",
      average: "The average represents the central tendency, calculated by summing all values and dividing by the total count.",
      interquartile: "The IQR highlights the spread of the middle 50% of data, calculated as the difference between the third and first quartiles.",
    };
    this.markerColors = ['#D62728', '#FF7F0E', '#8C564B', '#E377C2', '#4981B6', '#BCBD22', '#9467BD', '#0C9E7B', '#7F7F7F', '#31B8BD', '#FB8072', '#62D353'];
    this.layout = {
      title: '',
      autosize: true,
      height: 800,
      margin: { l: 50, r: 50, t: 100, b: 110, pad: 4 },
      images: this.getImagePosition(),
      xaxis: {
        showline: true,
        showgrid: true,
        showticklabels: true,
        linecolor: 'rgb(204,204,204)',
        tickmode: 'linear',
        ticks: 'outside',
        dtick: 0.5,
        tickcolor: 'rgb(204,204,204)',
        tickfont: {
          family: 'Arial',
          size: 12,
          color: 'rgb(82, 82, 82)'
        }
      },
      yaxis: {
        showgrid: true,
        zeroline: true,
        showline: true,
        dtick: 1,
        showticklabels: true,
      }
    };
  }
  
  attributeChangedCallback(name, oldVal, newVal) {
    this.data = JSON.parse(newVal);
    super.attributeChangedCallback(name, oldVal, JSON.parse(newVal));
  }

  firstUpdated() {
    const data = this.data.inline_data;
    this.datasetModDate = this.data.dates.modification;
    this.originalData = this.data;
    
    this.x = data.challenge_participants.map(entry => entry.name);
    this.datasetId = this.data._id;

    this.annotations = [];
    this.dataTraces = data.challenge_participants.map((participant) => {
      this.calculateAUC(participant.x_value, participant.y_value)
      this.annotations.push({
        auc: this.calculateAUC(participant.x_value, participant.y_value),
        name: participant.name
      });
      return {
        x: participant.x_value,
        y: participant.y_value,
        name: participant.name,
        type: 'scatter',
        mode: 'lines+markers',
        line: {
          shape: 'spline',
          color: this.markerColors[data.challenge_participants.indexOf(participant)],
          width: 2
        },
        error_y: {
          type: 'data',
          array: participant.t_error,
          visible: true,
          color: 'rgba(0,0,0,0.5)',
          thickness: 1.5,
          width: 3
        },
        marker: { color: 'rgba(150,0,0,0.8)', symbol: 'square', size: 5 }
      }
    });

    const randomLine = {
      x: [0,1],
      y: [0,1],
      mode: 'lines',
      name: 'Clasificador Aleatorio',
      line: {color: 'rgba(0,0,0,0.3)', dash: 'dot', width: 2}
    };

    this.dataTraces.push(randomLine);

    this.originalTraces = [...this.dataTraces];

    this.layout = {
      title: '',
      autosize: true,
      height: 800,
      margin: { l: 50, r: 50, t: 100, b: 110, pad: 4 },
      images: this.getImagePosition(),
      xaxis: {
        title: {
          text: data.visualization.x_axis
        },
        showline: true,
        showgrid: true,
        showticklabels: true,
        linecolor: 'rgb(204,204,204)',
        tickmode: 'linear',
        ticks: 'outside',
        tickcolor: 'rgb(204,204,204)',
        tickfont: {
          family: 'Arial',
          size: 12,
          color: 'rgb(82, 82, 82)'
        },
        dtick: 0.5,
        gridcolor: 'rgba(200,200,200,0.3)',
        zerolinecolor: 'rgba(0,0,0,0.2)'
      },
      yaxis: {
        title: {
          text: data.visualization.y_axis
        },
        showgrid: true,
        zeroline: true,
        showline: true,
        showticklabels: true,
        dtick: 1,
        gridcolor: 'rgba(200,200,200,0.3)',
        zerolinecolor: 'rgba(0,0,0,0.2)'
      },
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
      showlegend: true,
    };

    const annotations = this.annotations.map((annotation, index) => ({
      x: 0,
      y: 1 - (index * 0.05),
      xref: 'paper',
      yref: 'paper',
      text: `AUC(${annotation.name}) ≈ ${annotation.auc.toFixed(2)}`,
      showarrow: false,
      font: { size: 14 }
    }));

    this.layout.annotations = annotations;
  }

  updated() {
    this.graphDiv = this.shadowRoot.querySelector('#line-chart');
    this.todoDownload = this.shadowRoot.querySelector('#todownload');
    this.chartCapture = this.shadowRoot.querySelector('#chartCapture');
    this.tableColumn = this.shadowRoot.querySelector('#table-column');
    this.benchmarkingTable = this.shadowRoot.querySelector('#benchmarkingTable');
    this.myPlot = Plotly.newPlot(this.graphDiv, [], this.layout, { displayModeBar: false, responsive: true, hovermode: false });
    this.renderChart();
  }

  calculateAUC(fpr, tpr) {
    let auc = 0;
    for (let i = 0; i < fpr.length - 1; i++) {
      const width = fpr[i+1] - fpr[i]; 
      const height = (tpr[i] + tpr[i+1]) / 2;
      auc += width * height;
    }
    return auc;
  }

  formatDateString(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
  }

  renderChart(traces) {
    if (this.data && !traces) {
      this.threshold = this.data.inline_data.thresholds;
      Plotly.newPlot(this.graphDiv, this.dataTraces, this.layout, GRAPH_CONFIG);
    } else if (traces && traces.length > 0) {
      this.dataTraces = traces;
      Plotly.newPlot(this.graphDiv, traces, this.layout, GRAPH_CONFIG);
    }
  }

  repaintGraph(dataMode) {
    let traces = dataMode;
    let layout = this.layout;

    var referenceLine = {
      x: [0, 1],
      y: [0, 1],
      mode: 'lines',
      name: 'Random Classifier',
      line: { dash: 'dash', color: 'red' }
    };
    Plotly.react(this.graphDiv, [traces, referenceLine], this.layout);
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

  handleChangeMode(mode) {
    this.mode = mode;
    let dataMode = this.dataTraces;
    if(mode === 'lines') {
      dataMode.forEach((trace) => {
        trace.mode = 'lines';
      });
    } else if(mode === 'markers') {
      dataMode.forEach((trace) => {
        trace.mode = 'markers';
      });
    } else if(mode === 'linesmarkers') {
      dataMode.forEach((trace) => {
        trace.mode = 'lines+markers';
      });
    }

    this.repaintGraph(dataMode);
  }

  resetQuartileTable() {
    this.showAdditionalTable = false;
    this.showQuartileTable = false;
    this.showAverageTable = false;
    this.showInterquartileTable = false;
    this.quartileData = [];
    this.averageData = [];
    this.interquartileData = [];
  }

  async setClassificationView(view) {
    this.resetQuartileTable();
    if (view === 'default') {
      let newTraces = [...this.originalTraces];
      this.viewSelected = "Default View";
      this.viewSelectedKey = "default";
      this.sorted = false;
      this.quartileData = [];
      this.tracesTable = [];
      this.layout = {
        title: '',
        autosize: true,
        height: 800,
        margin: { l: 50, r: 50, t: 100, b: 110, pad: 4 },
        images: this.getImagePosition(),
        xaxis: {
          title: {
            text: this.data.inline_data.visualization.x_axis
          },
          showline: true,
          showgrid: true,
          showticklabels: true,
          linecolor: 'rgb(204,204,204)',
          tickmode: 'linear',
          ticks: 'outside',
          tickcolor: 'rgb(204,204,204)',
          tickfont: {
            family: 'Arial',
            size: 12,
            color: 'rgb(82, 82, 82)'
          },
          dtick: 0.5,
        },
        yaxis: {
          title: {
            text: this.data.inline_data.visualization.y_axis
          },
          showgrid: true,
          zeroline: true,
          showline: true,
          showticklabels: true,
          dtick: 1
        },
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
        showlegend: true,
      };
      this.renderChart(newTraces);
    } else if (view === 'quartiles') {
      let newTraces = [...this.originalTraces];
      this.viewSelected = "Quartiles";
      this.viewSelectedKey = "quartiles";
      this.sorted = true;
      this.showAdditionalTable = true;
      this.showQuartileTable = true;
      this.tracesTable = newTraces;
      newTraces.splice(newTraces.length - 1, 1);
      this.quartileData = this.calculateQuartiles(newTraces);
      this.quartileData.forEach((quartile, index) => {
        quartile.quartileName = newTraces[index].name;
        quartile.quartile = this.quartileData[index].quartile;
        quartile.label = this.quartileData[index].label;
        quartile.bgColor = this.getQuartileBgColor(quartile.quartile).bgColor;
      });

      Plotly.Plots.resize(this.graphDiv);
      await new Promise(resolve => setTimeout(resolve, 100));

      this.addLinesBetweenQuartiles();
      this.addQuartileLabels();
      this.layout.height = 800;
      this.renderChart(newTraces);
    } else if (view === 'average') {
      let newTraces = [...this.originalTraces];
      newTraces.splice(newTraces.length - 1, 1);
      this.viewSelected = "Average";
      this.viewSelectedKey = "average";
      this.showAdditionalTable = true;
      this.showAverageTable = true;
      this.sorted = true;
      this.layout = {
        title: '',
        autosize: true,
        height: 800,
        margin: { l: 50, r: 50, t: 100, b: 110, pad: 4 },
        images: this.getImagePosition(),
        xaxis: {
          title: {
            text: this.data.inline_data.visualization.x_axis
          },
          showline: true,
          showgrid: true,
          showticklabels: true,
          linecolor: 'rgb(204,204,204)',
          tickmode: 'linear',
          ticks: 'outside',
          tickcolor: 'rgb(204,204,204)',
          tickfont: {
            family: 'Arial',
            size: 12,
            color: 'rgb(82, 82, 82)'
          },
          dtick: 0.5,
        },
        yaxis: {
          title: {
            text: this.data.inline_data.visualization.y_axis
          },
          showgrid: true,
          zeroline: true,
          showline: true,
          showticklabels: true,
          dtick: 1
        },
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
        showlegend: true,
      };
      this.averageData = this.calculateAverage(newTraces);
      this.renderChart(newTraces);
    } else if (view === 'interquartile') {
      let newTraces = [...this.originalTraces];
      this.viewSelected = "Interquartile range";
      this.viewSelectedKey = "interquartile";
      this.sorted = true;
      this.showAdditionalTable = true;
      this.showInterquartileTable = true;
      this.interquartileData = this.calculateIQR(newTraces);
      this.addLinesBetweenQuartiles();
      this.addQuartileLabels();
      this.renderChart(newTraces);
    } else if (view === 'trend') {
      let newTraces = [...this.originalTraces];
      this.viewSelected = "Trend";
      this.viewSelectedKey = "trend";
      this.showTrend = true;
      this.sorted = false;
      this.tracesTable = newTraces;
      let regressionTraces = this.calculateTrend(newTraces);
      let trace = {
        name: "General Trendline",
        x: regressionTraces.regressionX,
        y: regressionTraces.regressionY,
        type: 'scatter',
        mode: 'linesmarkers',
        line: {
          color: '#1A1A19',
          width: 1,
          dash: "solid",
        }
      }

      newTraces = [...newTraces, trace];
      this.layout = {
        title: '',
        autosize: true,
        height: 800,
        margin: { l: 50, r: 50, t: 100, b: 110, pad: 4 },
        images: this.getImagePosition(),
        xaxis: {
          title: {
            text: this.data.inline_data.visualization.x_axis
          },
          showline: true,
          showgrid: true,
          showticklabels: true,
          linecolor: 'rgb(204,204,204)',
          tickmode: 'linear',
          ticks: 'outside',
          tickcolor: 'rgb(204,204,204)',
          tickfont: {
            family: 'Arial',
            size: 12,
            color: 'rgb(82, 82, 82)'
          },
          dtick: 0.5,
        },
        yaxis: {
          title: {
            text: this.data.inline_data.visualization.y_axis
          },
          showgrid: true,
          zeroline: true,
          showline: true,
          showticklabels: true,
          dtick: 1
        },
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
        showlegend: true,
      };
      this.renderChart(newTraces);
    }
  }

  addLinesBetweenQuartiles() {
    const layout = this.graphDiv.layout;
    layout.shapes = layout.shapes || [];

    const tools = Object.keys(this.quartileData);
    for (let i = 1; i < tools.length; i++) {
      const currentTool = this.quartileData[tools[i]];
      const previousTool = this.quartileData[tools[i - 1]];

      if (currentTool.quartile !== previousTool.quartile) {
        const linePosition = (i + i - 1) / 2;

        layout.shapes.push({
          type: 'line',
          xref: 'x',
          yref: 'paper',
          x0: linePosition,
          x1: linePosition,
          y0: 0,
          y1: 0,
          line: {
            color: 'rgba(11, 87, 159, 0.5)',
            width: 2,
            dash: 'dashdot'
          }
        });
      }
    }

    Plotly.relayout(this.graphDiv, { shapes: layout.shapes });
  }

  addQuartileLabels() {
    const layout = this.graphDiv.layout;
    layout.annotations = layout.annotations || [];

    const tools = Object.keys(this.quartileData);
    const quartileCounts = {};

    tools.forEach(tool => {
      const quartile = this.quartileData[tool].quartile;
      quartileCounts[quartile] = (quartileCounts[quartile] || 0) + 1;
    });

    const addedLabelPositions = new Set();

    tools.forEach(tool => {
      const quartile = this.quartileData[tool].quartile;
      let labelPosition;
      if (quartileCounts[quartile] === 1) {
        labelPosition = tools.indexOf(tool);
      } else {
        const positions = tools.reduce((acc, curr, index) => {
        if (this.quartileData[curr].quartile === quartile) {
            acc.push(index);
        }
        return acc;
        }, []);

        const sum = positions.reduce((sum, pos) => sum + pos, 0);
        labelPosition = sum / positions.length;
      }

      if (!addedLabelPositions.has(labelPosition)) {
        layout.annotations.push({
            x: labelPosition,
            y: 1.03,
            xref: 'x',
            yref: 'paper',
            text: `Q${quartile}`,
            showarrow: false,
            font: {
            size: 16,
            color: 'rgba(11, 87, 159, 0.5)'
            }
        });

        addedLabelPositions.add(labelPosition);
      }
    });
    this.layout = layout;

    Plotly.relayout(this.graphDiv, { annotations: layout.annotations });
  }

  calculateTrend(data) {
    const points = data.flatMap(dataset => dataset.x.map((x, i) => [x, dataset.y[i]]));
    const result = regression.linear(points);
    const regressionLine = result.points;
    const regressionX = regressionLine.map(point => point[0]);
    const regressionY = regressionLine.map(point => point[1]);
    return {
      regressionX,
      regressionY
    }
  }

  calculateIQR(data) {
    const allX = data.map((trace) => trace.x).flat();
    const allY = data.map((trace) => trace.y).flat();
  
    const sortedX = allX.sort((a, b) => a - b);
    const sortedY = allY.sort((a, b) => a - b);
  
    const Q1_x = this.percentile(sortedX, 25);
    const Q2_x = this.percentile(sortedX, 50);
    const Q3_x = this.percentile(sortedX, 75);
  
    const Q1_y = this.percentile(sortedY, 25);
    const Q2_y = this.percentile(sortedY, 50);
    const Q3_y = this.percentile(sortedY, 75);
  
    const IQR_x = (Q3_x - Q1_x).toFixed(2);
    const IQR_y = (Q3_y - Q1_y).toFixed(2);

    return {
      IQR_x: { value: parseFloat(IQR_x).toFixed(2), color: this.getInterquartileBgColor(parseFloat(IQR_x), Q1_x, Q2_x, Q3_x) },
      IQR_y: { value: parseFloat(IQR_y).toFixed(2), color: this.getInterquartileBgColor(parseFloat(IQR_y), Q1_y, Q2_y, Q3_y) },
      Q1_x: { value: parseFloat(Q1_x).toFixed(2), color: this.getInterquartileBgColor(parseFloat(Q1_x), Q1_x, Q2_x, Q3_x) },
      Q2_x: { value: parseFloat(Q2_x).toFixed(2), color: this.getInterquartileBgColor(parseFloat(Q2_x), Q1_x, Q2_x, Q3_x) },
      Q3_x: { value: parseFloat(Q3_x).toFixed(2), color: this.getInterquartileBgColor(parseFloat(Q3_x), Q1_x, Q2_x, Q3_x) },
      Q1_y: { value: parseFloat(Q1_y).toFixed(2), color: this.getInterquartileBgColor(parseFloat(Q1_y), Q1_y, Q2_y, Q3_y) },
      Q2_y: { value: parseFloat(Q2_y).toFixed(2), color: this.getInterquartileBgColor(parseFloat(Q2_y), Q1_y, Q2_y, Q3_y) },
      Q3_y: { value: parseFloat(Q3_y).toFixed(2), color: this.getInterquartileBgColor(parseFloat(Q3_y), Q1_y, Q2_y, Q3_y) },
    };
  }

  getInterquartileBgColor(value, Q1, Q2, Q3) {
    if (value < Q1) {
      return {
        category: 'Low (below Q1)',
        bgColor: '#D37676'
      };
    } else if (value >= Q1 && value <= Q3) {
      return {
        category: 'Medium (between Q1 and Q3)',
        bgColor: '#FAEDCE'
      };
    } else {
      return {
        category: 'High (above Q3)',
        bgColor: '#A5DD9B'
      };
    }
  }

  getQuartileBgColor(quartile) {
    if(quartile == 1) {
      return { bgColor: 'rgb(237, 248, 233)' };
    } else if(quartile == 2) {
      return { bgColor: 'rgb(186, 228, 179)' };
    } else if(quartile == 3) {
      return { bgColor: 'rgb(116, 196, 118)' };
    } else if(quartile == 4) {
      return { bgColor: 'rgb(35, 139, 69)' };
    }
  }

  calculateQuartilesSteps(data) {
    data.sort((a, b) => a - b); // Sort the data
    const flattenedData = data.flat();
    flattenedData.sort((a, b) => a - b);

    const q1 = this.percentile(flattenedData, 25);
    const q2 = this.percentile(flattenedData, 50); // Median
    const q3 = this.percentile(flattenedData, 75);

    return { Q1: q1, Q2: q2, Q3: q3 };
  }

  percentile(data, p) {
    const index = (p / 100) * (data.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    return data[lower] * (1 - weight) + data[upper] * weight;
  }

  calculateQuartiles(data) {
    let quartileDataX = data.map((trace) => trace.x);
    let quartileDataY = data.map((trace) => trace.y);

    const quartilesX = this.calculateQuartilesSteps(quartileDataX);
    const quartilesY = this.calculateQuartilesSteps(quartileDataY);
    const results = [];

    for (let i = 0; i < quartileDataX.length; i++) {
      const x = quartileDataX[i];
      const y = quartileDataY[i];
      const quartileName = data[i].name;

      let quartile = 0;
      let label = '';

      if (x[i] >= quartilesX.Q2 && y[i] <= quartilesY.Q2) {
        quartile = 1;
        label = "Top";
      } else if (x[i] >= quartilesX.Q2 && y[i] > quartilesY.Q2) {
        quartile = 3;
        label = "Interquartile";
      } else if (x[i] < quartilesX.Q2 && y[i] > quartilesY.Q2) {
        quartile = 4;
        label = "Bottom";
      } else if (x[i] < quartilesX.Q2 && y[i] <= quartilesY.Q2) {
        quartile = 2;
        label = "Interquartile";
      }
      results.push({ x, y, quartileName, quartile, label });
    }

    return results;
  }

  calculateAverage(data) {
    let averageDataX = data.map((trace) => trace.x);
    let averageDataY = data.map((trace) => trace.y);

    const averageX = statistics.mean(averageDataX);
    const averageY = statistics.mean(averageDataY);

    const results = [];

    for (let i = 0; i < averageDataX.length; i++) {
      const x = averageDataX[i];
      const y = averageDataY[i];
      const quartileName = data[i].name;

      let category = '';
      let bgColor = '';

      // Clasificación basada en el promedio
      if (x >= averageX && y >= averageY) {
        category = 'High performance';
        bgColor = '#A5DD9B';
      } else if (x < averageX && y < averageY) {
        category = 'Low performance';
        bgColor = '#D37676';
      } else {
        category = 'Medium performance';
        bgColor = '#FAEDCE';
      }
      results.push({
        x,
        y,
        quartileName,
        bgColor,
        category,
      });
    }

    return results
  }

  async downloadChart(format) {
    try {
      const layout = this.graphDiv.layout;
      layout.images[0].opacity = 0.5;
      Plotly.relayout(this.graphDiv, layout);

      if (format === 'pdf') {
        const pdf = new jsPDF();

        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text(`Benchmarking Results of ${this.datasetId} at ${this.formatDateString(this.datasetModDate)}`, 105, 10, null, null, 'center');

        if (this.sorted) {
            // Agregar un pequeño retraso para asegurarse de que los cambios se hayan renderizado
            await new Promise(resolve => setTimeout(resolve, 200));

            let toDownloadDiv = this.todoDownload;
            toDownloadDiv.style.width = '100%';
            toDownloadDiv.style.display = 'block';
            let chartCapture = this.chartCapture;
            chartCapture.classList.add('col-12');
            chartCapture.classList.remove('col-8');
            this.graphDiv.style.display = 'flex';
            this.graphDiv.style.justifyContent = 'center';
            let tableColumn = this.tableColumn;
            tableColumn.classList.add('col-12');
            tableColumn.classList.remove('col-4');
            tableColumn.style.width = '100%';
            tableColumn.style.display = 'flex';
            tableColumn.style.justifyContent = 'center';

            const table = this.benchmarkingTable;
            table.style.width = 'auto';
            table.style.minWidth = '500px';

            // Create empty row temporarily
            const tableBody = table.querySelector('tbody');
            const blankRow = document.createElement('tr');
            const numCols = tableBody.rows[0].cells.length;
            for (let i = 0; i < numCols; i++) {
                const newCell = document.createElement('td');
                newCell.innerHTML = '&nbsp;';
                newCell.style.border = 'none';
                blankRow.appendChild(newCell);
            }

            tableBody.appendChild(blankRow);
            const downloadCanvas = await html2canvas(toDownloadDiv, {
                scrollX: 0,
                scrollY: 0,
                width: toDownloadDiv.offsetWidth,
                height: toDownloadDiv.offsetHeight,
            });

            // Delete white space line
            tableBody.removeChild(blankRow);

            const downloadImage = downloadCanvas.toDataURL(`image/${format}`);

            // Get the width and height of the image in pixels
            const imgWidth = downloadCanvas.width;
            const imgHeight = downloadCanvas.height;

            // Get the size of the PDF page in mm
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Calculate the scaling factor to fit the image within the page
            const scaleX = pageWidth / imgWidth;
            const scaleY = pageHeight / imgHeight;
            let scale = Math.min(scaleX, scaleY);

            // Calculate the new width and height of the image in mm
            const scaledWidth = imgWidth * scale;
            const scaledHeight = imgHeight * scale;

            // Center the image on the page
            const xOffset = ((pageWidth - scaledWidth) / 2)>0 ? (pageWidth - scaledWidth) / 2 : 10; // Adjust this value to position the image horizontally as needed
    
            // Adjust this value to position the image vertically as needed
            const yOffset = 20;

            pdf.addImage(downloadImage, 'PNG', xOffset, yOffset, scaledWidth - 20 , scaledHeight);

            toDownloadDiv.style.display = 'flex';
            chartCapture.classList.remove('col-12');
            chartCapture.classList.add('col-8');
            chartCapture.style.width =  null;
            this.graphDiv.style.display = 'flex';
            this.graphDiv.style.justifyContent = 'center';
            tableColumn.style.width = null;
            tableColumn.style.display = 'block';
            tableColumn.classList.remove('col-12');
            tableColumn.classList.add('col-4');
            tableColumn.style.width = null;
            tableColumn.style.display = 'block';
            table.style.width = '100%';
            table.style.minWidth = '100%';

            // Save the PDF
            pdf.save(`benchmarking_chart__performance_${this.datasetId}.${format}`);
        } else {
            // Get chart image as base64 data URI
            const chartImageURI = await Plotly.toImage(this.graphDiv, { format: 'png', width: 750, height: 600 });

            // Adding image to pdf
            pdf.addImage(chartImageURI, 'PNG', 10, 20);

            // Save the PDF
            pdf.save(`benchmarking_chart_${this.datasetId}.${format}`);
        }
      } else if (format === 'svg') {
        Plotly.downloadImage(this.graphDiv, { format: 'svg', filename: `benchmarking_chart_${this.datasetId}` });
      } else if (format === 'png') {
          if(this.sorted) {
            await new Promise(resolve => setTimeout(resolve, 200));

            const toDownloadDiv = this.todoDownload;
            toDownloadDiv.style.width = '100%';
            toDownloadDiv.style.display = 'block';

            let chartCapture = this.chartCapture;
            chartCapture.classList.remove('col-8');
            chartCapture.classList.add('col-12');
            chartCapture.style.width = '100%';
            chartCapture.style.display = 'flex';
            chartCapture.style.justifyContent = 'center';

            let tableColumn = this.tableColumn;
            tableColumn.classList.add('col-12');
            tableColumn.classList.remove('col-4');
            tableColumn.style.width = '100%';
            tableColumn.style.display = 'flex';
            tableColumn.style.justifyContent = 'center';

            const table = this.benchmarkingTable;
            table.style.width = 'auto';
            table.style.minWidth = '400px';

            // Create empty row temporarily
            const tableBody = table.querySelector('tbody');
            const blankRow = document.createElement('tr');
            const numCols = tableBody.rows[0].cells.length;
            for (let i = 0; i < numCols; i++) {
                const newCell = document.createElement('td');
                newCell.innerHTML = '&nbsp;';
                newCell.style.border = 'none';
                blankRow.appendChild(newCell);
            }
            tableBody.appendChild(blankRow);

            const downloadCanvas = await html2canvas(toDownloadDiv, {
                scrollX: 0,
                scrollY: 0,
                width: toDownloadDiv.offsetWidth,
                height: toDownloadDiv.offsetHeight
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

            toDownloadDiv.style.display = 'flex';
            chartCapture.classList.remove('col-12');
            chartCapture.classList.add('col-8');
            chartCapture.style.width = null;
            chartCapture.style.display = 'block';
            chartCapture.style.justifyContent = 'left';
            tableColumn.classList.remove('col-12');
            tableColumn.classList.add('col-4');
            tableColumn.style.width = null;
            tableColumn.style.display = 'block';
            table.style.width = '100%';
            table.style.minWidth = '100%';
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
          await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return html`
      <div class="line-plot oeb-graph">
        <div class="graph-row" id="graph-filters">
          <div class="col-8">
            <div class="btn-group btn-graphs" role="group" aria-label="Basic example">
              <div class="dropdown classification-dropdown">
                <button type="button" class="btn dropbtn first-btn">
                  <span>${ this.viewSelected }</span>
                  <div class="btn-icon-wrapper"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg></div>
                </button>
                <div class="dropdown-content">
                <div class="${ (this.viewSelected == 'Default View') ? 'active disabled' : '' }"
                      @click="${() => this.setClassificationView('default') }">
                      ${ this.viewText.default }
                  </div>
                  <div class="${ (this.viewSelected == 'Quartiles') ? 'active disabled' : '' }"
                      @click="${() => this.setClassificationView('quartiles') }">
                      ${ this.viewText.quartiles }
                  </div>
                  <div class="${ (this.viewSelected == 'Average') ? 'active disabled' : '' }"
                      @click="${() => this.setClassificationView('average') }">
                        ${ this.viewText.average }
                  </div>
                  <div class="${ (this.viewSelected == 'Interquartile range') ? 'active disabled' : '' }"
                      @click="${() => this.setClassificationView('interquartile') }">
                        ${ this.viewText.interquartile }
                  </div>
                  <div class="${ (this.viewSelected == 'Trend') ? 'active disabled' : '' }"
                      @click="${() => this.setClassificationView('trend') }">
                        ${ this.viewText.trend }
                  </div>
                </div>
              </div>
              <div class="dropdown orientation-dropdown">
                <button type="button" class="btn btn-xl btn-center dropbtn mode">
                  Mode: <span> ${ (this.mode=='linesmarkers')?"Lines & Makers" : this.mode }</span>
                  <div class="btn-icon-wrapper"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg></div>
                </button>
                <div class="dropdown-content">
                  <div class="mode ${ (this.mode == 'linesmarkers') ? 'active disabled' : '' }"
                    @click="${() => this.handleChangeMode('linesmarkers') }">
                    ${ this.modeText.lines }
                  </div>
                  <div class="mode ${ (this.mode == 'lines') ? 'active disabled' : '' }"
                    @click="${() => this.handleChangeMode('lines') }">
                    ${ this.modeText.lines }
                  </div>
                  <div class="mode ${ (this.mode == 'markers') ? 'active disabled' : '' }"
                    @click="${() => this.handleChangeMode('markers') }">
                    ${ this.modeText.markers }
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
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="graph-row" id="todownload">
          <div class=${ this.sorted ? 'col-8': 'col-12' } id="chartCapture">
            <div class="chart" id="line-chart"></div>
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
            <div class="col-4" id="table-column">
                <div class="tools-col">
                    <table class="tools-table" id="benchmarkingTable">
                        <thead>
                            <tr>
                                <th class="tools-th">Participants</th>
                                <th class="classify-th">
                                    ${ this.viewSelected == 'Quartiles'
                                      ? 'Quartile'
                                      : this.viewSelected == 'Average'
                                      ? 'Average'
                                      : this.viewSelected == 'Interquartile range'
                                      ? 'Interquartile range'
                                      : this.viewSelected == 'Trend'
                                      ? 'Trend'
                                      : ''}

                                    <ui-tooltip 
                                        for="anchor"
                                        icon="info"
                                        .textTitle=${this.viewTooltipTitle[this.viewSelectedKey]}
                                        .textBody=${this.viewTooltipBody[this.viewSelectedKey]}>
                                    </ui-tooltip>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ this.showQuartileTable ? html`
                                ${ this.quartileData.map(quartile => html`
                                    <tr>
                                        <td>${ quartile.quartileName }</td>
                                        <td style="background-color: ${ quartile.bgColor }">${ quartile.label }</td>
                                    </tr>
                                `) }
                            ` : '' }
                            ${ this.showAverageTable ? html`
                                ${ this.averageData.map(quartile => html`
                                    <tr>
                                        <td>${ quartile.quartileName }</td>
                                        <td style="background-color: ${ quartile.bgColor }">${ quartile.category }</td>
                                    </tr>
                                `) }
                            ` : '' }
                            ${ this.showInterquartileTable ? html`
                                ${ Object.entries(this.interquartileData).map(([key,quarteline]) => html`
                                    <tr>
                                        <td>${ key }</td>
                                        <td style="background-color: ${ quarteline.color.bgColor }">${ quarteline.value }</td>
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

window.customElements.define('line-plot',LinePlot);