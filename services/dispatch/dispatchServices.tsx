import api from "@/constants/axiosInstance/axiosInstanceJSON";

// Service for starting an alley
export const startAlley = async (data: any) => {
  try {
    const response = await api.post('/user/dispatcher/dispatch_logs/alley/start', data);
    return response.data; 
  } catch (error: any) {
    console.error("Error in startAlley:", error); 
    throw error.response?.data || error.message; 
  }
};

// Service for starting a dispatch
export const startDispatch = async (data: any) => {
  try {
    const response = await api.post('/user/dispatcher/dispatch_logs/dispatch/start', data);
    return response.data;
  } catch (error: any) {
    console.error("Error in startDispatch:", error);
    throw error.response?.data || error.message;
  }
};

// Service for getting all dispatch logs
export const getAllDispatches = async () => {
  try {
    const response = await api.get('/user/dispatcher/dispatch_logs/all');
    return response.data;
  } catch (error: any) {
    console.error("Error in getAllDispatches:", error); 
    throw error.response?.data || error.message;
  }
};

// Service for getting a specific dispatch log by ID
export const getDispatchById = async (id: number) => {
  try {
    const response = await api.get(`/user/dispatcher/dispatch_logs/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error in getDispatchById:", error);
    throw error.response?.data || error.message;
  }
};

// Service for ending an alley
export const endAlley = async (id: number) => {
  try {
    const response = await api.patch(`/user/dispatcher/dispatch_logs/alley/end/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error in endAlley:", error);
    throw error.response?.data || error.message;
  }
};

// Service for ending a dispatch
export const endDispatch = async (id: number) => {
  try {
    const response = await api.patch(`/user/dispatcher/dispatch_logs/dispatch/end/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error in endDispatch:", error); 
    throw error.response?.data || error.message;
  }
};

// Service for getting all on-alley dispatches
export const getAllOnAlley = async () => {
  try {
    const response = await api.get('/user/dispatcher/dispatch_logs/alley');
    return response.data;
  } catch (error: any) {
    console.error("Error in getAllOnAlley:", error);
    throw error.response?.data || error.message;
  }
};

// Service for getting all on-road dispatches
export const getAllOnRoad = async () => {
  try {
    const response = await api.get('/user/dispatcher/dispatch_logs/road');
    return response.data;
  } catch (error: any) {
    console.error("Error in getAllOnRoad:", error);
    throw error.response?.data || error.message;
  }
};

// Service for deleting a dispatch log by ID
export const deleteDispatchRecord = async (id: number) => {
  try {
    const response = await api.delete(`/user/dispatcher/dispatch_logs/delete/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error in deleteDispatchRecord:", error);
    throw error.response?.data || error.message;
  }
};

// Service for deleting dispatch logs by date
export const deleteDispatchLogsByDate = async (date: string) => {
  try {
    const response = await api.delete(`/user/dispatcher/dispatch_logs/delete_by_date/${date}`);
    return response.data;
  } catch (error: any) {
    console.error("Error in deleteDispatchLogsByDate:", error);
    throw error.response?.data || error.message;
  }
};