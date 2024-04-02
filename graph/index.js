const graphConfig = {
  nodeColor: 0xe8c6a5, // (#C6492C)
  nodeSize: 25,
  nodeHoverColor: 0xffe213, // (#ffe213)
  nodeConnectionColor: 0xffe213, // (#a9ba22)
  linkFromColor: 0x732196, // (#a33f3f)
  linkToColor: 0xc6492c, // (#35130b)
  linkConnectionFromColor: 0xffffff, // (#ffffff)
  linkConnectionToColor: 0xffe213, // (#ffe213)
  springLength: 200,
  springCoeff: 0.001,
  gravity: -10,
  theta: 0.2,
  dragCoeff: 0.3,
  timeStep: 1,
  backgroundColor: 0x0, // (Socratica Black)
};

var createSettingsView = require("config.pixel");
var query = require("query-string").parse(window.location.search.substring(1));
const json = require("../summarizedGraphData.json");
var graph = getGraphFromQueryString(query);
var renderGraph = require("ngraph.pixel");
var addCurrentNodeSettings = require("./nodeSettings.js");
var THREE = require("three");
var createLayout = require("pixel.layout");

let activateCycle = true;

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

const nodeAttendees = document.getElementById("nodeAttendees").textContent;
console.log(nodeAttendees);
document.getElementById(
  "nodeAttendees"
).textContent = `${json.nodes.length} People`;

function showNodeDetails(node) {
  if (!node) {
    return;
  }

  // Reset node and link colors
  resetNodeDetails();

  // Update node details
  document.getElementById("nodeName").textContent =
    node.data.name.toUpperCase();
  document.getElementById("nodeMajor").textContent =
    node.data.major && node.data.major != "N/A" ? node.data.major : "";
  document.getElementById("nodeConnections").textContent = `${
    graph.getLinks(node.id)?.length || 0
  } Potential Connections`;
  document.getElementById("nodeDescription").textContent = node.data.response;

  const topMatch = node.data.topMatch;
  const topMatchNode = graph.getNode(topMatch);

  const topMatchName = document.getElementById("topMatchName");
  const topMatchResponse = document.getElementById("topMatchResponse");

  if (topMatch) {
    topMatchName.textContent = topMatchNode.data.name;
    topMatchResponse.textContent = `Who ${
      topMatchNode.data.response.charAt(0).toLowerCase() +
      topMatchNode.data.response.slice(1)
    }`;
  } else {
    topMatchName.textContent = "";
    topMatchResponse.textContent = "";
  }

  // Show the panel
  document.getElementById("nodePanel").classList.remove("hidden");

  // Update node and link colors as before...
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
}

function resetNodeDetails() {
  // Hide the node panel
  document.getElementById("nodePanel").classList.add("hidden");

  // Reset node and link colors as before...
  graph.forEachNode(function (node) {
    var nodeUI = renderer.getNode(node.id);
    nodeUI.color = graphConfig.nodeColor;
  });
  graph.forEachLink(function (link) {
    var linkUI = renderer.getLink(link.id);
    linkUI.fromColor = graphConfig.linkFromColor;
    linkUI.toColor = graphConfig.linkToColor;
  });
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

function getRandomNodeId() {
  console.log(json.nodes);
  if (json.nodes.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * json.nodes.length);
  return json.nodes[randomIndex];
}

function cycleThroughNodes() {
  setInterval(() => {
    const randomNode = getRandomNodeId();
    if (randomNode && activateCycle) {
      showNodeDetails(randomNode);
    }
  }, 10000);
}

function showSearchBar() {
  if (document.getElementById("searchBarContainer")) {
    document.getElementById("searchBarContainer").remove();
  }

  var nodes = json.nodes;

  var searchBarContainer = document.createElement("div");
  searchBarContainer.id = "searchBarContainer";
  searchBarContainer.style.position = "absolute";
  searchBarContainer.style.top = "20px";
  searchBarContainer.style.right = "20px";
  searchBarContainer.style.background = "rgba(255, 255, 255, 0.2)";
  searchBarContainer.style.borderRadius = "12px";
  searchBarContainer.style.border = "1px solid rgba(255, 255, 255, 0.18)";
  searchBarContainer.style.backdropFilter = "blur(5px)";
  searchBarContainer.style.padding = "20px";
  searchBarContainer.style.width = "300px";
  searchBarContainer.style.boxSizing = "border-box";
  searchBarContainer.style.fontFamily = "'Geist', sans-serif";
  searchBarContainer.style.display = "flex";
  searchBarContainer.style.flexDirection = "column";
  searchBarContainer.style.gap = "10px";

  var input = document.createElement("input");
  input.style.padding = "10px";
  input.style.borderRadius = "8px";
  input.style.border = "none";
  input.style.background = "rgba(0, 0, 0, 0.4)";
  input.style.borderRadius = "12px";
  input.style.border = "1px solid rgba(255, 255, 255, 0.18)";
  input.style.backdropFilter = "blur(5px)";
  input.style.fontFamily = "'Geist', sans-serif";
  input.style.outlineColor = "rgba(255, 255, 255, 0.1)";
  input.style.color = "white";

  var button = document.createElement("button");
  button.style.fontFamily = "'Geist', sans-serif";
  button.textContent = "Search";
  button.style.color = "white";
  button.style.padding = "10px";
  button.style.borderRadius = "8px";
  button.style.border = "none";
  button.style.cursor = "pointer";
  button.style.background = "rgba(0, 0, 0, 0.4)";

  input.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      button.click();
    }
  });

  var resultsContainer = document.createElement("div");
  resultsContainer.id = "resultsContainer";
  resultsContainer.style.maxHeight = "150px";
  resultsContainer.style.overflowY = "auto";
  resultsContainer.style.marginTop = "10px";
  resultsContainer.style.display = "flex";
  resultsContainer.style.flexDirection = "column";
  resultsContainer.style.gap = "5px";
  resultsContainer.style.color = "white";

  searchBarContainer.appendChild(input);
  searchBarContainer.appendChild(button);
  searchBarContainer.appendChild(resultsContainer);

  document.body.appendChild(searchBarContainer);

  button.addEventListener("click", function () {
    resultsContainer.innerHTML = "";

    var query = input.value;
    var matchingIndexes = searchByNameOrSchool(nodes, query);

    matchingIndexes.forEach((index) => {
      var node = nodes.find((node) => node.id === index);
      if (node) {
        var result = document.createElement("div");
        result.innerHTML = `<strong>${node.data.name}</strong><br>${
          node.data.major != "N/A" ? node.data.major : ""
        }<br>`;
        resultsContainer.appendChild(result);
        result.style.cursor = "pointer";

        result.addEventListener("click", function () {
          var nodePosition = layout.getNodePosition
            ? layout.getNodePosition(node.id)
            : { x: 0, y: 0, z: 0 };
          activateCycle = false;
          showNodeDetails(node);
          console.log(renderer.camera());
          console.log(nodePosition);
        });
      }
    });

    if (matchingIndexes.length === 0) {
      resultsContainer.innerHTML = "<div>No results found</div>";
    }
  });
}

function searchByNameOrSchool(nodes, query) {
  const resultIds = nodes
    .filter((node) => {
      const nameMatch = node.data.name
        .toLowerCase()
        .includes(query.toLowerCase());
      return nameMatch;
    })
    .map((node) => node.id);

  return resultIds;
}

showSearchBar();

cycleThroughNodes();
