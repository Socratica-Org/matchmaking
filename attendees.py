import json

def read_graph_data(filename):
    with open(filename, 'r') as file:
        data = json.load(file)
    return data

def extract_responses(graph_data):
    attendees = {}
    for node in graph_data['nodes']:
        node_id = node['id']
        response = node['data']['response']
        attendees[node_id] = response
    return attendees

def write_attendees(attendees_data, filename):
    with open(filename, 'w') as file:
        json.dump(attendees_data, file, indent=4)

def main():
    graph_data = read_graph_data('summarizedGraphData.json')
    attendees_data = extract_responses(graph_data)
    write_attendees(attendees_data, 'attendees.json')

if __name__ == "__main__":
    main()
