import { useState, useEffect } from 'react';

const CreateUser = () => {
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState('');
    const [posList, setPosList] = useState([]);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: '',
        assignedPos: '',
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
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setPosList(data);
                } else {
                    setCreateError(data.message || 'Failed to fetch POS list');
                }
            } catch (error) {
                setCreateError('An error occurred while fetching POS list');
            }
        };

        fetchPosList();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreatedUser = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError('');
        setCreateSuccess('');

        const token = localStorage.getItem('token');

        if (!token) {
            setCreateError('You must sign in to create a user.');
            setCreateLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/admin/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                setCreateSuccess('User created successfully');
                setFormData({ username: '', password: '', role: '', assignedPos: '' });
            } else {
                setCreateError(data.message || 'Failed to create user');
            }
        } catch (error) {
            setCreateError('An error occurred while creating the user');
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <div>
            <h2>Create New User</h2>
            <form onSubmit={handleCreatedUser} autoComplete="off">
                {/* Hidden inputs to prevent browser autofill */}
                <input type="text" style={{ display: 'none' }} />
                <input type="password" style={{ display: 'none' }} />
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    autoComplete="off"
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete="new-password"
                    required
                />
                <select name="role" value={formData.role} onChange={handleInputChange} required>
                    <option value="">-- Select Role --</option>
                    <option value="admin">Admin</option>
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                </select>
                <select name="assignedPos" value={formData.assignedPos} onChange={handleInputChange}>
                    <option value="">-- Select POS --</option>
                    {posList.map(pos => (
                        <option key={pos._id} value={pos._id}>{pos.name}</option>
                    ))}
                </select>
                <button type="submit" disabled={createLoading}>
                    {createLoading ? 'Creating...' : 'Create User'}
                </button>
            </form>
            {createError && <p style={{ color: 'red' }}>{createError}</p>}
            {createSuccess && <p style={{ color: 'green' }}>{createSuccess}</p>}
        </div>
    );
};

export default CreateUser;