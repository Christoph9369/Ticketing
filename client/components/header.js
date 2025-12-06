import Link from "next/link";

export default ({ currentUser }) => {
  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/" className="navbar-brand">
        GitTix
      </Link>

      <div>
        {currentUser ? (
          <Link href="/auth/signout" className="nav-link">
            Sign Out
          </Link>
        ) : (
          <Link href="/auth/signin" className="nav-link">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};
