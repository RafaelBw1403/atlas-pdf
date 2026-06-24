// src/services/useGraphQL.ts
import { useState, useCallback } from 'react';
import type { DocumentNode } from '@apollo/client';
import { apolloClient } from '../graphql/apollo-client';

export const useGraphQL = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const query = useCallback(async <T = any>(
    query: DocumentNode,
    variables?: any
  ): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const result = await apolloClient.query({
        query,
        variables,
        fetchPolicy: 'cache-first',
      });
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const mutate = useCallback(async <T = any>(
    mutation: DocumentNode,
    variables?: any,
    options: { headers?: Record<string, string> } = {}
  ): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const result = await apolloClient.mutate({
        mutation,
        variables,
        context: {
          headers: options.headers
        }
      });
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    query,
    mutate,
    loading,
    error
  };
};