var svg = {}, gChi = {}, gMap = {}, zoom = {}, translate = false, scale = false;

function getOrdinalSuffix(i) {
  var j = i % 10, k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

function loadMap(settings) {
  var width = $(window).width(), height = $(window).height();

  d3.selectAll("path.shape").remove();
  $('#info-box').html('');

  var zoom_scale = d3.scale.linear()
    .domain([300, 1200])
    .range([50000, 150000]);

  d3.json("/json/" + settings['path'] + ".topojson", function(error, layer) {
    if (error) return console.error(error);
    var shapes = topojson.feature(layer, layer.objects.shapes);
    var projection = d3.geo.mercator()
      .scale(zoom_scale(height))
      .rotate([87.728675, -41.844114, 0])
      .translate([width/2, height/2]);
    var path = d3.geo.path()
      .projection(projection);
    gMap = svg.append('g');
    gMap.selectAll("path")
      .data(shapes.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", function(d, i) {
        return settings['scale'](i % settings['num_colors']);
      })
      .attr("class", "shape")
      .on("mouseover", function(d, i) {
        if (settings['template']) {
          $('#info-box').html(_.template(settings['template'], {'shape': d.properties}));
        }
      })
      .call(zoom);
    if (translate && scale) {
      gMap.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    }
  });
}

function showPosition(position) {
  d3.selectAll("text").remove();
  var width = $(window).width(), height = $(window).height();
  var zoom_scale = d3.scale.linear()
    .domain([300, 1200])
    .range([50000, 150000]);
  var projection = d3.geo.mercator()
      .scale(zoom_scale(height))
      .rotate([87.728675, -41.844114, 0])
      .translate([width/2, height/2]);

  gMap.append('text')
    .attr("class", "youarehere")
    .attr("transform", function() { return "translate(" + projection([position.coords.longitude, position.coords.latitude]) + ")"; })
    .attr("dy", ".35em")
    .text('You are here');
}

function drawChicago() {
  var width = $(window).width(), height = $(window).height();

  var zoom_scale = d3.scale.linear()
    .domain([300, 1200])
    .range([50000, 150000]);

  d3.json("/json/chicago.topojson", function(error, layer) {
    if (error) return console.error(error);
    var shapes = topojson.feature(layer, layer.objects.chicago);
    var projection = d3.geo.mercator()
      .scale(zoom_scale(height))
      .rotate([87.728675, -41.844114, 0])
      .translate([width/2, height/2]);
    var path = d3.geo.path()
      .projection(projection);
    gChi = svg.append('g');
    gChi.selectAll("path")
      .data(shapes.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "rgba(0, 0, 0, 0.05)")
      .attr("class", "city");
  });
}

function zoomed() {
  translate = d3.event.translate, scale = d3.event.scale;
  gChi.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
  gMap.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
}

$(document).ready(function() {
  var TIFTemplate = $('#tif-template').html();
  var PrecinctTemplate = $('#precinct-template').html();
  var ParksTemplate = $('#parks-template').html();
  var WardsTemplate = $('#wards-template').html();
  var NeighborhoodsTemplate = $('#neighborhoods-template').html();
  var CensusTractsTemplate = $('#census_tracts-template').html();
  var main_scale = d3.scale.category20c();
  var park_scale = d3.scale.ordinal()
    .domain([0, 8])
    .range(colorbrewer.Greens[9]);

  zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

  var maps = {
    'precincts': {
      'path': 'precincts', 'scale': main_scale, 'num_colors': 20, 'template': PrecinctTemplate},
    'wards': {'path': 'wards', 'scale': main_scale, 'num_colors': 20, 'template': WardsTemplate},
    'tifs': {'path': 'tifs', 'scale': main_scale, 'num_colors': 20, 'template': TIFTemplate},
    'parks': {'path': 'parks', 'scale': park_scale, 'num_colors': 9, 'template': ParksTemplate},
    'census_tracts': {
      'path': 'census_tracts', 'scale': main_scale, 'num_colors': 20,
      'template': CensusTractsTemplate},
    'neighborhoods': {
      'path': 'neighborhoods', 'scale': main_scale, 'num_colors': 20,
      'template': NeighborhoodsTemplate}
  }

  var width = $(window).width(), height = $(window).height();
  svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

  drawChicago();
  loadMap(maps['tifs']);
  $('select').change(function(e) {
    loadMap(maps[$(this).val()]);
  });
});
