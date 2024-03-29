import json

from pydantic import BaseModel

import chromadb

N_RESULTS = 10
DISTANCE_THRESHOLD = 1.2
COLLECTION_TO_PROCESS = "time_prompt_embeddings"


class NodeData(BaseModel):
    name: str
    major: str
    response: str
    topMatch: str


class Node(BaseModel):
    id: str
    data: NodeData


class Link(BaseModel):
    source: str
    target: str


def process_collection(collection: chromadb.Collection, nodes: list[Node], links: list[Link]):
    results = collection.get(
        ids=None,  include=["metadatas", "documents", "embeddings"])
    if results["embeddings"] is None or results["metadatas"] is None:
        raise ValueError("No embeddings found in the collection")

    for i, embedding in enumerate(results["embeddings"]):
        self_id = results["ids"][i]
        self_name = results["metadatas"][i]["name"]
        self_major = results['metadatas'][i]['program']
        self_response = results['documents'][i]

        query = collection.query(
            n_results=N_RESULTS,
            query_embeddings=[embedding],
            include=["metadatas", "distances", "documents"],
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

        print(
            f"{i+1}/{len(results['embeddings'])}: Processing {name} ({self_major})")

        top_match = nearest_ids[0] if distances[0] < DISTANCE_THRESHOLD else ""

        new_node = Node(
            id=self_id,
            data=NodeData(
                name=name,
                response=self_response,
                major=self_major,
                topMatch=top_match
            )
        )

        nodes.append(new_node)

        # Always add the links
        for i, distance in enumerate(distances):
            if distance < DISTANCE_THRESHOLD:
                links.append(
                    Link(
                        source=self_id,
                        target=nearest_ids[i]
                    )
                )


def main():
    chroma_client = chromadb.PersistentClient(path="chromadb")
    nodes: list[Node] = []
    links: list[Link] = []
    collection = chroma_client.get_collection(COLLECTION_TO_PROCESS)

    process_collection(collection, nodes, links)

    print(f"Graph constructed from collection: {COLLECTION_TO_PROCESS}")

    with open("graphData.json", "w") as f:
        json.dump({"nodes": [n.model_dump() for n in nodes],
                   "links": [l.model_dump() for l in links]}, f)


if __name__ == '__main__':
    main()
