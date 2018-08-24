var r = 640 / 2;

var cluster = d3.layout.cluster()
    .size([360, 1])
    .sort(null)
    .value(function(d) { return d.length; })
    .children(function(d) { return d.branchset; })
    .separation(function(a, b) { return 1; });

function project(d) {
  var r = d.y, a = (d.x - 90) / 180 * Math.PI;
  return [r * Math.cos(a), r * Math.sin(a)];
}

function cross(a, b) { return a[0] * b[1] - a[1] * b[0]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }

function step(d) {
  var s = project(d.source),
      m = project({x: d.target.x, y: d.source.y}),
      t = project(d.target),
      r = d.source.y,
      sweep = d.target.x > d.source.x ? 1 : 0;
  return (
    "M" + s[0] + "," + s[1] +
    "A" + r + "," + r + " 0 0," + sweep + " " + m[0] + "," + m[1] +
    "L" + t[0] + "," + t[1]);
}

var wrap = d3.select("#vis").append("svg")
    .attr("width", r * 2)
    .attr("height", r * 2)
    .style("-webkit-backface-visibility", "hidden");

/*
// Catch mouse events in Safari.
wrap.append("rect")
    .attr("width", r * 2)
    .attr("height", r * 2)
    .attr("fill", "none")
*/

var vis = wrap.append("g")
    .attr("transform", "translate(" + r + "," + r + ")");

/*
var start = null,
    rotate = 0,
    div = document.getElementById("vis");

function mouse(e) {
  return [
    e.pageX - div.offsetLeft - r,
    e.pageY - div.offsetTop - r
  ];
}
*/

/*
wrap.on("mousedown", function() {
  wrap.style("cursor", "move");
  start = mouse(d3.event);
  d3.event.preventDefault();
});
d3.select(window)
  .on("mouseup", function() {
    if (start) {
      wrap.style("cursor", "auto");
      var m = mouse(d3.event);
      var delta = Math.atan2(cross(start, m), dot(start, m)) * 180 / Math.PI;
      rotate += delta;
      if (rotate > 360) rotate %= 360;
      else if (rotate < 0) rotate = (360 + rotate) % 360;
      start = null;
      wrap.style("-webkit-transform", null);
      vis
          .attr("transform", "translate(" + r + "," + r + ")rotate(" + rotate + ")")
        .selectAll("text")
          .attr("text-anchor", function(d) { return (d.x + rotate) % 360 < 180 ? "start" : "end"; })
          .attr("transform", function(d) {
            return "rotate(" + (d.x - 90) + ")translate(" + (r - 170 + 8) + ")rotate(" + ((d.x + rotate) % 360 < 180 ? 0 : 180) + ")";
          });
    }
  })
  .on("mousemove", function() {
    if (start) {
      var m = mouse(d3.event);
      var delta = Math.atan2(cross(start, m), dot(start, m)) * 180 / Math.PI;
      wrap.style("-webkit-transform", "rotateZ(" + delta + "deg)");
    }
  });
*/

// tree size
function phylo(n, offset) {
  if (n.length != null) offset += n.length * 100;
  n.y = offset;
  if (n.children)
    n.children.forEach(function(n) {
      phylo(n, offset);
    });
}

