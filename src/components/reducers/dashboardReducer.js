import types from "../actions";

const initialState = {
  loading: false,
  apiData: [],
  filteredApiData: [],
  filterDropDown: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.LOADING_PAGE: {
      return {
        ...state,
        loading: action.data,
      };
    }
    case types.LOAD_API_DATA: {
      return {
        ...state,
        apiData: action.data,
      };
    }
    case types.FILTERED_API_DATA: {
      return {
        ...state,
        filteredApiData: action.data,
      };
    }
    case types.FILTER_DROPDOWN: {
      return {
        ...state,
        filterDropDown: action.data,
      };
    }
  }
  return state;
};
