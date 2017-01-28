import React from 'react';
import {createStore, combineReducers, applyMiddleware} from "redux"
import {Provider, connect} from "react-redux"
import createLogger from "redux-logger"
import thunk from "redux-thunk"
import * as R from "ramda"
import { IndexRoute, Router, Route, Link, browserHistory } from 'react-router'

const colors = [
  { backgroundColor: "#444"   , color: "white"   },
  { backgroundColor: "blue"   , color: "white"   },
  { backgroundColor: "cyan"   , color: "blue"    },
  { backgroundColor: "red"    , color: "white"   },
  { backgroundColor: "pink"   , color: "white"   },
  { backgroundColor: "yellow" , color: "red"     },
  { backgroundColor: "#64c7cc", color: "cyan"    },
  { backgroundColor: "#00a64d", color: "#75f0c3" },
  { backgroundColor: "#f5008b", color: "#ffdbbf" },
  { backgroundColor: "#0469bd", color: "#75d2fa" },
  { backgroundColor: "#fcf000", color: "#d60000" },
  { backgroundColor: "#010103", color: "#fa8e66" },
  { backgroundColor: "#7a2c02", color: "#fff3e6" },
  { backgroundColor: "white"  , color: "red"     },
  { backgroundColor: "#f5989c", color: "#963e03" },
  { backgroundColor: "#ed1c23", color: "#fff780" },
  { backgroundColor: "#f7f7f7", color: "#009e4c" },
  { backgroundColor: "#e04696", color: "#9c2c4b" }]

const getCurrentUser = state => R.path(state.currentUser, state)

const getEvents = state => {
  const user = getCurrentUser(state)
  return R.map(path => R.path(path, state), user.events)
}

const formatEvents = events => {
  return {
    upcoming: [events[0]],
    today: [events[1]],
    history: [events[2]]
  }
}

const getFormattedUserName = state => {
  const name = getCurrentUser(state).name
  return (name || "").replace(" ", "_")
}

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
      events: [["events", 1], ["events", 2], ["events", 3]],
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
      time: new Date("6/6/2017"),
      place: "Ft greene",
      name: "K Birthday",
      tags: [["tags", 4], ["tags", 5], ["tags", 6]]
    },
    3: {
      time: new Date("1/22/2017"),
      place: "Paulie Gee's",
      name: "Haywood's Birthday",
      tags: [["tags", 1], ["tags", 4], ["tags", 5]]
    },
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
    <div className="Mingle-logo">m:/<div className="Mingle-logoName">{props.name}/</div></div>
    <div onClick={props.createNewEvent} className="Mingle-plusSign">+</div>
  </div>

const headerMapStateToProps = state => {
  return {
    name: getFormattedUserName(state)
  }
}

const ConnectedHeader = connect(headerMapStateToProps, {createNewEvent})(Header)

const EventTags = props =>
  <div className="Mingle-tagList">
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

const EventList = props =>
  <div className="Mingle-eventList">
    <div className="Mingle-eventTitle">{props.title}</div>
    {R.map(event =>
      <div className="Mingle-eventItem" key={event.name}>
        <div>Name: {event.name}</div>
        <div>Time: {event.time.toString()}</div>
        <div className="u-displayFlex">Tags: <ConnectedEventTags tags={event.tags} /></div>
      </div>
    , props.events)}
  </div>

const UserEvents$ = props =>
  <div className="Mingle-eventsList">
    <EventList events={props.today} title="Today" />
    <EventList events={props.upcoming} title="Upcoming" />
    <EventList events={props.history} title="History" />
  </div>

const userEventsMapStateToProps = state => {
  const events = formatEvents(getEvents(state))

  return {
    ...events
  }
}

const UserEvents = connect(userEventsMapStateToProps)(UserEvents$)

const User = props =>
  <div>
    <div className="Mingle-userName">{props.params.user_id}</div>
  </div>

const userMapStateToProps = state => {
  const user = getCurrentUser(state)
  return {
    name: user.name
  }
}

const ConnectedUser = connect(userMapStateToProps)(User)

const App = props =>
  <div className="Mingle">
    <div className="Mingle-pageWrap">
      <ConnectedHeader />
      {props.children}
    </div>
    <div className="Mingle-navigation">
      <div className="Mingle-navItem">Home</div>
      <div className="Mingle-navItem">Friends</div>
      <div className="Mingle-navItem">Events</div>
      <div className="Mingle-navItem">Alerts</div>
      <div className="Mingle-navItem">Messages</div>
    </div>
  </div>

const Home$ = () =>
  <div className="Mingle-contentWrap">
    <div className="Mingle-subNav">
      <div className="Mingle-subNavItem" style={{backgroundColor: "#e04696"}}>Events</div>
      <div className="Mingle-subNavItem" style={{backgroundColor: "#ed1c23"}}>Hubs</div>
    </div>
    <UserEvents />
  </div>

const Home = connect(null)(Home$)

export default () =>
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path={"/"} component={App}>
        <IndexRoute component={Home} />
        <Route path={"/users/:user_id"} component={ConnectedUser} />
      </Route>
    </Router>
  </Provider>
