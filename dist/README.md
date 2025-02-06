<img src="https://github.com/inab/oeb-widgets-graphs/blob/b67955da608e66e105fcef54b7da4d2818f18d69/docs/assets/image/opeb_logo.gif?raw=true" width="200"
style="display: block; margin: 0 auto"/>

## OEB WIDGETS GRAPHS

### A charts collection based on [OpenEBench](https://openebench.bsc.es/) Application


![](https://raw.githubusercontent.com/inab/oeb-widgets-graphs/1c1a2f2025bdc0f0bb545e657408bc4e1c749e6c/docs/assets/videos/scatter-plot.gif?raw=true)

[![npm](https://img.shields.io/npm/v/@inb/oeb-widgets-graphs)](https://www.npmjs.com/package/@inb/oeb-widgets-graphs) 
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/inab/oeb-widgets-graphs)
![NPM License](https://img.shields.io/npm/l/%40inb%2Foeb-widgets-graphs)


## Documentation 

####  :point_right: You can see the complete documentation [here](https://inab.github.io/oeb-widgets-graphs/)
#### :point_right: There is a repository with some examples [here](https://github.com/inab/demo_oeb-widgets-graphs)

The package is build with [Lint Elements](https://lit.dev/) components and javascript modules.

It has some dependencies associated for the functionalities:
* *html2canvas*
* *jspdf*
* *pareto-frontier*
* *simple-statistics*
* *plotly.js*

- - - -
## Project structure
* /src. Where the main application files are hosted.
* /src/demo. Live demo of applications functionalities and a .json file to simulate real data.

- - - -
## Build Setup

Download the package and install dependencies:

```
npm install
```   

Serve with hot reload at localhost:

```
npm run dev
```

Build package for production:
```
npm run build
```
- - - -
## Usage
```
npm i @inb/oeb-widgets-graphs
```
or
```js
import '/dist/oeb-widgets-graphs.es.js';
```
or
```
<script type="module" src="https://cdn.jsdelivr.net/gh/inab/oeb-widgets-graphs@main/dist/oeb-widgets-graphs.umd.js" />
```

Then just declare the element with the variables that contain the data to be able to build the corresponding graph.
```js
<widget-element
  :data=graphData
  :type=graphType>
</widget-element>
```
- - - -
## Graphs types
### Bar plot
Bar plot shows the results of a benchmarking challenge that uses one single evaluation metric in the form of a Barplot. Challenge participants are shown in the X axis, while the value of their metric is shown in the Y axis. [Bar plot live demo](https://inab.github.io/oeb-widgets-graphs/_examples/barplot.html)

<img width="320" height="240" style="display: block; margin: 0 auto" src="https://github.com/inab/oeb-widgets-graphs/blob/0b17d40c325f55df986153659a737abc3f1aa12c/docs/assets/videos/bar-plot.gif?raw=true)" />
#### Bar plot classification
The results of this plot format can be transformed into a tabular format by sorting the participants in descending/ascending order according to their metrics and applying a quartile classification over that linear set of values. This classification splits the participants into four different groups/clusters depending on their performance. Clusters are separated in the plot with vertical lines and shown in the right table together with a green color-scale, which is easier to interpret for both experts and non-expert users.
![This is an alt text.](https://github.com/inab/oeb-widgets/blob/main/static/widgetsPicture/Barplot.png)

#### Bar plot structure
You can see an example of a structure to display bar graphs within the "demo" section of the application. [Bar plot structure example](https://github.com/inab/oeb-widgets-graphs/blob/main/src/demo/files/BARPLOT.json)

- - - -
### Scatter plot
Scatter plot displays the results of scientific benchmarking experiments in graph format, and apply various classification methods to transform them to tabular format. [Scatter plot live demo](https://inab.github.io/oeb-widgets-graphs/_examples/scatterplot.html)

<img width="320" height="240"  style="display: block; margin: 0 auto" src="https://github.com/inab/oeb-widgets-graphs/blob/0b17d40c325f55df986153659a737abc3f1aa12c/docs/assets/videos/scatter-plot.gif?raw=true" />

#### Scatter plot classification
* Square quartiles - divide the plotting area in four squares by getting the 2nd quartile of the X and Y metrics.

![Square quartiles.](https://github.com/inab/oeb-widgets-graphs/blob/894da45de531ba9d56d0db27e9ee3cc70a1972ab/src/demo/images/scatterplot_quartiles_img.png)


* Diagonal quartiles - divide the plotting area with diagonal lines by assigning a score to each participant based in the distance to the 'optimal performance'.

![Diagonal quartiles.](https://github.com/inab/oeb-widgets-graphs/blob/894da45de531ba9d56d0db27e9ee3cc70a1972ab/src/demo/images/scatterplot_diagonal_img.png)

* Clustering - group the participants using the K-means clustering algorithm and sort the clusters according to the performance.
![Clustering.](https://github.com/inab/oeb-widgets-graphs/blob/894da45de531ba9d56d0db27e9ee3cc70a1972ab/src/demo/images/scatterplot_clustering_img.png)

#### Scatter plot structure
You can see an example of a structure to display bar graphs within the "demo" section of the application. [Scatter plot structure example](https://github.com/inab/oeb-widgets-graphs/blob/main/src/demo/files/SCATTERPLOT.json)
- - - -
### Box plot
Box plot shiw the results of a benchmarking challenge that uses a graphical representation of the distribution of a dataset on a seven-number summary of datapoints. The challenge metrics is represented in Y axis by default. [Box plot live demo](https://inab.github.io/oeb-widgets-graphs/_examples/boxplot.html)

<img width="320" height="240"  style="display: block; margin: 0 auto" src="https://github.com/inab/oeb-widgets-graphs/blob/0b17d40c325f55df986153659a737abc3f1aa12c/docs/assets/videos/box-plot.gif?raw=true" />

#### Box plot classification
The result of the plot can be ordened by maximum or minimum median value.
![This is an alt text.](https://github.com/inab/oeb-widgets-graphs/blob/1a3a58290a75f0fc773ab4341601e5ca1659b7f5/src/demo/images/boxplot_img.png)
#### Box plot structure
You can see an example of a structure to display bar graphs within the "demo" section of the application. [Box plot structure example](https://github.com/inab/oeb-widgets-graphs/blob/main/src/demo/files/BOXPLOT.json)
- - - -
### Radar plot
A radar chart is an informative visual tool in which multiple variables (three or more) are compared on a two-dimensional plane. To do this, we will create different axes that come from a common central point. In most cases, all axes are evenly distributed and drawn evenly relative to each other.
[Radar plot live demo](https://inab.github.io/oeb-widgets-graphs/_examples/radarplot.html)

<img width="320" height="240"  style="display: block; margin: 0 auto" src="https://github.com/inab/oeb-widgets-graphs/blob/0b17d40c325f55df986153659a737abc3f1aa12c/docs/assets/videos/radar-plot.gif?raw=true" />

#### Radar plot structure
You can see an example of a structure to display bar graphs within the "demo" section of the application. [Radar plot structure example](https://github.com/inab/oeb-widgets-graphs/blob/main/src/demo/files/RADARPLOT.json).
- - - -
### Line plot
A line plot is an effective visual tool used to display trends and relationships between numerical variables over a continuous range. It consists of data points connected by a line, typically plotted on a two-dimensional plane with one variable on the x-axis and another on the y-axis. Line plots are particularly useful for illustrating patterns over time, comparing multiple datasets, or highlighting fluctuations and trends within the data.
[Line plot live demo](https://inab.github.io/oeb-widgets-graphs/_examples/lineplot.html)

<img width="500" height="400"  style="display: block; margin: 0 auto" src="https://raw.githubusercontent.com/inab/oeb-widgets-graphs/25e27732a42364a677df669c70f1512d5058e7d3/docs/assets/videos/line-plot-new.gif?raw=true" />

#### Line plot structure
You can see an example of a structure to display bar graphs within the "demo" section of the application. [Line plot structure example](https://github.com/inab/oeb-widgets-graphs/blob/main/src/demo/files/LINEPLOT_NEW.json).