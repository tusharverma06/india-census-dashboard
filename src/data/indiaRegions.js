// Region definitions for BFS graph traversal
export const REGION_GRAPH = {
  'Delhi-North':   ['Delhi-South', 'Haryana-North', 'UP-West'],
  'Delhi-South':   ['Delhi-North', 'Haryana-South', 'UP-West'],
  'Mumbai-West':   ['Mumbai-East', 'Pune', 'Thane'],
  'Mumbai-East':   ['Mumbai-West', 'Thane', 'Navi-Mumbai'],
  'Chennai-South': ['Chennai-North', 'Coimbatore', 'Madurai'],
  'Chennai-North': ['Chennai-South', 'Vellore', 'Tiruvallur'],
  'Kolkata-East':  ['Kolkata-West', 'Howrah', 'North-24-Parganas'],
  'Kolkata-West':  ['Kolkata-East', 'South-24-Parganas', 'Hooghly'],
  'Pune':          ['Mumbai-West', 'Ahmednagar', 'Satara'],
  'Thane':         ['Mumbai-East', 'Mumbai-West', 'Navi-Mumbai'],
  'Navi-Mumbai':   ['Mumbai-East', 'Thane', 'Raigad'],
  'Haryana-North': ['Delhi-North', 'Haryana-South', 'Rohtak'],
  'Haryana-South': ['Delhi-South', 'Haryana-North', 'Faridabad'],
  'UP-West':       ['Delhi-North', 'Delhi-South', 'Ghaziabad'],
  'Bangalore':     ['Mysore', 'Mandya', 'Tumkur'],
  'Hyderabad':     ['Secunderabad', 'Rangareddy', 'Medak']
}

export const REGION_TARGETS = {
  'Delhi-North': 125,
  'Mumbai-West': 125,
  'Chennai-South': 125,
  'Kolkata-East': 125,
  'Delhi-South': 100,
  'Mumbai-East': 100,
  'Chennai-North': 100,
  'Kolkata-West': 100
}

// State ID mappings for SVG map
export const STATE_MAP = {
  'Delhi': ['Delhi-North', 'Delhi-South'],
  'Maharashtra': ['Mumbai-West', 'Mumbai-East', 'Pune', 'Thane', 'Navi-Mumbai'],
  'Tamil Nadu': ['Chennai-South', 'Chennai-North'],
  'West Bengal': ['Kolkata-East', 'Kolkata-West'],
  'Haryana': ['Haryana-North', 'Haryana-South'],
  'Uttar Pradesh': ['UP-West'],
  'Karnataka': ['Bangalore'],
  'Telangana': ['Hyderabad']
}
