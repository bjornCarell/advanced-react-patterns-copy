// Context Module Functions
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'
import {dequal} from 'dequal'

// ./context/user-context.js

import * as userClient from '../user-client'
import {useAuth} from '../auth-context'

const UserContext = React.createContext()
UserContext.displayName = 'UserContext'

const actionTypes = {
  START_UPDATE: 'START_UPDATE',
  FINNISH_UPDATE: 'FINNISH_UPDATE',
  FAIL_UPDATE: 'FAIL_UPDATE',
  RESET: 'RESET'
}

const status = {
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
}

function userReducer(state, action) {
  switch (action.type) {
    case actionTypes.START_UPDATE: {
      return {
        ...state,
        user: {...state.user, ...action.updates},
        status: status.PENDING,
        storedUser: state.user,
      }
    }
    case actionTypes.FINNISH_UPDATE: {
      return {
        ...state,
        user: action.updatedUser,
        status: status.RESOLVED,
        storedUser: null,
        error: null,
      }
    }
    case actionTypes.FAIL_UPDATE: {
      return {
        ...state,
        status: status.REJECTED,
        error: action.error,
        user: state.storedUser,
        storedUser: null,
      }
    }
    case actionTypes.RESET: {
      return {
        ...state,
        status: null,
        error: null,
      }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function UserProvider({children}) {
  const {user} = useAuth()
  const [state, dispatch] = React.useReducer(userReducer, {
    status: null,
    error: null,
    storedUser: user,
    user,
  })

  const value = [state, dispatch]
  // we expose the state and dispatch function by passing it to the value 
  // prop of the Context Provider
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

function useUser() {
  const context = React.useContext(UserContext)
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserProvider`)
  }
  return context
}

// The Helper function letting the user 
const updateUser = async (dispatch, user, updates) => {
  dispatch({type: actionTypes.START_UPDATE, updates})
  try {
    const updatedUser = await userClient.updatedUser(user, updates)
    dispatch({type: actionTypes.FINNISH_UPDATE, updatedUser})
    return updatedUser
  } catch (error) {
    dispatch({type: actionTypes.FAIL_UPDATE, error})
    throw error
  }
}

// export {UserProvider, useUser}

// src/screens/user-profile.js
// import {UserProvider, useUser} from './context/user-context'
function UserSettings() {
  const [{user, status, error}, userDispatch] = useUser()

  const isPending = status === status.PENDING
  const isRejected = status === status.REJECTED

  const [formState, setFormState] = React.useState(user)

  const isChanged = !dequal(user, formState)

  function handleChange(e) {
    setFormState({...formState, [e.target.name]: e.target.value})
  }

  function handleSubmit(event) {
    event.preventDefault()
    // Helper function in use within a consumer (UserSettings) 
    // of the User Context (useUser())
    updateUser(userDispatch, user, formState)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{marginBottom: 12}}>
        <label style={{display: 'block'}} htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          disabled
          readOnly
          value={formState.username}
          style={{width: '100%'}}
        />
      </div>
      <div style={{marginBottom: 12}}>
        <label style={{display: 'block'}} htmlFor="tagline">
          Tagline
        </label>
        <input
          id="tagline"
          name="tagline"
          value={formState.tagline}
          onChange={handleChange}
          style={{width: '100%'}}
        />
      </div>
      <div style={{marginBottom: 12}}>
        <label style={{display: 'block'}} htmlFor="bio">
          Biography
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formState.bio}
          onChange={handleChange}
          style={{width: '100%'}}
        />
      </div>
      <div>
        <button
          type="button"
          onClick={() => {
            setFormState(user)
            userDispatch({type: actionTypes.RESET})
          }}
          disabled={!isChanged || isPending}
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={(!isChanged && !isRejected) || isPending}
        >
          {isPending
            ? '...'
            : isRejected
            ? '✖ Try again'
            : isChanged
            ? 'Submit'
            : '✔'}
        </button>
        {isRejected ? <pre style={{color: 'red'}}>{error.message}</pre> : null}
      </div>
    </form>
  )
}

function UserDataDisplay() {
  const [{user}] = useUser()
  return <pre>{JSON.stringify(user, null, 2)}</pre>
}

function App() {
  return (
    <div
      style={{
        minHeight: 350,
        width: 300,
        backgroundColor: '#ddd',
        borderRadius: 4,
        padding: 10,
      }}
    >
      <UserProvider>
        <UserSettings />
        <UserDataDisplay />
      </UserProvider>
    </div>
  )
}

export default App
