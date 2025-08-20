const INITIAL_STATE = {
  topics: [],
  questions: {},
  progress: [],
  loading: false,
  error: null,
};

const quizReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'QUIZ_FETCH_TOPICS_SUCCESS':
      return { ...state, topics: action.payload };
    case 'QUIZ_FETCH_QUESTIONS_SUCCESS':
      return { ...state, questions: { ...state.questions, [action.payload.topicId]: action.payload.questions } };
    case 'QUIZ_FETCH_PROGRESS_SUCCESS':
      return { ...state, progress: action.payload };
    case 'QUIZ_ADD_PROGRESS':
      return { ...state, progress: [...state.progress, action.payload] };
    default:
      return state;
  }
};

export default quizReducer;
