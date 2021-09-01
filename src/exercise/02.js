// Compound Components
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {Switch} from '../switch'

function Toggle(props) {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  // 📜 https://reactjs.org/docs/react-api.html#reactchildren
  return React.Children.map(props.children, child => {
    // this statement lets the user add DOM elements within the Toggle
    // component as in the example below  <span> Hello</span>
    // comment out this statement to see error message in the console
    if (typeof child.type === 'string') {
      return child
    }
    // for each child of the props.children we return a copy
    // we pass whatever props we want to pass to the children
    return React.cloneElement(child, {on, toggle})
    // 📜 https://reactjs.org/docs/react-api.html#cloneelement
  })
}

const ToggleOn = ({on, children}) => (on ? children : null)
const ToggleOff = ({on, children}) => (on ? null : children)

const ToggleButton = props => {
  return <Switch on={props.on} onClick={props.toggle} />
}

// We get state implicitly passed to all children
// of the Toggle component
function App() {
  return (
    <div>
      <Toggle>
        <ToggleOn>The button is on</ToggleOn>
        <ToggleOff>The button is off</ToggleOff>
        <span> Hello</span>
        <ToggleButton />
      </Toggle>
    </div>
  )
}

export default App

/*
eslint
  no-unused-vars: "off",
*/
