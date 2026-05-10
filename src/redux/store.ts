import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../redux/UserReducer'
import chatReducer from './ChatReducer'
import profileReducer from "./ProfileReducer";

const store = configureStore({
    reducer: {
        user: userReducer,
        chat: chatReducer,
              profile: profileReducer
    }

});
export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;