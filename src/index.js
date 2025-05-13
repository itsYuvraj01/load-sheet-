import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig"; // Make sure this file exports msalConfig
import { GoogleOAuthProvider } from '@react-oauth/google';

const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <MsalProvider instance={msalInstance}>
   <GoogleOAuthProvider clientId="211972429387-vvb7c53tk3esslnm9ceokn1g1nar43cp.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </MsalProvider>
);

reportWebVitals();

