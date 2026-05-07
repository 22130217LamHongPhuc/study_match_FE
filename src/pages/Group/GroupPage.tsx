import { useNavigate } from "react-router-dom";

export default function GroupPage() {
  const navigate = useNavigate();
  const goTonavigate = () => {
    navigate("/create-group");
  };
  return (
    <div>
      <h1> Group Page</h1>
      <button className="bg-green-400 p-5 rounded-lg" onClick={goTonavigate}>
        Create Group
      </button>
    </div>
  );
}
