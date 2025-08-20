import { combineReducers } from 'redux';
import counterReducer from './counterReducer';
import authReducer from './authReducer';
import quizReducer from './quizReducer';
import adminReducer from './adminReducer';

const rootReducer = combineReducers({
    counter: counterReducer,
    auth: authReducer,
    quiz: quizReducer,
    admin: adminReducer,
});

export default rootReducer;