import { useState, useEffect } from 'react';
import { Link } from 'react-router';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must sign in to view users.');
                setLoading(false);
                return;
            }
            try {
                const response = await fetch('http://localhost:3000/admin/users/all', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setUsers(data);
                } else {
                    setError(data.message || 'Failed to fetch users');
                }
            } catch (error) {
                setError('An error occurred while fetching users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <div style={styles.container}><p>Loading users...</p></div>;
    if (error) return <div style={styles.container}><p style={styles.error}>{error}</p></div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.mainHeading}>User Management</h2>
            <Link to="/admin/users/create" style={{ textDecoration: 'none' }}>
                <button style={styles.createButton}>+ Create New User</button>
            </Link>
            <div style={styles.userList}>
                {users.map((user) => (
                    <Link
                        key={user._id}
                        to={`/admin-user/${user._id}`}
                        style={{ textDecoration: 'none' }}
                    >
                        <div style={styles.userCard}>
                            <div style={styles.userInfo}>
                                <span style={styles.username}>{user.username}</span>
                                <span style={styles.role}>{user.role}</span>
                            </div>
                            <span style={styles.arrow}>→</span>
                        </div>
                    </Link>
                ))}
            </div>
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
    createButton: {
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#fff',
        backgroundColor: '#E74C3C',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '30px',
        width: '100%',
        transition: 'background-color 0.3s',
    },
    userList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    userCard: {
        background: '#fff',
        border: '2px solid #FF8C42',
        borderRadius: '6px',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        boxShadow: '0 2px 8px rgba(231, 76, 60, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        flex: 1,
    },
    username: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#2C3E50',
    },
    role: {
        fontSize: '12px',
        color: '#666',
        textTransform: 'capitalize',
    },
    arrow: {
        fontSize: '18px',
        color: '#E74C3C',
        transition: 'transform 0.2s',
    },
    error: {
        color: '#DC3545',
        fontSize: '14px',
        fontWeight: '500',
    },
};

export default UserList;
