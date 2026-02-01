import Link from "next/link";

const Header = ({ currentUser }) => {
  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/" className="navbar-brand">
        GitTix
      </Link>

      <div className="d-flex justify-content-end">
        {currentUser ? (
          <Link href="/auth/signout" className="nav-link">
            Sign Out
          </Link>
        ) : (
          <>
            <Link href="/auth/signup" className="nav-link me-3">
              Sign Up
            </Link>
            <Link href="/auth/signin" className="nav-link">
              Sign In
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;
