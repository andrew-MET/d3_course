import * as d3 from "d3";

const createChart = async () => {
  
  d3.select("body")
      .style("background", "#222");

  const data = await d3.json("oslo_weather-metric.json");
  //console.log(data[0]);

  // accessors and date parser
  //const yAccessorMax = d => d.temperatureMax;
  //const yAccessorMin = d => d.temperatureMin;

  const yAccessor = (d, metric) => d[metric];
  //console.log(d3.extent(data.map(d => yAccessor(d, "temperatureMin"))))
  
  const dateParser = d3.timeParse("%Y-%m-%d");
  const xAccessor = d => dateParser(d.date);

  // set dimensions

  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 400,
    margin: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60
    }
  };

  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // select wrapper and append svg and set bounds
  const wrapper = d3.select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)
    //.style("border", "1px solid")
    .style("background", "#222");

  const bounds = wrapper.append("g")
      .style(
        "transform",
        `translate(
          ${dimensions.margin.left}px, 
          ${dimensions.margin.top}px
        )`
      );

  // yScale and xScale functions

  const minTempRange = d3.extent(
    data.map(d => yAccessor(d, "temperatureMin"))
  );
  const maxTempRange = d3.extent(
    data.map(d => yAccessor(d, "temperatureMax"))
  );
  const tempRange = addArrays(
    d3.extent(d3.merge([minTempRange, maxTempRange])),
    [-1, 1]
  );

  const yScale = d3.scaleLinear()
    .domain(tempRange)
    .range([dimensions.boundedHeight, 0])
    .nice();

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, xAccessor))
    .range([0, dimensions.boundedWidth]);

  // birthday rectangle
  const birthday = bounds.append("rect")
    .attr("x", xScale(dateParser("2020-05-11")))
    .attr(
      "width",
      xScale(dateParser("2020-05-13")) - xScale(dateParser("2020-05-11"))
    )
    .attr("y", 0)
    .attr("height", dimensions.boundedHeight)
    .attr("fill", "#555")
    .attr("fill-opacity", 1);

  // lineGenerators and areaGenerator
  const lineGeneratorMax = d3.line()
    .curve(d3.curveNatural)
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d, "temperatureMax")));

  const lineGeneratorMin = d3.line()
    .curve(d3.curveNatural)
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d, "temperatureMin")));

  const areaGeneratorMin = d3.area()
    .curve(d3.curveNatural)
    .x(d => xScale(xAccessor(d)))
    .y1(d => yScale(yAccessor(d, "temperatureMin")))
    .y0(dimensions.boundedHeight);

  // draw line and area
  const lineMax = bounds.append("path")
    .attr("d", lineGeneratorMax(data))
    .attr("stroke", "#EE7777")
    .attr("fill", "none")
    .attr("stroke-width", 2);

  const lineMin = bounds.append("path")
    .attr("d", lineGeneratorMin(data))
    .attr("stroke", "#7777EE")
    .attr("fill", "none")
    .attr("stroke-width", 2);

  const areaMin = bounds.append("path")
    .attr("d", areaGeneratorMin(data))
    .attr("fill", "#7777EE")
    .attr("fill-opacity", 0.15);

  // freezing box
  const yFreezingTemp = yScale(0);
  const freezingTemp = bounds.append("rect")
    .attr("x", 0)
    .attr("width", dimensions.boundedWidth)
    .attr("y", yFreezingTemp)
    .attr("height", dimensions.boundedHeight - yFreezingTemp)
    .attr("fill", "#76ECCC")
    .attr("fill-opacity", 0.15);

  // Axis generators and axes
  const yAxisGenerator = d3.axisLeft()
    .scale(yScale);

  const yAxis = bounds.append("g")
    .call(yAxisGenerator);

  const xAxisGenerator = d3.axisBottom()
    .scale(xScale);

  const xAxis = bounds.append("g")
    .call(xAxisGenerator)
      .style("transform", `translate(0px, ${dimensions.boundedHeight}px)`);

  xAxis.selectAll(".domain, .tick, .tick line")
    .attr("stroke", "#999")
    .attr("stroke-width", 0.5);

  yAxis.selectAll(".domain, .tick, .tick line")
    .attr("stroke", "#999")
    .attr("stroke-width", 0.5);

  const plotBorder = bounds.append("rect")
    .attr("x", 0)
    .attr("width", dimensions.boundedWidth)
    .attr("y", 0)
    .attr("height", dimensions.boundedHeight)
    .attr("fill", "none")
    .attr("stroke", "#999")
    .attr("stroke-width", 1);
};

function addArrays(ar1, ar2) {
  let ar3 = [];
  for (let i in ar1) ar3.push(ar1[i] + ar2[i]);
  return ar3;
}

createChart();
