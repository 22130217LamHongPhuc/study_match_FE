import { configureStore } from '@reduxjs/toolkit'
import { userAction } from './UserReducer';
import userReducer from '../redux/UserReducer'
import chatReducer from './ChatReducer'
const store = configureStore({
    reducer: {
        user: userReducer,
        chat: chatReducer
    }
});
export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;