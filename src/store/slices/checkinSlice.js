import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getCheckins, getUserCheckinRoles } from '../../services/api'

export const fetchCheckins = createAsyncThunk(
  'checkin/fetchCheckins',
  async (targetRole, { rejectWithValue }) => {
    try {
      const result = await getCheckins(targetRole)
      return { role: targetRole, checkins: result.checkins || [] }
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load check-ins')
    }
  }
)

export const fetchCheckinRoles = createAsyncThunk(
  'checkin/fetchCheckinRoles',
  async (_, { rejectWithValue }) => {
    try {
      const result = await getUserCheckinRoles()
      return result.roles || []
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load roles')
    }
  }
)

const checkinSlice = createSlice({
  name: 'checkin',
  initialState: {
    byRole: {},
    roles: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCheckins: (state) => {
      state.byRole = {}
      state.roles = []
      state.error = null
    },
    addLocalCheckin: (state, action) => {
      const { role, week, data } = action.payload
      if (!state.byRole[role]) {
        state.byRole[role] = []
      }
      const existing = state.byRole[role].find((c) => c.week === week)
      if (existing) {
        Object.assign(existing, data)
      } else {
        state.byRole[role].push({ week, ...data })
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCheckins.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCheckins.fulfilled, (state, action) => {
        const { role, checkins } = action.payload
        state.byRole[role] = checkins
        state.loading = false
      })
      .addCase(fetchCheckins.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
      .addCase(fetchCheckinRoles.fulfilled, (state, action) => {
        state.roles = action.payload
      })
  },
})

export const { clearCheckins, addLocalCheckin } = checkinSlice.actions
export default checkinSlice.reducer
