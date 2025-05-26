import { createRouter, RouterProvider } from '@tanstack/react-router'
import { useAuth0 } from '@auth0/auth0-react'
import React from 'react'
import { routeTree } from '@/routeTree.gen'

export function RouterWithAuthContext() {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0()

  const router = React.useMemo(() => {
    return createRouter({
      routeTree,
      context: {
        auth: {
          isLoading,
          isAuthenticated,
          loginWithRedirect,
        },
      },
    })
  }, [isLoading, isAuthenticated, loginWithRedirect])

	if (isLoading) {
		return <div>Loading...</div>
	}

  return <RouterProvider router={router} />
}