export interface RoadmapTaskData {
  manageBusinessVehicles?: boolean;
  passengerTransportSchoolBus?: boolean;
  passengerTransportSixteenOrMorePassengers?: boolean;
}

export const emptyRoadmapTaskData: RoadmapTaskData = {
  manageBusinessVehicles: undefined,
  passengerTransportSchoolBus: undefined,
  passengerTransportSixteenOrMorePassengers: undefined,
};
