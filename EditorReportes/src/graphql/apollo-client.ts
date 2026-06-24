
import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, Observable } from "@apollo/client";
import { useAuthStore } from "../store/useAuthStore";

// const url = import.meta.env.VITE_GRAPHQL_URL;
const http = new HttpLink({ uri: import.meta.env.VITE_GRAPHQL_URL || '/graphql' });

const auth = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem("token");
    operation.setContext(({ headers = {} }) => ({
        headers: { ...headers, authorization: token ? `Bearer ${token}` : "" },
    }));
    return forward(operation);
});

const errorLink = new ApolloLink((operation, forward) => {
  return new Observable(observer => {
    const handle = forward(operation).subscribe({
      next: async (result) => {
        // Check if response has errors
        if (result.errors && result.errors.length > 0) {

            console.log("result.errors : ", result.errors)

          const isTokenExpired = result.errors.some(
            (err: any) => err.code === 'TOKEN_EXPIRED'
          );
          
          if (isTokenExpired) {
            console.log('🔄 Token expired, refreshing...');
            try {
              const { refreshToken } = useAuthStore.getState();
              const success = await refreshToken();
              
              if (success) {
                // Get new token and retry
                const newToken = localStorage.getItem('token');
                operation.setContext(({ headers = {} }) => ({
                  headers: {
                    ...headers,
                    authorization: newToken ? `Bearer ${newToken}` : '',
                  },
                }));
                
                // Retry the original request
                const retryHandle = forward(operation).subscribe({
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                });
                
                return () => retryHandle.unsubscribe();
              } else {
                // Refresh failed
                const { logout } = useAuthStore.getState();
                logout();
                observer.next(result); // Pass the original error
                observer.complete();
              }
            } catch (refreshError) {
              console.error('Refresh error:', refreshError);
              observer.next(result); // Pass the original error
              observer.complete();
            }
          } else {
            // const isEmailNotVerified = result.errors.some(
            //   (err: any) => err.code === 'EMAIL_NOT_VERIFIED' || err.message === 'Email verification required'
            // );

            // if (isEmailNotVerified) {
            //   window.dispatchEvent(new CustomEvent('auth:email_not_verified'));
            // }

            // Not a token error - pass through
            observer.next(result);
          }
        } else {
          // No errors - pass through
          observer.next(result);
        }
      },
      error: (error) => {
        // This catches NETWORK errors (offline, server down, etc.)
        console.log('🔴 NETWORK ERROR:', error);
        observer.error(error);
      },
      complete: observer.complete.bind(observer),
    });

    return () => handle.unsubscribe();
  });
});

const linkChain = ApolloLink.from([auth, errorLink, http]);

export const apolloClient = new ApolloClient({
    //link: auth.concat(http),
    link: linkChain,
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            errorPolicy: 'all',
            fetchPolicy: 'cache-first',
        },
        query: {
            errorPolicy: 'all',
            fetchPolicy: 'cache-first',
        },
        mutate: {
            errorPolicy: 'all',
        },
    },
});

