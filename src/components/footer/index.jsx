import React from 'react';

import { version } from '../../../package.json';

import './styles.scss';

const Footer = () => {
    return (
        <div className="footer__container">
            <span>{`Made with ♥ by DokaJuno - v${version}`}</span>
        </div>
    );
};

export default Footer;
