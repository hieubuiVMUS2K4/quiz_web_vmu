const INITIAL_STATE = {
  user: null,
  loading: false,
  error: null,
};

const authReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'AUTH_LOGIN_REQUEST':
      return { ...state, loading: true, error: null };
    case 'AUTH_LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload };
    case 'AUTH_LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'AUTH_LOGOUT':
      return { ...state, user: null };
    default:
      return state;
  }
};

export default authReducer;
