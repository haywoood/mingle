import React from 'react';
import {createStore, combineReducers, applyMiddleware} from "redux"
import {Provider, connect} from "react-redux"
import createLogger from "redux-logger"
import thunk from "redux-thunk"
import * as R from "ramda"

const getCurrentUser = state => R.path(state.currentUser, state)

const CREATE_NEW_EVENT = "CREATE_NEW_EVENT"
const createNewEvent = () => {
  return {
    type: CREATE_NEW_EVENT
  }
}

const initialState = {
  creatingNewEvent: false,
  currentUser: ["people", 1],
  people: {
    1: {
      name: "Ryan Haywood",
      email: "ryanhaywoodj@gmail.com",
      hubs: [["hubs", 1], ["hubs", 2], ["hubs", 3]],
      events: [["events", 1], ["events", 2]],
      friends: [["people", 2]]
    }
  },
  tags: {
    1: {name: "soccer"},
    2: {name: "games"},
    3: {name: "driving"},
    4: {name: "checkers"},
    5: {name: "beer"},
    6: {name: "weed"}
  },
  hubs: {
    1: {name: "Bovios", address: "125 Green St Brookyn"},
    2: {name: "Haywoods", address: "163 Lafayette Brookyn"},
  },
  events: {
    1: {
      time: new Date(),
      hub: ["hubs", 1],
      name: "New Years",
      tags: [["tags", 1], ["tags", 2], ["tags", 3]]
    },
    2: {
      time: new Date(),
      place: "Ft greene",
      name: "OA",
      tags: [["tags", 4], ["tags", 5], ["tags", 6]]
    }
  }
}

const AppReducer = (state, action) => {
  if (state === undefined) {
    state = initialState
  }

  switch (action.type) {
    case CREATE_NEW_EVENT:
      state.creatingNewEvent = true
      return state

    default:
      return state
  }
}

const store = createStore(AppReducer, applyMiddleware(thunk, createLogger))

import './App.css'

const Header = props =>
  <div className="Mingle-header" style={{display: "flex", justifyContent: "space-between"}}>
    <div className="Mingle-logo">mingle</div>
    <div style={{display: "flex"}}>
      <div onClick={props.createNewEvent} className="Mingle-plusSign">+</div>
      <input className="Mingle-search" placeholder="Search hubs" />
      </div>
  </div>

const ConnectedHeader = connect(null, {createNewEvent})(Header)

const EventTags = props =>
  <div>
    {R.map(tag =>
      <div className="Mingle-tag" key={tag.name}>{tag.name}</div>
    , props.tags)}
  </div>

const eventTagsMSTP = (state, props) => {
  const tags = R.map(path => R.path(path, state), props.tags)
  return {
    tags
  }
}

const ConnectedEventTags = connect(eventTagsMSTP)(EventTags)

const UserEvents = props =>
  <div className="Mingle-eventsList">
    <h1>Events</h1>
    {R.map(event =>
      <div key={event.name}>
        <ul>
          <li>Name: {event.name}</li>
          <li>Time: {event.time.toString()}</li>
          <li>Tags: <ConnectedEventTags tags={event.tags} /></li>
        </ul>
      </div>
    , props.events)}
  </div>

const userEventsMapStateToProps = state => {
  const user = getCurrentUser(state)
  const events = R.map(path => R.path(path, state), user.events)

  return {
    events
  }
}

const ConnectedUserEvents = connect(userEventsMapStateToProps)(UserEvents)

const User = props =>
  <div>
    <div className="Mingle-userName">{props.name}</div>
    <ConnectedUserEvents />
  </div>

const userMapStateToProps = state => {
  const user = getCurrentUser(state)
  return {
    name: user.name
  }
}

const ConnectedUser = connect(userMapStateToProps)(User)

const App = () =>
  <div className="Mingle">
    <ConnectedHeader />
    <ConnectedUser />
  </div>

console.log(store.getState())

export default () =>
  <Provider store={store}><App /></Provider>
