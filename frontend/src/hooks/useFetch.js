import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const cache = {};
const STALE_TIME = 60000; // 60 seconds

export default function useFetch(url, options = {}) {
  const cached = url && cache[url];
  const isFresh = cached && (Date.now() - cached.timestamp < STALE_TIME);

  const [data, setData] = useState(isFresh ? cached.data : null);
  const [loading, setLoading] = useState(!isFresh);
  const [error, setError] = useState(null);

  const { immediate = true } = options;

  const fetchData = useCallback(async (params = {}) => {
    setError(null);
    // Only show loading spinner if we have no cached data to display
    if (!cache[url]?.data) setLoading(true);
    try {
      const { data: response } = await api.get(url, { params });
      cache[url] = { data: response.data, timestamp: Date.now() };
      setData(response.data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (immediate && url) {
      if (isFresh) {
        // Data is fresh — still refetch silently in background
        api.get(url).then(({ data: response }) => {
          cache[url] = { data: response.data, timestamp: Date.now() };
          setData(response.data);
        }).catch(() => {});
      } else {
        fetchData();
      }
    }
  }, [immediate, fetchData, url]);

  return { data, loading, error, refetch: fetchData };
}

// Call this after mutations (create order, assign carrier, etc.) to bust cache
export function invalidateCache(urlPrefix) {
  Object.keys(cache).forEach((key) => {
    if (key.startsWith(urlPrefix)) delete cache[key];
  });
}
