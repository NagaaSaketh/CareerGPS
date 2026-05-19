import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import profileReducer from './slices/profileSlice'
import checkinReducer from './slices/checkinSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    checkin: checkinReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/fetchSession/fulfilled', 'auth/loginUser/fulfilled', 'auth/registerUser/fulfilled'],
      },
    }),
})
