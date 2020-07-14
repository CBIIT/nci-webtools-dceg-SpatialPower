import { reducer as messagesReducer } from './messages';
import { reducer as paramsReducer } from './params';
import { reducer as resultsReducer } from './results';
import { configureStore } from '@reduxjs/toolkit';

// provide rootReducer as an object of slice reducers
export const store = configureStore({
    reducer: {
        messages: messagesReducer,
        params: paramsReducer,
        results: resultsReducer,
    },
})
