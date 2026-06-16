export type DroneStatus = 'idle' | 'in_task' | 'charging' | 'maintenance' | 'offline';

export interface DroneLocation {
  lat: number;
  lng: number;
}

export interface Drone {
  id: string;
  name: string;
  model: string;
  status: DroneStatus;
  battery: number;
  currentLocation: DroneLocation;
  tankCapacity: number;
  currentLiquid: number;
  sprayRate: number;
  maxPayload: number;
  flightRange: number;
  pilotId?: string;
  pilotName?: string;
  currentTaskId?: string;
  currentPlotName?: string;
  lastMaintenanceDate: string;
  region: string;
}

export interface FlightRecord {
  id: string;
  droneId: string;
  taskId: string;
  timestamp: string;
  location: DroneLocation;
  altitude: number;
  speed: number;
  battery: number;
  liquid: number;
  sprayRate: number;
}

export interface DroneAlert {
  id: string;
  droneId: string;
  droneName: string;
  type: 'route_deviation' | 'low_liquid' | 'low_battery' | 'equipment_fault';
  level: 'warning' | 'danger';
  message: string;
  timestamp: string;
  resolved: boolean;
}
