import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

const CartContext = createContext(null);

function getEntityId(entity) {
  const id = entity?.id || entity?._id;

  return id ? String(id) : null;
}

export function CartProvider({ children }) {
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);

  const addToCart = (
    product,
    selectedRestaurant
  ) => {
    const productId = getEntityId(product);
    const selectedRestaurantId =
      getEntityId(selectedRestaurant);
    const currentRestaurantId =
      getEntityId(restaurant);

    if (!productId || !selectedRestaurantId) {
      return false;
    }

    if (
      currentRestaurantId &&
      currentRestaurantId !==
        selectedRestaurantId
    ) {
      return false;
    }

    setRestaurant({
      ...selectedRestaurant,
      id:
        selectedRestaurant.id ||
        selectedRestaurant._id,
    });

    setItems((currentItems) => {
      const existingItem =
        currentItems.find(
          (item) =>
            getEntityId(item) === productId
        );

      if (existingItem) {
        return currentItems.map((item) =>
          getEntityId(item) === productId
            ? {
                ...item,
                quantity:
                  Number(item.quantity || 0) +
                  1,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          id: product.id || product._id,
          quantity: 1,
        },
      ];
    });

    return true;
  };

  const removeFromCart = (productId) => {
    const normalizedProductId =
      String(productId);

    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          getEntityId(item) !==
          normalizedProductId
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurant(null);
  };

  const itemsCount = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity || 0),
        0
      ),
    [items]
  );

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          Number(item.price || 0) *
            Number(item.quantity || 0),
        0
      ),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        restaurant,
        items,
        itemsCount,
        total,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used inside CartProvider'
    );
  }

  return context;
}