import json

from pydantic import BaseModel

import chromadb

chroma_client = chromadb.PersistentClient(path="chromadb")
collection = chroma_client.get_collection(name="problem_prompt_embeddings")

print(collection)

N_RESULTS = 10
DISTANCE_THRESHOLD = 6


class NodeData(BaseModel):
    name: str
    major: str
    response: str


class Node(BaseModel):
    id: str
    data: NodeData


class Link(BaseModel):
    source: str
    target: str


results = collection.get(
    ids=None,  include=["metadatas", "documents", "embeddings"])
if results["embeddings"] is None or results["metadatas"] is None:
    raise ValueError("No embeddings found in the collection")

nodes: list[Node] = []
links: list[Link] = []

for i, embedding in enumerate(results["embeddings"]):
    self_id = results["ids"][i]
    self_name = results["metadatas"][i]["name"]
    self_major = results['metadatas'][i]['program']
    self_response = results['documents'][i]

    query = collection.query(
        n_results=N_RESULTS,
        query_embeddings=[embedding],
        include=["metadatas", "distances"],
        where={
            "name": {
                "$ne": self_name,
            }
        }
    )

    nearest_ids = query["ids"][0]

    if not query["distances"]:
        raise ValueError("No distances found in the query")
    distances = query["distances"][0]

    name = str(results["metadatas"][i]["name"])
    source_id = results["ids"][i]

    print(f"Processing {name}")

    new_node = Node(
        id=source_id,
        data=NodeData(
            name=name,
            response=self_response,
            major=self_major
        )
    )

    nodes.append(new_node)

    for i, distance in enumerate(distances):
        if distance < DISTANCE_THRESHOLD:
            links.append(
                Link(
                    source=source_id,
                    target=nearest_ids[i]
                )
            )

# print(nodes)
# print(links)

print("All Processed.")

with open("graphData.json", "w") as f:
    json.dump({"nodes": [n.model_dump() for n in nodes],
               "links": [l.model_dump() for l in links]}, f)
