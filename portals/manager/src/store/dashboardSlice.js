import { createSlice } from "@reduxjs/toolkit";

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    shipmentStatusFilter: "In Transit",
  },
  reducers: {
    setShipmentStatusFilter(state, action) {
      state.shipmentStatusFilter = action.payload;
    },
  },
});

export const { setShipmentStatusFilter } = dashboardSlice.actions;
export default dashboardSlice.reducer;
