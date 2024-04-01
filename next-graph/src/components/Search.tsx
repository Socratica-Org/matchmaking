"use client";

import graphData from "@/graphData.json";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";

interface CustomNode {
  id: string;
  data: {
    name: string;
    major: string;
    response: string;
    topMatch: string;
    originalResponse: string;
  };
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
  const [searchResults, setSearchResults] = useState<CustomNode[]>([]);

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
    <div className="font-untitled-sans">
      <Input
        className="mt-4 font-tiempos-headline"
        placeholder="Search for a person"
        onChange={handleSearch}
      />
      <div className="mt-2 flex flex-col gap-4">
        {searchResults.map((item) => (
          <div key={item.id} className="bg-slate-50 rounded p-3">
            <h2 className="font-medium text-lg font-tiempos-headline">
              {item.data.name}
            </h2>
            <p className="">{item.data.major}</p>
            <p className="text-sm text-stone-500">{item.data.response}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
