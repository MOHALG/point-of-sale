import { useEffect, useState } from 'react';

const CreatedNewCategory = ({ onCreated }) => {
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState('');
    const [posList, setPosList] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        pos: '',
    });

    useEffect(() => {
        const fetchPosList = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setCreateError('You must sign in to fetch POS list.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/pos/all', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();

                if (response.ok) setPosList(data);
                else setCreateError(data.message || 'Failed to fetch POS list');
            } catch {
                setCreateError('An error occurred while fetching POS list');
            }
        };

        fetchPosList();
    }, []);

    const handleCreatedCategory = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError('');
        setCreateSuccess('');

        const token = localStorage.getItem('token');

        if (!token) {
            setCreateError('You must sign in to create a category.');
            setCreateLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/categories/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setCreateSuccess('Category created successfully');
                setFormData({ name: '', pos: '' });

                if (onCreated) {
                    onCreated(data);
                }
            } else {
                setCreateError(data.message || 'Failed to create category');
            }
        } catch (error) {
            setCreateError(error.message || 'Failed to create category');
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <main className="category-page">
            <section className="category-card">
                <div className="category-card__header">
                    <p className="category-card__eyebrow">Inventory setup</p>
                    <h2>Create New Category</h2>
                    <p className="category-card__description">
                        Create a category and assign it to a POS location so items stay organized.
                    </p>
                </div>

                <form className="category-form" onSubmit={handleCreatedCategory}>
                    <label className="field" htmlFor="name">
                        <span className="field__label">Category name</span>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Drinks"
                            required
                        />
                    </label>

                    <label className="field" htmlFor="pos">
                        <span className="field__label">POS ID</span>
                        <select className="field__select" id="pos" name="pos" value={formData.pos} onChange={(e) => setFormData({ ...formData, pos: e.target.value })} required>
                            <option value="">-- Select POS --</option>
                            {posList.map(pos => (
                                <option key={pos._id} value={pos._id}>{pos.name}</option>
                            ))}
                        </select>
                    </label>

                    <button className="category-form__submit" type="submit" disabled={createLoading}>
                        {createLoading ? 'Creating...' : 'Create Category'}
                    </button>
                </form>

                {createError && <p className="form-message form-message--error" role="alert">{createError}</p>}
                {createSuccess && <p className="form-message form-message--success">{createSuccess}</p>}
            </section>
        </main>
    );
};

export default CreatedNewCategory;
