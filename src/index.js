import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ProductList from './ProductList'
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<div> <ProductList /> </div>, document.getElementById('content'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

if(module.hot) { module.hot.accept(); }