d3.text("life.txt", function(text) {
  var x = newick.parse(text);
//document.write(Object.keys(x));
//document.write(Object.keys(x.branchset));
//document.write(Object.keys(x.branchset[0]));
//document.write(x.branchset[0].name);
//document.write(x.branchset[1].length);
  var nodes = cluster.nodes(x);
  phylo(nodes[0], 0);
//document.write(Object.keys(nodes[0].branchset[0]));
//document.write(nodes[9].branchset[0].name);
//document.write(nodes.length);
for(i=0;i<nodes.length;i++){
  document.write(Object.keys(nodes[i]) + "</br>");
  document.write(Object.values(nodes[i]) + "</br>");
//for(j=0;j<nodes[i].branchset.length;j++){
//  document.write(nodes[i].branchset[j].name + "</br>");
}
//document.write("</br>");
//}
  // tree lines
  var link = vis.selectAll("path.link")
      .data(cluster.links(nodes))
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", step);

  var node = vis.selectAll("g.node")
      .data(nodes.filter(function(n) { return n.name.match(/[a-zA-Z]/); }))
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
      .append("circle")
      .attr("r", 2.5);

  orthologProtein = [
	{name: "Homo sapiens",				protein: [1,1,1]},
	{name: "Mus musculus",				protein: [1,1,1]},
	{name: "Saccharomyces cerevisiae",	protein: [0,0,0]},
   	{name: "Escherichia coli",			protein: [0,0,0]},
	{name: "Rattus norvegicus",			protein: [1,1,1]},
	{name: "Caenorhabditis elegans",	protein: [0,1,1]},
	{name: "Arabidopsis thaliana",		protein: [0,0,0]},
	{name: "Gallus gallus",				protein: [1,1,1]},
	{name: "Drosophila melanogaster",	protein: [0,1,1]},
	{name: "Schizosaccharomyces pombe",	protein: [0,0,0]},
	{name: "Bos taurus",				protein: [1,1,1]},
	{name: "Danio rerio",				protein: [1,1,1]},
	{name: "Oryctolagus cuniculus",		protein: [1,1,1]},
	{name: "Sus scrofa",				protein: [1,1,1]},
	{name: "Canis familiaris",			protein: [1,1,1]},
	{name: "Pseudomonas aeruginosa",	protein: [0,0,0]}
  ]; 

// icons and pies
  var pieDataRaw = [];
  for (i=0;i<orthologProtein[0].protein.length;i++) {
    pieDataRaw.push(1);
  }
  var pie = d3.layout.pie();
  var color = d3.scale.category10();
  var outerRadius = 20, innerRadius = 0;
  var arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);
  var pieData = pie(pieDataRaw);

  var leafNodes = nodes.filter(function(n) { return n.name.match(/[a-zA-Z]/); });

  var l = 0;
  for (j=0;j<orthologProtein.length;j++) {
    var className = "pie" + j;
    var classIcon = "icon" + j;
    for (k=0;k<leafNodes.length;k++) {
      if (leafNodes[k].name == orthologProtein[j].name) {
		x = leafNodes[k].x;
		y = leafNodes[k].y;
		sp = j;
      }
    }

//	function degree(n) { return n * 10; }
    // icons
    var icon = wrap.append("g")
        .attr("transform", "translate(" + r + "," + r + ")") 
        .selectAll("g." + classIcon)
//        .data(pieData)
        .data([1])
        .enter()
        .append("g")
        .attr("class", classIcon)
//        .attr("transform", "rotate(" + (x - 90) + ")translate(" + (y + 100) + ")scale(0.040000,-0.040000)");
//        .attr("transform", "rotate(" + (x - 90) + ")translate(" + (y + 100) + ")rotate(" + function(d,i) {return i * 10;} + ")scale(0.040000,-0.040000)");
        .attr("transform", function (d,i) { return "rotate(" + (x - 83) + ")translate(" + (y + 100) + ")rotate(" + (0 ) + ")scale(0.040000,-0.040000)";});
//        .attr("transform", "rotate(" + (x - 90) + ")translate(" + (y + 100) + ")rotate(" + function(d,i){return 360 / icons[sp].length * i;} + ")scale(0.040000,-0.040000)");
//        .attr("transform", "rotate(" + (x - 80) + ")translate(" + (y + 100) + ")scale(0.040000,-0.040000)");

    for (m=0;m<icons[sp].pathD.length;m++) {
        icon.append("path")
        .attr("fill", "#666666")
        .attr("d", icons[sp].pathD[m]); 
    }


    // pies
    var arcs = wrap.append("g")
        .attr("transform", "translate(" + r + "," + r + ")");

    arcs.selectAll("g." + className)
        .data(pieData)
        .enter()
        .append("g")
        .attr("class", className)
        .attr("transform", "rotate(" + (x - 90) + ")translate(" + (y + 180) + ")")
        .append("path")
        .attr("fill", function(d,i) {return orthologProtein[j].protein[i] == 0?"#888888":color(i);})
        .attr("d", function(d) {return arc(d);});
  }

  // labels
  var label = vis.selectAll("text")
      .data(nodes.filter(function(d) { return d.x !== undefined && !d.children; }))
      .enter()
      .append("text")
      .attr("dy", ".31em")
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (r - 210 + 8) + ")rotate(" + (d.x < 180 ? 0 : 180) + ")"; }) // distance between the outmost node and text
      .text(function(d) { return d.name.replace(/_/g, ' '); });

});
