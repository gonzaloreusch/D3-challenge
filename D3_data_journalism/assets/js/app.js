function makeResponsive() {
    console.log('connection successful') // validating connection
      var svgArea = d3.select('body').select('svg');
      // clearing if svg is not empty
      if (!svgArea.empty()) {
          svgArea.remove()
      };
      var svgWidth = window.innerWidth;
      var svgHeight = window.innerHeight;

      var margin = {
          top: 60,
          bottom: 170,
          left: 130,
          right: 170
      };
      // dynamic-chart positioning with the svg area
      var height = svgHeight - margin.top - margin.bottom;
      var width = svgWidth - margin.left - margin.right;
      // appending svg element
      var svg = d3.select('#scatter')
          .append('svg')
          .attr('height', svgHeight)
          .attr('width', svgWidth);
      //  group element
      var chartGroup = svg.append('g')
          .attr('transform', `translate(${margin.left}, ${margin.top})`);
      // initial parameters
      var chosenXAxis = 'poverty';
      var chosenYAxis = 'healthcare';
      // functions used to updates scale variables upon click on axis labels
      function xScale(data, chosenXAxis) {
          // creating the scales
          var xLinearScale = d3.scaleLinear()
              .domain([d3.min(data, d => d[chosenXAxis]) * 0.8, 
              d3.max(data, d => d[chosenXAxis]) * 1.2])
              .range([0, width]);
          return xLinearScale;
      }
      function yScale(data, chosenYAxis) {
          // creating the scales
          var yLinearScale = d3.scaleLinear()
              .domain([d3.min(data, d => d[chosenYAxis]) * 0.8, 
              d3.max(data, d => d[chosenYAxis]) * 1.2])
              .range([height, 0]);
          return yLinearScale;
      }
      // function used for updating xAxis var upon click on axis label
      function renderXAxes(newXScale, xAxis) {
          var bottomAxis = d3.axisBottom(newXScale);
          xAxis.transition()
              .duration(1000)
              .call(bottomAxis);
          return xAxis;
      }
      function renderYAxes(newYScale, yAxis) {
          var leftAxis = d3.axisLeft(newYScale);
          yAxis.transition()
              .duration(1000)
              .call(leftAxis);
          return yAxis;
      }
     // function used for updating circles group with a transition to
     // new circles
      function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
          circlesGroup.transition()
            .duration(1000)
            .attr('cx', d => newXScale(d[chosenXAxis]))
            .attr('cy', d => newYScale(d[chosenYAxis]));
          return circlesGroup;
      }
      // functions to update abbr text labels with a transition to new circles
      function renderCirclesText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
          textGroup.transition()
              .duration(1000)
              .attr('x', d => newXScale(d[chosenXAxis]))
              .attr('y', d => newYScale(d[chosenYAxis]));
          return textGroup;
      }
      // function to update the circles group with new tooltip
      function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
          // getting xlabel
          if (chosenXAxis === 'poverty') {
            var xlabel = 'Poverty (%)';
          }
          else if (chosenXAxis === 'age') {
            var xlabel = 'Age (Median)';
          }
          else {
            var xlabel = 'Income (Median)';
          }
          // getting ylabel
          if (chosenYAxis === 'healthcare') {
              var yLabel = 'No Healthcare (%)';
          }
          else if (chosenYAxis === 'obesity') {
              var yLabel = 'Obesity (%)';
          }
          else {
              var yLabel = 'Smokers (%)';
          }
          // initiating the toolip
          var toolTip = d3.tip()
              .attr("class", "d3-tip")
              .offset([80, -60])
              .html(function(d) {
                  return (`${d.state}<br>${yLabel}: ${d[chosenYAxis]}<br>${xlabel}: ${d[chosenXAxis]}`);
              });
          circlesGroup.call(toolTip);
          circlesGroup.on('mouseover', function(data){
              toolTip.show(data,this);
            })
              .on('mouseout', function(data,index){
                  toolTip.hide(data);
              });
                
          return circlesGroup;
        }
      d3.csv('assets/data/data.csv').then(function(data) {
          // console.log(data[0])
          // parse data
          data.forEach(function(data) {
              data.poverty = +data.poverty;
              data.age = +data.age;
              data.income = +data.income;
              data.healthcare = +data.healthcare;
              data.obesity = +data.obesity;
              data.smokes = +data.smokes;
          });
          // linear scales from functions
          var xLinearScale = xScale(data, chosenXAxis);
          var yLinearScale = yScale(data, chosenYAxis);
          // initial axis functions
          var bottomAxis = d3.axisBottom(xLinearScale);
          var leftAxis = d3.axisLeft(yLinearScale);
          // appending x axis
          var xAxis = chartGroup.append('g')
              .classed('x-axis', true)
              .attr('transform', `translate(0, ${height})`)
              .call(bottomAxis);
          //append y axis
          var yAxis = chartGroup.append('g')
              .classed('y-axis', true)
              .call(leftAxis);
            // appending initial circles
          var circlesGroup = chartGroup.selectAll('circles')
              .data(data)
              .enter()
              .append('circle')
              .classed('stateCircle', true)
              .attr('cx', d => xLinearScale(d[chosenXAxis]))
              .attr('cy', d => yLinearScale(d[chosenYAxis]))
              .attr('fill', '#e83e8c')
              .attr('r', 15)
              .attr('opacity', 0.8);
          var textGroup = chartGroup.selectAll(".stateText")
              .data(data)
              .enter()
              .append('text')
              .classed('stateText', true)
              .attr('x', d => xLinearScale(d[chosenXAxis]))
              .attr('y', d => yLinearScale(d[chosenYAxis]))
              .attr('dy', ".35em")
              .attr('font-size', '15px')
              .text(d => d.abbr);
          var xLabelsGroup = chartGroup.append('g')
              .attr('transform', `translate(${width / 2}, ${height + 20})`);
          var povertyLabel = xLabelsGroup.append('text')
              .attr('x', 0)
              .attr('y', 20)
              .attr('value', 'poverty') // value to grab for event listener
              .classed('active', true)
              .classed('aText', true)
              .text('In Poverty (%)');
          var ageLabel = xLabelsGroup.append('text')
              .attr('x', 0)
              .attr('y', 50)
              .attr('value', 'age') 
              .classed('inactive', true)
              .classed('aText', true)
              .text('Age (Median)');
          var incomeLabel = xLabelsGroup.append('text')
              .attr('x', 0)
              .attr('y', 80)
              .attr('value', 'income') 
              .classed('inactive', true)
              .classed('aText', true)
              .text('Household Income (Median)');
          var yLabelsGroup = chartGroup.append('g')
              .attr('transform', `translate(${0 - margin.left/4}, ${(height/2)})`);
          var healthcareLabel = yLabelsGroup.append('text')
              .attr('y', 0 - 20)
              .attr('x', 0)
              .attr('dy', '1em')
              .attr('value', 'healthcare')
              .attr("transform", "rotate(-90)")
              .classed('active', true)
              .classed('aText', true)
              .text('Lacks Healthcare (%)');
          var smokesLabel = yLabelsGroup.append('text')
              .attr('y', 0 - 50)
              .attr('x', 0)
              .attr('dy', '1em')
              .attr('value', 'smokes')
              .attr("transform", "rotate(-90)")
              .classed('inactive', true)
              .classed('aText', true)
              .text('Smokes (%)');
          var obesityLabel = yLabelsGroup.append('text')
              .attr('y', 0 - 80)
              .attr('x', 0)
              .attr('dy', '1em')
              .attr('value', 'obesity')
              .attr("transform", "rotate(-90)")
              .classed('inactive', true)
              .classed('aText', true)
              .text('Obesity (%)');
          // updateToolTip function above
          var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
          xLabelsGroup.selectAll('text')
              .on('click', function() {
                  //get value of selection
                  var value = d3.select(this).attr('value');
                  // checking if value changed from current selection
                  if (value !== chosenXAxis) {
                      // replacing chosenXAxis with value
                      chosenXAxis = value;
                      console.log(chosenXAxis)
                      //update x scale for new data
                      xLinearScale = xScale(data, chosenXAxis);
                      //update x axis with transition
                      xAxis = renderXAxes(xLinearScale, xAxis);
                      //updating circles with new x values
                      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                      //update text with new x values
                      textGroup = renderCirclesText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                      //updating tooltips with new info
                      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                      //change classes to change bold text
                      if (chosenXAxis === "poverty") {
                          povertyLabel
                              .classed("active", true)
                              .classed("inactive", false);
                          ageLabel
                              .classed("active", false)
                              .classed("inactive", true);
                          incomeLabel
                              .classed("active", false)
                              .classed("inactive", true);
                      } 
                      else if (chosenXAxis === "age") {
                          povertyLabel
                              .classed("active", false)
                              .classed("inactive", true);
                          ageLabel
                              .classed("active", true)
                              .classed("inactive", false);
                          incomeLabel
                              .classed("active", false)
                              .classed("inactive", true);
                      } 
                      else {
                          povertyLabel
                              .classed("active", false)
                              .classed("inactive", true);
                          ageLabel
                              .classed("active", false)
                              .classed("inactive", true);
                          incomeLabel
                              .classed("active", true)
                              .classed("inactive", false);
                      }
                  }
              });
          //y axis labels event listener
          yLabelsGroup.selectAll('text')
              .on('click', function() {
                  //get value of selection
                  var value = d3.select(this).attr('value');
                  //check if value is same as current axis
                  if (value !== chosenYAxis) {
                      //replace chosenYAxis with value
                      chosenYAxis = value;
                      console.log(chosenYAxis)
                      //update y scale for new data
                      yLinearScale = yScale(data, chosenYAxis);
                      //update x axis with transition
                      yAxis = renderYAxes(yLinearScale, yAxis);
                      //update circles with new y values
                      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                      //update text with new y values
                      textGroup = renderCirclesText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
                      //update tooltips with new info
                      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                      //change classes to change bold text
                      if (chosenYAxis === "obesity") {
                          obesityLabel   
                              .classed("active", true)
                              .classed("inactive", false);
                          smokesLabel
                              .classed("active", false)
                              .classed("inactive", true);
                          healthcareLabel
                              .classed("active", false)
                              .classed("inactive", true);
                      } 
                      else if (chosenYAxis === "smokes") {
                          obesityLabel
                              .classed("active", false)
                              .classed("inactive", true);
                          smokesLabel
                              .classed("active", true)
                              .classed("inactive", false);
                          healthcareLabel
                              .classed("active", false)
                              .classed("inactive", true);
                      } 
                      else {
                          obesityLabel
                              .classed("active", false)
                              .classed("inactive", true);
                          smokesLabel
                              .classed("active", false)
                              .classed("inactive", true);
                          healthcareLabel
                              .classed("active", true)
                              .classed("inactive", false);
                      }
                  }
              });
      });
  }
  // when the browser loads, makeResponsive() is called.
  makeResponsive();
  // when the browser window is resized, makeResponsive() is called.
  d3.select(window).on("resize", makeResponsive);
