const graphConfig = {
  nodeColor: 0xe8c6a5, // (#C6492C)
  nodeSize: 20,
  nodeHoverColor: 0xffe213, // (#ffe213)
  nodeConnectionColor: 0xaab172, // (#a9ba22)
  linkFromColor: 0x649aea, // (#a33f3f)
  linkToColor: 0xebf0ff, // (#35130b)
  linkConnectionFromColor: 0xffffff, // (#ffffff)
  linkConnectionToColor: 0xffe213, // (#ffe213)
  springLength: 110,
  springCoeff: 0.0001,
  gravity: -2,
  theta: 0.2,
  dragCoeff: 0.3,
  timeStep: 3,
  backgroundColor: 0xfbf8ef, // (Socratica Black)
};

var createSettingsView = require("config.pixel");
var query = require("query-string").parse(window.location.search.substring(1));
const json = require("../graphData.json");
var graph = getGraphFromQueryString(query);
var renderGraph = require("ngraph.pixel");
var addCurrentNodeSettings = require("./nodeSettings.js");
var THREE = require("three");
var createLayout = require("pixel.layout");

const layout = createLayout(graph);

var renderer = renderGraph(graph, {
  // See API: https://github.com/anvaka/ngraph.pixel/blob/master/index.js#L25
  node: () => {
    return {
      color: graphConfig.nodeColor,
      size: graphConfig.nodeSize,
    };
  },
  link: () => {
    return {
      fromColor: graphConfig.linkFromColor,
      toColor: graphConfig.linkToColor,
    };
  },
  clearColor: graphConfig.backgroundColor, // (#121212)
});

var simulator = renderer.layout().simulator;
simulator.springLength(graphConfig.springLength);
simulator.springCoeff(graphConfig.springCoeff);
simulator.gravity(graphConfig.gravity);
simulator.theta(graphConfig.theta);
simulator.dragCoeff(graphConfig.dragCoeff);
simulator.timeStep(graphConfig.timeStep);
renderer.focus();
// var settingsView = createSettingsView(renderer);
// var gui = settingsView.gui();

// var nodeSettings = addCurrentNodeSettings(gui, renderer);

renderer.on("nodehover", showNodeDetails);
renderer.on("nodeclick", resetNodeDetails);

function showNodeDetails(node) {
  if (!node) return;

  // nodeSettings.setUI(node);
  resetNodeDetails();

  var nodeUI = renderer.getNode(node.id);
  nodeUI.color = graphConfig.nodeHoverColor;

  if (graph.getLinks(node.id)) {
    graph.getLinks(node.id).forEach(function (link) {
      var toNode = link.toId === node.id ? link.fromId : link.toId;
      var toNodeUI = renderer.getNode(toNode);
      toNodeUI.color = graphConfig.nodeConnectionColor;

      var linkUI = renderer.getLink(link.id);
      linkUI.fromColor = graphConfig.linkConnectionFromColor;
      linkUI.toColor = graphConfig.linkConnectionToColor;
    });
  }
  showNodePanel(node);
}

function resetNodeDetails() {
  graph.forEachNode(function (node) {
    var nodeUI = renderer.getNode(node.id);
    nodeUI.color = graphConfig.nodeColor;
  });
  graph.forEachLink(function (link) {
    var linkUI = renderer.getLink(link.id);
    linkUI.fromColor = graphConfig.linkFromColor;
    linkUI.toColor = graphConfig.linkToColor;
  });

  if (document.getElementById("nodePanel")) {
    document.getElementById("nodePanel").remove();
  }
}

function getGraphFromQueryString(query) {
  var graphGenerators = require("ngraph.generators");
  var createGraph = graphGenerators[query.graph] || graphGenerators.grid;
  return query.graph
    ? createGraph(getNumber(query.n), getNumber(query.m), getNumber(query.k))
    : populateGraph();
}

function getNumber(string, defaultValue) {
  var number = parseFloat(string);
  return typeof number === "number" && !isNaN(number)
    ? number
    : defaultValue || 10;
}

