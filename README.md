<img src="https://github.com/inab/oeb-widgets-graphs/blob/b67955da608e66e105fcef54b7da4d2818f18d69/docs/assets/image/opeb_logo.gif?raw=true" width="200"
style="display: block; margin: 0 auto"/>

<p style="text-align: center; font-size: 30px; padding-bottom:30px; font-weight: bold;">OEB WIDGETS GRAPHS</p>

<p style="font-weight: bold; text-align: center">A charts collection based on <a href="https://openebench.bsc.es/" style="color: #0b579f">OpenEBench</a> Application</p>

[![npm](https://img.shields.io/npm/v/@inb/oeb-widgets-graphs)](https://www.npmjs.com/package/@inb/oeb-widgets-graphs) ![install size](https://packagephobia.com/badge?p=@inb/oeb-widgets-graphs) ![NPM License](https://img.shields.io/npm/l/%40inb%2Foeb-widgets-graphs)


## Documentation 


The package is build with [Lint Elements](https://lit.dev/) components and javascript modules.

It has some dependencies associated for the functionalities:
* *html2canvas*
* *jspdf*
* *pareto-frontier*
* *simple-statistics*
* *plotly.js*

###  :point_right: About You can see the complete documentation [here](https://inab.github.io/oeb-widgets-graphs/)
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
```js
import '@inb/oeb-widgets-graphs/dist/oeb-widgets-graphs.es.js';
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
#### Bar plot classification
The results of this plot format can be transformed into a tabular format by sorting the participants in descending/ascending order according to their metrics and applying a quartile classification over that linear set of values. This classification splits the participants into four different groups/clusters depending on their performance. Clusters are separated in the plot with vertical lines and shown in the right table together with a green color-scale, which is easier to interpret for both experts and non-expert users.
![This is an alt text.](https://github.com/inab/oeb-widgets/blob/main/static/widgetsPicture/Barplot.png)

#### Bar plot structure
You can see an example of a structure to display bar graphs within the "demo" section of the application. [Bar plot structure example](https://github.com/inab/oeb-widgets-graphs/blob/main/src/demo/files/BARPLOT.json)
- - - -
### Scatter plot
Scatter plot displays the results of scientific benchmarking experiments in graph format, and apply various classification methods to transform them to tabular format. [Scatter plot live demo](https://inab.github.io/oeb-widgets-graphs/_examples/scatterplot.html)

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