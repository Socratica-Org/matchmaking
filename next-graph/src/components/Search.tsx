"use client";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import graphData from "@/summarizedGraphData.json";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { ForceGraph2D } from "react-force-graph";
import { Input } from "./ui/input";

interface Node {
  id: string;
  data: {
    name: string;
    major: string;
    response: string;
    topMatch: string;
    originalResponse: string;
  };
}

interface CustomNode extends Node {
  links: { source: string; target: string }[];
}

// Create hashmap of id -> node and attach links to each node
const nodeMap = new Map<string, CustomNode>();
graphData.nodes.forEach((node) => {
  nodeMap.set(node.id, { ...node, links: [] });
});

graphData.links.forEach((link) => {
  const sourceNode = nodeMap.get(link.source);
  const targetNode = nodeMap.get(link.target);

  if (sourceNode) {
    sourceNode.links.push(link);
  }

  if (targetNode) {
    targetNode.links.push(link);
  }
});

export const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Node[]>([]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const results = graphData.nodes.filter((node) =>
      node.data.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  }, [searchTerm]);

  return (
    <div className="font-untitled-sans max-w-2xl">
      <Input
        className="text-lg mt-4 font-tiempos-headline"
        placeholder="Search for a person"
        onChange={handleSearch}
      />
      <div className="mt-2 flex flex-col gap-4">
        {searchResults.map((item) => {
          const currentNode = nodeMap.get(item.id);
          const neighbors = currentNode?.links.map((link) => {
            const neighborNode = nodeMap.get(
              link.source === item.id ? link.target : link.source
            );

            return neighborNode;
          });

          const graph = {
            nodes: [currentNode, ...(neighbors as CustomNode[])],
            links: currentNode?.links,
          };

          console.log(graph);

          return (
            <Dialog key={item.id}>
              <DialogTrigger
                key={item.id}
                className="bg-slate-50 rounded p-4 text-left"
              >
                <h2 className="font-medium text-lg font-tiempos-headline">
                  {item.data.name}
                </h2>
                <p className="font-tiempos-headline font-light text-stone-700">
                  {item.data.major}
                </p>
                <p className="text-sm text-stone-500">{item.data.response}</p>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] min-h-[30rem]">
                <DialogHeader>
                  <DialogTitle>Your connections</DialogTitle>
                  <DialogDescription>asdf</DialogDescription>
                </DialogHeader>
                <div className="w-full flex justify-center">
                  <ForceGraph2D
                    width={300}
                    height={300}
                    graphData={graph}
                    backgroundColor="black"
                  />
                </div>

                {/* <DialogFooter>
              <button type="submit">Save changes</button>
            </DialogFooter> */}
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
};
