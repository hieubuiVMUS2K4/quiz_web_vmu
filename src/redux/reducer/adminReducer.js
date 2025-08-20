const INITIAL_STATE = {
  users: [],
  progress: [],
  departments: [],
  loading: false,
  error: null,
};

const adminReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'ADMIN_FETCH_SUCCESS':
      return { ...state, users: action.payload.users, progress: action.payload.progress, departments: action.payload.departments };
    default:
      return state;
  }
};

export default adminReducer;
