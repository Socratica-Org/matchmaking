# Read from graphData.json

import json

from summarize import generate_summary


def main():
    with open("graphData.json", "r") as f:
        graph_data = json.load(f)
        nodes = graph_data["nodes"]
        links = graph_data["links"]

        # Process the new nodes by changing the response using summarize.py
        for i, node in enumerate(nodes):
            print(
                f"({i+1}/{len(nodes)}) Processing node: {node['data']['name']}")
            response = node["data"]["response"]
            new_response = generate_summary(response)

            node["data"]["response"] = new_response
            node["data"]["originalResponse"] = response

        # Write the new graph data to a new file
        with open("summarizedGraphData.json", "w") as f:
            json.dump({"nodes": nodes, "links": links}, f)


if __name__ == '__main__':
    main()
