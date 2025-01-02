import api from "@/constants/axiosInstance/axiosInstanceJSON";

// Service for getting all overspeed records
export const getAllOverspeedRecords = async () => {
  try {
    const response = await api.get('/user/dispatcher/overspeed_tracking/all');
    return response.data;
  } catch (error: any) {
    console.error("Error in getAllOverspeedRecords:", error);
    throw error.response?.data || error.message;
  }
};

// Service for creating a new overspeed record
export const createOverspeedRecord = async (data: any) => {
  try {
    const response = await api.post('/user/dispatcher/overspeed_tracking/create', data);
    return response.data;
  } catch (error: any) {
    console.error("Error in createOverspeedRecord:", error);
    throw error.response?.data || error.message;
  }
};

// Service for deleting an overspeed record
export const deleteOverspeedRecord = async (id: number) => {
  try {
    const response = await api.delete(`/user/dispatcher/overspeed_tracking/delete/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error in deleteOverspeedRecord:", error);
    throw error.response?.data || error.message;
  }
};

// Service for deleting overspeed records by date
export const deleteOverspeedRecordsByDate = async (date: string) => {
  try {
    const response = await api.delete(`/user/dispatcher/overspeed_tracking/delete_by_date/${date}`);
    return response.data;
  } catch (error: any) {
    console.error("Error in deleteOverspeedRecordsByDate:", error);
    throw error.response?.data || error.message;
  }
};
