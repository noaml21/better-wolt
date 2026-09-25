import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../services/api';

/* The signed-in customer's own orders, for discovery (order again, the
   "you ordered here" mark) — real data from GET /orders, nothing
   inferred. A failed request gives an empty list rather than an error:
   nothing on the page depends on it. An answer that lands after the
   account changed is dropped, and what was fetched is only returned while
   the account that asked is still signed in. */

export default function useMyOrders() {
  const { isAuthenticated, user } = useAuth();
  const account = isAuthenticated ? user?.username : null;
  const [fetched, setFetched] = useState({ account: null, orders: [] });

  useEffect(() => {
    if (!account) {
      return undefined;
    }

    let current = true;

    getUserOrders()
      .then((orders) => {
        if (current) {
          setFetched({ account, orders: Array.isArray(orders) ? orders : [] });
        }
      })
      .catch(() => {});

    return () => {
      current = false;
    };
  }, [account]);

  return fetched.account === account ? fetched.orders : [];
}
