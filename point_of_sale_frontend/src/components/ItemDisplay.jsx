import React, { useState } from 'react';
import { useNavigate } from 'react-router';


// This component displays the item details and allows the user to add the item to the cart.
function ItemDisplay ({ item, addToCart }) {
    const navigate = useNavigate();

    const handleAddToCart = () => {
        addToCart(item);
        navigate('/cart');
    }
    return (
        <div>
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <p>${item.price}</p>
            <button onClick={handleAddToCart}>Add to Cart</button>
        </div>
    );
}

export default ItemDisplay;