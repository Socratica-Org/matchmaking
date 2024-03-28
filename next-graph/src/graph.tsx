import { renderGraph } from "ngraph.pixel";
import { useEffect, useRef } from "react";

const NODE_COLOR = 0xc6492c; // (#C6492C)
const NODE_SIZE = 15;
const NODE_HOVER_COLOR = 0xffe213; // (#ffe213)
const NODE_CONNECTION_COLOR = 0xaab172; // (#AAB172)
const LINK_FROM_COLOR = 0x732196; // (#732196)
const LINK_TO_COLOR = 0xc6492c; // (#C6492C)
const LINK_CONNECTION_FROM_COLOR = 0xffffff; // (#ffffff)
const LINK_CONNECTION_TO_COLOR = 0xffe213; // (#ffe213)
const SPRING_LENGTH = 110;
const SPRING_COEFF = 0.000001;
const GRAVITY = -2;
const THETA = 0.1;
const DRAG_COEFF = 0.3;
const TIME_STEP = 1;

export default function Graph() {
  const graph = getGraphFromQueryString();
  const graphRef = useRef(null);

  useEffect(() => {
    const renderer = renderGraph(graph, {
      node: () => {
        return {
          color: NODE_COLOR,
          size: NODE_SIZE,
        };
      },
      link: () => {
        return {
          fromColor: LINK_FROM_COLOR,
          toColor: LINK_TO_COLOR,
        };
      },
    });

    const simulator = renderer.layout().simulator;
    simulator.springLength(SPRING_LENGTH);
    simulator.springCoeff(SPRING_COEFF);
    simulator.gravity(GRAVITY);
    simulator.theta(THETA);
    simulator.dragCoeff(DRAG_COEFF);
    simulator.timeStep(TIME_STEP);
    renderer.focus();

    const settingsView = createSettingsView(renderer);
    const gui = settingsView.gui();

    const nodeSettings = addCurrentNodeSettings(gui, renderer);

    renderer.on("nodehover", showNodeDetails);
    renderer.on("nodeclick", resetNodeDetails);

    return () => {
      // Clean up any event listeners or other side effects here
    };
  }, []);

  return <div ref={graphRef} />;
}
