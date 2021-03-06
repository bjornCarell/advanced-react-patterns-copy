// Control Props
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
import warning from 'warning'
import {Switch} from '../switch'

const callAll =
  (...fns) =>
  (...args) =>
    fns.forEach(fn => fn?.(...args))

const actionTypes = {
  toggle: 'toggle',
  reset: 'reset',
}

// HOOK
const useControlledSwitchWarning = (
  controlPropValue,
  onChange,
  controlPropName = '',
  componentName = '',
) => {
  let isControlled = controlPropValue != null
  let {current: wasControlled} = React.useRef(isControlled)

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      warning(
        !(!isControlled && wasControlled),
        `${componentName} is changing a controlled input of type undefined to be uncontrolled. ${componentName} should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled ${componentName} for the lifetime of the component. Check the \`${controlPropName}\` prop being passed in.`,
      )
      warning(
        !(isControlled && !wasControlled),
        `${componentName} is changing an uncontrolled input of type undefined to be controlled. ${componentName} should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled ${componentName} for the lifetime of the component. Check the \`${controlPropName}\` prop being passed in.`,
      )
      warning(
        !(isControlled && !onChange),
        'Failed prop type: You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.',
      )
    }
  }, [
    controlPropValue,
    componentName,
    controlPropName,
    onChange,
    isControlled,
    wasControlled,
  ])
}

// 
function toggleReducer(state, {type, initialState}) {
  switch (type) {
    case actionTypes.toggle: {
      return {on: !state.on}
    }
    case actionTypes.reset: {
      return initialState
    }
    default: {
      throw new Error(`Unsupported type: ${type}`)
    }
  }
}

// HOOK
function useToggle({
  onChange,
  on: controlledOn,
  initialOn = false,
  reducer = toggleReducer,
} = {}) {
  const {current: initialState} = React.useRef({on: initialOn})
  const [state, dispatch] = React.useReducer(reducer, initialState)

  const onIsControlled = controlledOn != null
  const on = onIsControlled ? controlledOn : state.on

  useControlledSwitchWarning(controlledOn, onChange, 'on', 'useToogle',)

  const dispatchWithOnChange = action => {
    // We only want to call the dispatch fn if we are not controlled
    // The dispatch fn will trigger a re-render of the component
    // If the component is controlled we might not want that
    if (!onIsControlled) {
      dispatch(action)
    }
      // We call the onChange fn with the state we are transitioning to
      // To get the state we are transitioning to, we need the reducer fn
      // We update state with our suggested state change, which here is "on"
      // and with the action triggering the state change
      onChange?.(reducer({...state, on}, action), action)
  }

  const toggle = () => dispatchWithOnChange({type: actionTypes.toggle})
  const reset = () =>
    dispatchWithOnChange({type: actionTypes.reset, initialState})

  function getTogglerProps({onClick, ...props} = {}) {
    return {
      'aria-pressed': on,
      onClick: callAll(onClick, toggle),
      ...props,
    }
  }

  function getResetterProps({onClick, ...props} = {}) {
    return {
      onClick: callAll(onClick, reset),
      ...props,
    }
  }

  return {
    on,
    reset,
    toggle,
    getTogglerProps,
    getResetterProps,
  }
}

//
function Toggle({on: controlledOn, onChange}) {
  const {on, getTogglerProps} = useToggle({on: controlledOn, onChange})
  const props = getTogglerProps({on})
  return <Switch {...props} />
}

//
function App() {
  const [bothOn, setBothOn] = React.useState(false)
  const [timesClicked, setTimesClicked] = React.useState(0)

  function handleToggleChange(state, action) {
    if (action.type === actionTypes.toggle && timesClicked > 4) {
      return
    }
    setBothOn(state.on)
    setTimesClicked(c => c + 1)
  }

  function handleResetClick() {
    setBothOn(false)
    setTimesClicked(0)
  }

  return (
    <div>
      <div>
        <Toggle on={bothOn} onChange={handleToggleChange} />
        <Toggle on={bothOn} onChange={handleToggleChange} />
      </div>
      {timesClicked > 4 ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      )}
      <button onClick={handleResetClick}>Reset</button>
      <hr />
      <div>
        <div>Uncontrolled Toggle:</div>
        <Toggle
          onChange={(...args) =>
            console.info('Uncontrolled Toggle onChange', ...args)
          }
        />
      </div>
    </div>
  )
}

export default App
// we're adding the Toggle export for tests
export {Toggle}

/*
eslint
  no-unused-vars: "off",
*/
