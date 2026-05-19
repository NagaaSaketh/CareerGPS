import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getSession, signIn, signUp, signOut } from '../../services/auth'

export const fetchSession = createAsyncThunk(
  'auth/fetchSession',
  async () => {
    const session = await getSession()
    return session
  }
)

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await signIn(email, password)
      return data.session
    } catch (err) {
      return rejectWithValue(err.message || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await signUp(email, password)
      return data.session
    } catch (err) {
      return rejectWithValue(err.message || 'Registration failed')
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    await signOut()
    return null
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isLoggedIn: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearAuthError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isLoggedIn = !!action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSession.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.user = action.payload?.user || null
        state.isLoggedIn = !!action.payload
        state.loading = false
      })
      .addCase(fetchSession.rejected, (state) => {
        state.user = null
        state.isLoggedIn = false
        state.loading = false
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload?.user || null
        state.isLoggedIn = !!action.payload
        state.loading = false
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload?.user || null
        state.isLoggedIn = !!action.payload
        state.loading = false
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.isLoggedIn = false
        state.error = null
      })
  },
})

export const { clearAuthError, setUser } = authSlice.actions
export default authSlice.reducer
