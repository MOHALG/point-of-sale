import { Link } from 'react-router'

function Navbar({ user, setUser }) {

  function logOut() {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <header className='topbar'>
      <div className='topbar__brand'>Point of Sale</div>

      <nav className='topbar__nav' aria-label='Primary navigation'>
        <Link className='nav-item' to='/'>Homepage</Link>

        {user ? (
          <>
            <Link className='nav-item' to='/dashboard'>Dashboard</Link>
            <Link className='nav-item' to='/categories'>Categories</Link>
            {user.role === 'admin' && (
              <Link className='nav-item' to='/admin/users'>Users</Link>
            )}
            <Link className='nav-item' to='/create-item'>Create Item</Link>
            <span className='nav-item nav-item--muted'>{user.username}</span>
            <button className='nav-item nav-item--button' onClick={logOut}>Log Out</button>
          </>
        ) : (
          <>
            <Link className='nav-item' to='/sign-up'>Sign up</Link>
            <Link className='nav-item' to='/sign-in'>Sign in</Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default Navbar