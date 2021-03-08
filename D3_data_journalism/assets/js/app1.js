var svgWidth = 960;
var svgHeight = 500;
var margin = {
  top: 40,
  right: 40,
  bottom: 100,
  left: 100
};
// chart positioning
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(data) {
    // console.log(data);
    // ** 1 parse data **
    //====================
    data.forEach(function (data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healtcare = +data.healtcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    //   console.log(data.poverty);  
    });
    // ** 2 scale function **
    //=======================
    var xLinearScale = d3.scaleLinear()
      .domain([8, d3.max(data, d => d.poverty)])
      .range([0, width]);
    //   console.log(xLinearScale);
    var yLinearScale = d3.scaleLinear()
      .domain([4, d3.max(data, d => d.healthcare)])
      .range([height, 0]);
    // ** 3 axis function **
    //======================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    // ** 4 append axes-chart **
    //==========================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
    chartGroup.append("g")
      .call(leftAxis);
    // ** 5 create circles **
    //=======================
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", "8")
        .attr("class", "#stateCircle")
        .attr("opacity", "1")
        .classed("stateCircle", true);
    // text into circles
    //==================
    var stateText = chartGroup.selectAll(".stateText")
        .data(data)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d.poverty))
        .attr("y", d => yLinearScale(d.healthcare))
        .attr("dy", 3)
        .attr("font-size", "9px")
        .text(function(d) {return d.abbr});
    // ** 6 tooltip init **
    //=====================
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
         return (`${d.state}<br>Percent in Poverty: ${d.poverty}<br>% Percent Lacking Healthcare: ${d.healthcare}`);
      });
    // ** 7 create tooltip-chart **
    //=============================
    stateText.call(toolTip);
    // ** 8 create event listeners **
    //===============================
    stateText.on("click", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
    // ** 9 create labels **
    //======================
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)");
    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("In Poverty (%)");
  }).catch(function(error) {
    console.log(error);
  });
