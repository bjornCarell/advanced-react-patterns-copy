// Flexible Compound Components
// http://localhost:3000/isolated/exercise/03.js

import * as React from 'react'
import {Switch} from '../switch'

const ToggleContext = React.createContext(null)
// To display our name of the Context in the React tools
// otherwise we just see Context.Provider
ToggleContext.displayName = 'ToggleContext'

function Toggle({children}) {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  // Maybe the most important use case of Context!
  // By using Context here we get so much flexibility. 
  // Context let us pass state implicitly, no matter the depth of our DOM tree
  return (
    <ToggleContext.Provider value={{on, toggle}}>
      {children}
    </ToggleContext.Provider>
  )
}

const useToggle = () => {
  const context = React.useContext(ToggleContext)

  if (!context) {
    throw new Error(
      'useToggle needs to be rendered within a <Toggle/>',
    )
  }

  return context
}

// All our children consume our ToggleContext
function ToggleOn({children}) {
  const {on} = useToggle()
  return on ? children : null
}

function ToggleOff({children}) {
  const {on} = useToggle()
  return on ? null : children
}

function ToggleButton(props) {
  const {on, toggle} = useToggle()
  return <Switch on={on} onClick={toggle} {...props} />
}

function App() {
  return (
    <div>
      <Toggle>
        <ToggleOn>The button is on</ToggleOn>
        <ToggleOff>The button is off</ToggleOff>
        <div>
          {/* Again: Context let us pass state implicitly, 
          no matter the depth of our DOM tree! */ }
          <ToggleButton />
        </div>
      </Toggle>
    </div>
  )
}

export default App

/*
eslint
  no-unused-vars: "off",
*/
