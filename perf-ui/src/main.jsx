import React, { StrictMode } from 'react'
import './index.css'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { RouterWithAuthContext } from './components/shared/RouterWIthAuthContext'

const rootElement = document.getElementById('root')
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <Auth0Provider
        domain="dev-ziypwwv0hncggsaq.us.auth0.com"
        clientId="eCqJ9k1ztew4a9hT33GkcdX2YvBwQTsh"
        authorizationParams={{
          redirect_uri: window.location.origin
        }}
      >
        <RouterWithAuthContext />
      </Auth0Provider>
    </StrictMode>,
  )
}

