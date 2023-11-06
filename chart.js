d3.csv("medals.csv").then(
    function(data){
        
        var medalCounts = {};
        data.forEach(function(d) {
            var team = d.Team;
            var medal = d.Medal;
            if (medalCounts[team]) {
                medalCounts[team][medal] += 1;
              } else {
                medalCounts[team] = {
                  "Gold": 0,
                  "Silver": 0,
                  "Bronze": 0
                };
                medalCounts[team][medal] += 1;
              }
            });
            var medalData = [];
            for (var team in medalCounts) {
                var total = medalCounts[team]["Gold"] + medalCounts[team]["Silver"] + medalCounts[team]["Bronze"];
                if (total > 35) { // Only include teams with more than 30 medals
                                    medalData.push({
                                        "Team": team,
                                        "Gold": medalCounts[team]["Gold"],
                                        "Silver": medalCounts[team]["Silver"],
                                        "Bronze": medalCounts[team]["Bronze"],
                                        "Total": total
                                    });
                                }
                                        }
            medalData.sort(function(a, b) {
                return d3.ascending(a.Team, b.Team);
            });
        var margin = {top: 10, right: 20, bottom: 190, left: 40},
            width = 1260 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        var x = d3.scaleBand()
                  .range([0, width])
                  .padding(0.1);

        var y = d3.scaleLinear()
                  .range([height, 0]);

      var color = d3.scaleOrdinal()
            .domain(["Gold", "Silver", "Bronze"])
            .range(["#FFD700", "#C0C0C0", "#CD7F32"]);

      var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
        .append("g")
      .attr("transform","translate(" + margin.left + "," + margin.top + ")");
        
  x.domain(medalData.map(function(d) { return d.Team; }));
  //y.domain([0, d3.max(medalData, function(d) { return d.Total; })]);
  y.domain([0,700]).nice().ticks(30);

  svg.selectAll(".bar")
      .data(medalData)
    .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + x(d.Team) + ",0)"; })
    .selectAll("rect")
      .data(function(d) { return [d.Gold, d.Silver, d.Bronze]; })
    .enter().append("rect")
      .attr("class", "medal")
      .attr("x", 0)
      .attr("y", function(d) { return y(d); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d); })
      .attr("fill", function(d, i) { return color(i === 0 ? "Gold" : i === 1 ? "Silver" : "Bronze"); })
      .attr("stroke", "white") // Add white border to bars for better visibility
      .attr("stroke-width", 2);

      svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", function(d) {
          return "rotate(-90)";
      })
      .attr("font-size", "12px");

      svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(30, "d")) // Format y-axis ticks to be more readable
    .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Total Medals Won")
      .attr("font-size", "16px");

var legend = svg.selectAll(".legend")
      .data(color.domain().slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; })
      .attr("font-size", "12px"); // Increase font size of legend text
});
