"use client";

import graphData from "@/app/graph/graphData.json";
import { ForceGraph3D } from "react-force-graph";
import * as THREE from "three";
import { useRef, useEffect } from "react";

const NGRAPH_PHYSICS_SETTINGS = {
  timeStep: 1,
  dimensions: 3,
  gravity: -2,
  theta: 0.1,
  springLength: 110,
  springCoefficient: 0.000001,
  dragCoefficient: 0.3,
};

export const Graph = () => {
  const distance = 1400;

  const CameraOrbit = () => {
    const fgRef = useRef<any>(null);

    useEffect(() => {
      if (fgRef.current) {
        fgRef.current.cameraPosition({ z: distance });

        // camera orbit
        let angle = 0;
        setInterval(() => {
          if (fgRef.current) {
            fgRef.current.cameraPosition({
              x: distance * Math.sin(angle),
              z: distance * Math.cos(angle),
            });
            angle += Math.PI / 300;
          }
        }, 10);
      }
    }, []);

    return (
      <ForceGraph3D
        ref={fgRef}
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

  return <CameraOrbit />;
};
