import { useState } from 'react';
import { useNavigate } from 'react-router';


const PAYMENT_METHOD_OPTIONS = ['Cash', 'Card', 'Bank Transfer', 'User ID'];

function Createnewpos({ onCreated }) {
	const navigate = useNavigate();
	const [createLoading, setCreateLoading] = useState(false);
	const [createError, setCreateError] = useState('');
	const [createSuccess, setCreateSuccess] = useState('');
	const [formData, setFormData] = useState({
		name: '',
		location: '',
		paymentMethods: [],
	});

	const handleCreatePos = async (e) => {
		e.preventDefault();
		setCreateLoading(true);
		setCreateError('');
		setCreateSuccess('');

		const token = localStorage.getItem('token');

		if (!token) {
			setCreateError('You must sign in to create a point of sale record.');
			setCreateLoading(false);
			return;
		}

		try {
			const response = await fetch('http://localhost:3000/pos/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to create point of sale record');
			}

			await response.json();
			setCreateSuccess('Point of sale record created successfully!');
			setFormData({ name: '', location: '', paymentMethods: [] });

			if (onCreated) {
				onCreated();
			}
			navigate('/point-of-sale'); // Redirect to the POS list page after creation
		} catch (error) {
			setCreateError(error.message || 'Error creating point of sale record');
		} finally {
			setCreateLoading(false);
		}
	};

	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handlePaymentMethodsChange = (e) => {
		const { value, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			paymentMethods: checked
				? [...prev.paymentMethods, value]
				: prev.paymentMethods.filter((method) => method !== value),
		}));
	};

	return (
		<div>
			<form onSubmit={handleCreatePos}>
				<input name="name" value={formData.name} onChange={handleFormChange} placeholder="Name" required />
				<input name="location" value={formData.location} onChange={handleFormChange} placeholder="Location" required />
				<div>
					{PAYMENT_METHOD_OPTIONS.map((method) => (
						<label key={method}>
							<input
								type="checkbox"
								name="paymentMethods"
								value={method}
								checked={formData.paymentMethods.includes(method)}
								onChange={handlePaymentMethodsChange}
							/>
							{method}
						</label>
					))}
				</div>
				<button type="submit" disabled={createLoading}>{createLoading ? 'Creating...' : 'Create'}</button>
			</form>
			{createError && <p role="alert">{createError}</p>}
			{createSuccess && <p>{createSuccess}</p>}
		</div>
	);
}

export default Createnewpos;
