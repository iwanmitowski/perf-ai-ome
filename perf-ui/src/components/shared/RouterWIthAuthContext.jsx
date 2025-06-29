import { createRouter, RouterProvider } from "@tanstack/react-router";
import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { routeTree } from "@/routeTree.gen";
import { PageLoader } from "../ui/loader";

export function RouterWithAuthContext() {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

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
    });
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading) {
    return <PageLoader />;
  }

  return <RouterProvider router={router} />;
}
