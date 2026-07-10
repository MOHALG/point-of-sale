import React, { useEffect, useState } from 'react';
// import { useState } from 'react';

const UNIT_OPTIONS = [
    'Each',
    'Kg',
    'Gram',
    'Liter',
    'Milliliter',
    'Pack',
    'Box',
];


function CreateItem ({ onCreated }) {
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState('');
    const [posOptions, setPosOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [categoryLoading, setCategoryLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        pos: '',
        description: '',
        unitOfMeasurement: '',
        itemCategory: '',
    });

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setOptionsLoading(false);
            return;
        }

        const fetchPos = async () => {
            try {
                const response = await fetch('http://localhost:3000/pos/all', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to load POS options');
                }

                const data = await response.json();
                setPosOptions(data);
            } catch (error) {
                setCreateError(error.message || 'Failed to load POS options');
            } finally {
                setOptionsLoading(false);
            }
        };

        fetchPos();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setCategoryLoading(false);
            return;
        }

        const fetchCategories = async () => {
            setCategoryLoading(true);
            try {
                const query = formData.pos ? `?pos=${formData.pos}` : '';
                const response = await fetch(`http://localhost:3000/categories/all${query}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to load category options');
                }

                const data = await response.json();
                setCategoryOptions(data);
            } catch (error) {
                setCategoryOptions([]);
                setCreateError(error.message || 'Failed to load category options');
            } finally {
                setCategoryLoading(false);
            }
        };

        fetchCategories();
    }, [formData.pos]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'pos' ? { itemCategory: '' } : {}),
        }));
    };

    const handleCreatedItem = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError('');
        setCreateSuccess('');

        const token = localStorage.getItem('token');
        if (!token) {
            setCreateError('You must sign in to create an item.');
            setCreateLoading(false);
            return;
        }

        try {

            const response = await fetch('http://localhost:3000/items/create', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setCreateSuccess('Item created successfully');
                setFormData({
                    name: '',
                    price: '',
                    pos: '',
                    description: '',
                    unitOfMeasurement: '',
                    itemCategory: '',
                });

                if (onCreated) {
                    onCreated(data);
                }
            } else {
                setCreateError(data.message || 'Failed to create item');
            }
        } catch (error) {
            setCreateError(error.message || 'Failed to create item');
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <main className="item-page">
            <section className="item-card">
                <div className="item-card__header">
                    <p className="item-card__eyebrow">Inventory setup</p>
                    <h2>Create New Item</h2>
                    <p className="item-card__description">
                        Fill out the form below to create a new item for your point of sale.
                    </p>
                </div>
                <form className="item-form" onSubmit={handleCreatedItem}>
                    <div className="item-form__group">
                        <label htmlFor="name">Item Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="item-form__group">
                        <label htmlFor="price">Price</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            min="0"
                            step="0.01"
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="item-form__group">
                        <label htmlFor="pos">POS</label>
                        <select
                            id="pos"
                            name="pos"
                            value={formData.pos}
                            onChange={handleInputChange}
                            required
                            disabled={optionsLoading}
                        >
                            <option value="">Select a POS</option>
                            {posOptions.map((posOption) => (
                                <option key={posOption._id} value={posOption._id}>
                                    {posOption.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="item-form__group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="item-form__group">
                        <label htmlFor="unitOfMeasurement">Unit of Measurement</label>
                        <select
                            id="unitOfMeasurement"
                            name="unitOfMeasurement"
                            value={formData.unitOfMeasurement}
                            onChange={handleInputChange}
                        >
                            <option value="">Select a unit</option>
                            {UNIT_OPTIONS.map((unit) => (
                                <option key={unit} value={unit}>
                                    {unit}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="item-form__group">
                        <label htmlFor="itemCategory">Item Category</label>
                        <select
                            id="itemCategory"
                            name="itemCategory"
                            value={formData.itemCategory}
                            onChange={handleInputChange}
                            required
                            disabled={!formData.pos}
                        >
                            <option value="">{formData.pos ? 'Select a category' : 'Select a POS first'}</option>
                            {categoryOptions.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {!categoryLoading && formData.pos && categoryOptions.length === 0 && (
                            <p className="item-form__hint">No categories found for this POS. Create one first.</p>
                        )}
                    </div>
                    <button className="item-form__submit" type="submit" disabled={createLoading}>
                        {createLoading ? 'Creating...' : 'Create Item'}
                    </button>
                </form>
                {createError && <p className="form-message form-message--error" role="alert">{createError}</p>}
                {createSuccess && <p className="form-message form-message--success">{createSuccess}</p>}
            </section>
        </main>
    );
}

export default CreateItem;