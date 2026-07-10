import { useParams } from 'react-router';
import { Link } from 'react-router';
import PosDisplay from '../components/PosDisplay';
import ItemDisplay from '../components/ItemDisplay';


function PosProfile() {
  const { id } = useParams();

  
  return (
    <div>
      <h1>Point of Sale Profile</h1>
      <p>ID: {id}</p>
      <PosDisplay />
      <ItemDisplay item={{ name: 'Sample Item', description: 'This is a sample item.', price: 9.99 }} addToCart={() => {}} />
      <Link to="/point-of-sale">Back to POS List</Link>
    </div>
  );
}

export default PosProfile;
