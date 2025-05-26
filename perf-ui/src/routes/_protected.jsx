import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ context }) => {
    const { isLoading, isAuthenticated, loginWithRedirect } = context.auth;
    
    if (isLoading) {
      throw new Promise(() => {});
    }

    if (!isAuthenticated) {
      await loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });

      throw new Promise(() => {});
    }
  },
})