function populateGraph() {
  var createGraph = require("ngraph.graph");
  var g = createGraph();

  var nodes = json.nodes;
  var links = json.links;

  nodes.forEach(function (node) {
    g.addNode(node.id, node.data);
  });
  links.forEach(function (link) {
    g.addLink(link.source, link.target);
  });

  return g;
}

function intersect(from, to, r) {
  var dx = from.x - to.x;
  var dy = from.y - to.y;
  var dz = from.z - to.z;
  var r1 = Math.sqrt(dx * dx + dy * dy + dz * dz);
  var teta = Math.acos(dz / r1);
  var phi = Math.atan2(dy, dx);

  return {
    x: r * Math.sin(teta) * Math.cos(phi) + to.x,
    y: r * Math.sin(teta) * Math.sin(phi) + to.y,
    z: r * Math.cos(teta) + to.z,
  };
}

function flyTo(camera, to, radius) {
  if (!to || to.x === undefined || to.y === undefined || to.z === undefined) {
    console.error("Invalid target position:", to);
    return;
  }

  var from = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  };

  var cameraOffset = radius / Math.tan((Math.PI / 180.0) * camera.fov * 0.5);
  var cameraEndPos = intersect(from, to, cameraOffset);

  if (!cameraEndPos) {
    console.error("Failed to calculate camera end position.");
    return;
  }

  camera.position.set(to.x, to.y, to.z);
  // camera.lookAt(new THREE.Vector3(to.x, to.y, to.z));
}

function showNodePanel(node) {
  if (document.getElementById("nodePanel")) {
    document.getElementById("nodePanel").remove();
  }
  var panel = document.createElement("div");
  panel.className =
    "font-tiempos-headline absolute top-0 right-0 text-right text-red-500 p-2 mr-5 w-72 max-h-[65%] overflow-auto"; // Updated with Tailwind classes
  panel.id = "nodePanel";
  panel.innerHTML = `<h1 class="text-xl font-bold">${node.data.name}</h1>`; // Tailwind classes for h1
  if (node.data.major) {
    panel.innerHTML += `<h3 class="text-lg">${node.data.major}</h3>`; // Tailwind classes for h3
  }

  if (graph.getLinks(node.id)) {
    panel.innerHTML += `<p class="text-base">Potential connections: ${
      graph.getLinks(node.id).length
    }</p>`;
    panel.innerHTML += `<h3 class="text-lg font-semibold">Top match:</h3>`; // Tailwind classes for h3
    var topMatch = document.createElement("div");
    topMatch.className = "flex flex-col gap-2 mb-2"; // Updated with Tailwind classes
    var link = graph.getLinks(node.id)[0];
    var toNode = link.toId === node.id ? link.fromId : link.toId;
    var toNodeData = graph.getNode(toNode).data;
    topMatch.innerHTML = `<strong class="font-bold">${toNodeData.name}</strong>`; // Tailwind classes for strong
    topMatch.addEventListener("click", function () {
      showNodeDetails(graph.getNode(toNode));
    });
    panel.appendChild(topMatch);
  }

  document.body.appendChild(panel);
}

function showInitialNodePanel() {
  var panel = document.createElement("div");
  panel.style.position = "absolute";
  panel.style.top = "0";
  panel.style.right = "0";
  panel.style.color = "white";
  panel.style.padding = "10px";
  panel.style.marginRight = "20px";
  panel.style.width = "300px";
  panel.style.fontFamily = "'Tiempos Headline', sans-serif";
  panel.id = "nodePanel";
  panel.innerHTML = "<h2>Hover over a node to see more details</h2>";
  document.body.appendChild(panel);
}

function getRandomNodeId() {
  console.log(json.nodes);
  if (json.nodes.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * json.nodes.length);
  return json.nodes[randomIndex];
}

function cycleThroughNodes() {
  setInterval(() => {
    const randomNode = getRandomNodeId();
    if (randomNode) {
      showNodeDetails(randomNode);
    }
  }, 5000);
}

cycleThroughNodes();
