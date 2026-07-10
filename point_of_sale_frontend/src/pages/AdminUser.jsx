import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
// Component to update a user
const UpdateUser = ({ userId, userName, onUpdated }) => {
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');
    const [posList, setPosList] = useState([]);
    const [formData, setFormData] = useState({
        role: '',
        assignedPos: '',
    });

    useEffect(() => {
        const fetchPosList = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const response = await fetch('http://localhost:3000/pos/all', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) setPosList(data);
            } catch (error) {
                console.error('Failed to fetch POS list', error);
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

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        setUpdateError('');
        setUpdateSuccess('');

        const token = localStorage.getItem('token');
        
        if (!token) {
            setUpdateError('You must sign in to update a user.');
            setUpdateLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                setUpdateSuccess('User updated successfully');
                if (onUpdated) {
                    onUpdated(data);
                }
            } else {
                setUpdateError(data.message || 'Failed to update user');
            }
        } catch (error) {
            setUpdateError('An error occurred while updating the user');
        } finally {
            setUpdateLoading(false);
        }
    };

    return (
        <div style={styles.card}>
            <h3 style={styles.heading}>Update User: <strong>{userName}</strong></h3>
            <form onSubmit={handleUpdateUser} style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Role</label>
                    <select name="role" value={formData.role} onChange={handleInputChange} style={styles.select}>
                        <option value="">-- Select Role --</option>
                        <option value="admin">Admin</option>
                        <option value="cashier">Cashier</option>
                        <option value="manager">Manager</option>
                    </select>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Assigned POS</label>
                    <select name="assignedPos" value={formData.assignedPos} onChange={handleInputChange} style={styles.select}>
                        <option value="">-- Select POS --</option>
                        {posList.map(pos => (
                            <option key={pos._id} value={pos._id}>{pos.name}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" disabled={updateLoading} style={styles.submitButton}>
                    {updateLoading ? 'Updating...' : 'Update User'}
                </button>
            </form>
            {updateError && <p style={styles.error}>{updateError}</p>}
            {updateSuccess && <p style={styles.success}>{updateSuccess}</p>}
        </div>
    );
};
// Delete user component
const DeleteUser = ({ userId, userName, onDeleted }) => {
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');
    const navigate = useNavigate();

    const handleDeleteUser = async () => {
        setDeleteLoading(true);
        setDeleteError('');
        setDeleteSuccess('');

        const token = localStorage.getItem('token');
        if (!token) {
            setDeleteError('You must sign in to delete a user.');
            setDeleteLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setDeleteSuccess('User deleted successfully');
                if (onDeleted) onDeleted();
                setTimeout(() => {
                    navigate('/admin/users');
                }, 1500);
            } else {
                setDeleteError(data.message || 'Failed to delete user');
            }
        } catch (error) {
            setDeleteError('An error occurred while deleting the user');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div style={styles.card}>
            <h3 style={styles.heading}>Delete User: <strong>{userName}</strong></h3>
            <p style={styles.warning}>⚠️ This action cannot be undone.</p>
            <button
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                style={styles.deleteButton}
            >
                {deleteLoading ? 'Deleting...' : 'Delete User'}
            </button>
            {deleteError && <p style={styles.error}>{deleteError}</p>}
            {deleteSuccess && <p style={styles.success}>{deleteSuccess}</p>}
        </div>
    );
};


// Main Admin User Page Component — shows update/delete for selected user
const AdminUser = () => {
    const { id } = useParams();
    const [selectedUserId, setSelectedUserId] = useState(id || '');
    const [userName, setUserName] = useState('');
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const fetchUserName = async () => {
            if (!selectedUserId) return;
            
            const token = localStorage.getItem('token');
            if (!token) {
                setLoadingUser(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:3000/admin/users/${selectedUserId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    setUserName(data.username);
                }
            } catch (error) {
                console.error('Failed to fetch user', error);
            } finally {
                setLoadingUser(false);
            }
        };
        fetchUserName();
    }, [selectedUserId]);

    if (loadingUser) return <div style={styles.container}><p>Loading...</p></div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.mainHeading}>User Management</h2>

            {selectedUserId && (
                <div>
                    <UpdateUser userId={selectedUserId} userName={userName} onUpdated={() => setSelectedUserId('')} />
                    <DeleteUser userId={selectedUserId} userName={userName} onDeleted={() => setSelectedUserId('')} />
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '700px',
        margin: '40px auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    mainHeading: {
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '30px',
        color: '#2C3E50',
        textAlign: 'center',
    },
    card: {
        background: '#fff',
        border: '2px solid #FF8C42',
        borderRadius: '8px',
        padding: '25px',
        marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(231, 76, 60, 0.15)',
    },
    heading: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#2C3E50',
        borderBottom: '3px solid #FF8C42',
        paddingBottom: '10px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2C3E50',
    },
    select: {
        padding: '10px',
        fontSize: '14px',
        border: '2px solid #FF8C42',
        borderRadius: '4px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        transition: 'border-color 0.3s',
    },
    submitButton: {
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#fff',
        backgroundColor: '#E74C3C',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.3s',
    },
    deleteButton: {
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#fff',
        backgroundColor: '#FF8C42',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    warning: {
        color: '#E74C3C',
        fontSize: '14px',
        marginBottom: '15px',
        fontWeight: '500',
    },
    error: {
        color: '#DC3545',
        fontSize: '14px',
        marginTop: '10px',
        fontWeight: '500',
    },
    success: {
        color: '#28a745',
        fontSize: '14px',
        marginTop: '10px',
        fontWeight: '500',
    },
};

export default AdminUser;

