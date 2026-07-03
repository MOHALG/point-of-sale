import React from 'react'
import { useNavigate } from 'react-router';





function Dashboard({ user }) {

  const navigate = useNavigate();

  const pointOfSale = () => {
    navigate('/point-of-sale');
  }
  
  return (
    <div>
        <h1>Welcome {user?.username}</h1>
        <button onClick={pointOfSale}>Go to Point of Sale</button>
    </div>
  )
}

export default Dashboard