$(document).ready(function() {
  var width = $(window).width(), height = $(window).height();

  var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

  var scale = d3.scale.category20c();
  var chi_scale = ['#B3DDF2', '#FF0000', '#FFFFFF'];

  d3.json("/json/wards.topojson", function(error, layer) {
    if (error) return console.error(error);
    console.log(layer);
    var shapes = topojson.feature(layer, layer.objects.CouncilPassedWards_11192012);
    console.log(shapes);
    var projection = d3.geo.mercator()
      .scale(140000)
      .rotate([88, -41.95, 0]);
      //.translate([width/2, height/2]);
    var path = d3.geo.path()
      .projection(projection);
    svg.selectAll("path")
      .data(shapes.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", function(d, i) {
        return scale(i % 20);
      })
      .attr("class", "shape");
  });
});
