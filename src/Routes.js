import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
import Map from './Map';

// import Profile from './components/auth/Profile';

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/" component={Map} />

      <Route exact path="/signup" component={Signup} />
      <Route exact path="/login" component={Login} />
      <Route exact path="/map" component={Map} />

      {/* <Route path="/profile" component={Profile} /> */}
    </Switch>
  );
};

export default Routes;