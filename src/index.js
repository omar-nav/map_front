import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js';
import './index.css';
import { BrowserRouter } from 'react-router-dom';


const WithRouter = () => <BrowserRouter><App /></BrowserRouter>;
ReactDOM.render(
  <WithRouter />,
  document.getElementById('root')
);
