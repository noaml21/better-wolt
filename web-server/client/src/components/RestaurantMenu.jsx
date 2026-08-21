// קומפוננטה טיפשה (Dumb Component) - רק מציגה נתונים ומפעילה אירועים
const RestaurantMenu = ({ products, onAddToCart }) => {
  if (!products || products.length === 0) {
    return <p>אין מוצרים בתפריט כרגע.</p>;
  }

  return (
    <div className="menu-grid">
      {products.map((product) => (
        <div key={product.id} className="menu-card">
          <div className="menu-info">
            <h3>{product.name}</h3>
            {product.description && <p className="menu-desc">{product.description}</p>}
            <span className="menu-price">₪{product.price}</span>
          </div>
          <button 
            className="add-btn"
            onClick={() => onAddToCart(product)}
          >
            + הוסף
          </button>
        </div>
      ))}
    </div>
  );
};

export default RestaurantMenu;