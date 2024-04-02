# Read from graphData.json

import json

from summarize import generate_summary


def main():
    # Get cached from attendees.json
    with open("attendees.json", "r") as f:
        attendees = json.load(f)
        # parse as dict
        attendees = dict(attendees)

    with open("graphData.json", "r") as f:
        graph_data = json.load(f)
        nodes = graph_data["nodes"]
        links = graph_data["links"]

        # Process the new nodes by changing the response using summarize.py
        for i, node in enumerate(nodes):
            # get node id
            node_name = node["data"]["name"]
            node_id = node["id"]

            print(
                f"({i+1}/{len(nodes)}) Processing node: {node_name}")
            response = node["data"]["response"]

            # If response already exists in attendees.json skip don't recompute
            if node_id in attendees:
                print(
                    f"Node {node_id}: {node_name} already exists in attendees.json")
                new_response = attendees[node_id]
            else:
                new_response = generate_summary(response)

            node["data"]["response"] = new_response
            node["data"]["originalResponse"] = response

        # Write the new graph data to a new file
        with open("summarizedGraphData.json", "w") as f:
            json.dump({"nodes": nodes, "links": links}, f)


if __name__ == '__main__':
    main()
