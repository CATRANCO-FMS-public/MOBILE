import { getVehicleAssignments } from "@/services/vehicle/vehicleServices";
import { getAllDispatches } from "@/services/dispatch/dispatchServices";

export const fetchAssignmentsAndDispatches = async () => {
    try {
      const vehicleAssignmentsResponse = await getVehicleAssignments();
      const dispatchesResponse = await getAllDispatches();

      // Filter out dispatches with 'alley_completed' status
      const filteredDispatches = dispatchesResponse.filter((dispatch) => dispatch.status !== 'alley_completed');

      const transformedData = vehicleAssignmentsResponse.map((assignment) => {
        const dispatch = filteredDispatches.find(
          (dispatch) => dispatch.vehicle_assignment_id === assignment.vehicle_assignment_id
        );
        const status = dispatch ? dispatch.status : 'idle';
        const route = dispatch ? dispatch.route : '';
        const dispatch_logs_id = dispatch ? dispatch.dispatch_logs_id : null;

        let color = '#D3D3D3'; // Default to idle color
        if (status === 'on alley') {
          color = 'rgba(255, 165, 0, 1)';
        } else if (status === 'on road') {
          color = 'rgba(173, 255, 47, 1)';
        }

        return {
          vehicle_id: `BUS ${assignment.vehicle.vehicle_id}`,
          status,
          color,
          route,
          vehicle_assignment_id: assignment.vehicle_assignment_id,
          dispatch_logs_id,
        };
      });

      return transformedData;
    } catch (error) {
      console.error('Error fetching vehicle assignments and dispatches:', error);
    }
  };
