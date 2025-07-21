export interface RoadmapTaskData {
  manageBusinessVehicles?: boolean;
  schoolBusPassengerTransport?: boolean;
  sixteenOrMorePassengers?: boolean;
}

export const emptyRoadmapTaskData: RoadmapTaskData = {
  manageBusinessVehicles: undefined,
  schoolBusPassengerTransport: undefined,
  sixteenOrMorePassengers: undefined,
};
