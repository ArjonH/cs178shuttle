import json

f = open('tripUpdates.json')
g = open('vehiclePositions.json')
trip_updates_data = json.load(f)
vehicle_positions_data = json.load(g)

# Parsing the JSON strings

# Example usage
print(trip_updates_data)
print(vehicle_positions_data)