"use client";
import graphData from "@/graph/graphData.json";
import { ForceGraph3D } from "react-force-graph";
import * as THREE from "three";

const NGRAPH_PHYSICS_SETTINGS = {
  timeStep: 3,
  dimensions: 3,
  gravity: -42,
  theta: 0.8,
  springLength: 110,
  springCoefficient: 0.00111,
  dragCoefficient: 0.154,
};

export const Graph = () => {
  return (
    <ForceGraph3D
      graphData={graphData}
      nodeLabel={(node) => node.data.name}
      enableNodeDrag={true}
      enableNavigationControls={true}
      controlType="fly"
      forceEngine="ngraph"
      ngraphPhysics={NGRAPH_PHYSICS_SETTINGS}
      nodeThreeObject={({ id }) =>
        new THREE.Mesh(
          new THREE.SphereGeometry(2),
          new THREE.MeshLambertMaterial({
            color: Math.round(Math.random() * Math.pow(2, 24)),
            transparent: true,
            opacity: 0.75,
          })
        )
      }
    />
  );
};
