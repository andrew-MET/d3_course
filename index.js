import * as d3 from "d3";

const createChart = async () => {
  const data = await d3.json("oslo_weather-metric.json");
  //console.log(data[0]);

  // accessors and date parser
  const yAccessorMax = (d) => d.temperatureMax;
  const yAccessorMin = (d) => d.temperatureMin;

  const dateParser = d3.timeParse("%Y-%m-%d");
  const xAccessor = (d) => dateParser(d.date);

  // screen dimensions
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

  dimensions.boundedWidth = dimensions.width 
    - dimensions.margin.left 
    - dimensions.margin.right;
  dimensions.boundedHeight = dimensions.height 
    - dimensions.margin.top 
    - dimensions.margin.bottom;

  // select wrapper and append svg and set bounds
  const wrapper = d3.select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", 400)
      .style("border", "1px solid");

  const bounds = wrapper.append("g")
      .style(
        "transform",
        `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
      );

  // yScale and xScale functions

  const minTempRange = d3.extent(data, yAccessorMin);
  const maxTempRange = d3.extent(data, yAccessorMax);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(d3.merge([minTempRange, maxTempRange])))
    .range([dimensions.boundedHeight, 0]);

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, xAccessor))
    .range([0, dimensions.boundedWidth]);

  // birthday rectangle
  const birthday = bounds
    .append("rect")
    .attr("x", xScale(dateParser("2020-05-12")) - 10)
    .attr("width", 20)
    .attr("y", 0)
    .attr("height", dimensions.boundedHeight)
    .attr("fill", "#CCC")
    .attr("fill-opacity", 1);

  // lineGenerator and line
  const lineGeneratorMax = d3.line()
    .x((d) => xScale(xAccessor(d)))
    .y((d) => yScale(yAccessorMax(d)));

  const areaGeneratorMin = d3.area()
    .x((d) => xScale(xAccessor(d)))
    .y1((d) => yScale(yAccessorMin(d)))
    .y0(dimensions.boundedHeight);

  const lineMax = bounds
    .append("path")
    .attr("d", lineGeneratorMax(data))
    .attr("stroke", "#EE7777")
    .attr("fill", "none")
    .attr("stroke-width", 2);

  const areaMin = bounds
    .append("path")
    .attr("d", areaGeneratorMin(data))
    .attr("stroke", "#7777EE")
    .attr("fill", "#7777EE")
    .attr("fill-opacity", 0.55)
    .attr("stroke-width", 2);

  // freezing box
  const freezingTempLocation = yScale(0);
  const freezingTemp = bounds
    .append("rect")
    .attr("x", 0)
    .attr("width", dimensions.boundedWidth)
    .attr("y", freezingTempLocation)
    .attr("height", dimensions.boundedHeight - freezingTempLocation)
    .attr("fill", "#76ECCC")
    .attr("fill-opacity", 0.25);

  // Axis generators and axes
  const yAxisGenerator = d3.axisLeft().scale(yScale);

  const yAxis = bounds.append("g").call(yAxisGenerator);

  const xAxisGenerator = d3.axisBottom().scale(xScale);

  const xAxis = bounds
    .append("g")
    .call(xAxisGenerator)
    .style("transform", `translate(0px, ${dimensions.boundedHeight}px)`);
};

createChart();
