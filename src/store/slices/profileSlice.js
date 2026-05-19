import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getProfile } from '../../services/api'

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getProfile()
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load profile')
    }
  }
)

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearProfile: (state) => {
      state.data = null
      state.error = null
    },
    updateProfileField: (state, action) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.data = action.payload
        state.loading = false
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
  },
})

export const { clearProfile, updateProfileField } = profileSlice.actions
export default profileSlice.reducer
