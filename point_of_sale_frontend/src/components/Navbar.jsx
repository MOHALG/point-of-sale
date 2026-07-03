import { Link } from 'react-router'

function Navbar({ user, setUser }) {


  function logOut(){
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <div>
      {/* Routes seen by everyone */}
      <Link className='nav-item' to='/'>Homepage</Link>

      {user ? (
        // Links for protected routes only for logged in users
        <>
        <Link className='nav-item' to='/dashboard'>Dashboard</Link>

        <span className='nav-item'>{user.username}</span>
       
        <button className='nav-item' onClick={logOut}>Log Out</button>


        </>
      ) :
      (
        // links for not logged in users
        <>
        <Link className='nav-item' to='/sign-up'>Sign up</Link>
        <Link className='nav-item' to='/sign-in'>Sign in</Link>

        </>
      )
      }
    </div>
  )
}

export default Navbar