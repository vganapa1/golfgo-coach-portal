import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
      <img 
        src="/image 5.png" 
        alt="GolfGo" 
        className="h-10 w-auto"
      />
    </Link>
  );
}
