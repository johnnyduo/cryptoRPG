import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import store, { persistor } from './config/store';
import App from './App';
import Spinner from './components/spinner';

import 'typeface-roboto';
import 'typeface-roboto-mono';
import 'typeface-montserrat';

import './index.scss';

// supresses enormous amount of console.logs
/* global soundManager:false */
import 'react-sound';

soundManager.setup({
    debugMode: false,
    ignoreMobileRestrictions: true,
});

class ConnectedApp extends Component {
    // refresh the local storage in case the redux store structure is old
    componentDidCatch() {
        localStorage.clear();
        window.location.reload();
    }

    render() {
        return (
            <Provider store={store}>
                <PersistGate loading={<Spinner />} persistor={persistor}>
                    <App />
                </PersistGate>
            </Provider>
        );
    }
}

const container = document.getElementById('react-rpg');
const root = createRoot(container);

root.render(<ConnectedApp />);
