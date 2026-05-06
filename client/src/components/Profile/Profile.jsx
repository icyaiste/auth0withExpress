import { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [secureData, setSecureData] = useState(null);
  const [secureLoading, setSecureLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:3000/profile", {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const FetchSecureData = async () => {
    setSecureLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/secure-data", {
        withCredentials: true,
      });
      setSecureData(response.data);
    } catch (error) {
      console.log(error);
      setSecureData(null);
    } finally {
      setSecureLoading(false);
    }
  };

  if (loading) return <p>Loading ...</p>;
  if (!user) return <p>Not logged in.</p>;
  return (
    <div>
      <h2>Hello {user.given_name || user.name}</h2>
      {user.picture && (
        <img
          src={user.picture}
          alt={user.name}
          style={{ width: 80, borderRadius: "50" }}
        />
      )}
      <button onClick={FetchSecureData} disabled={secureLoading}>
        {secureLoading ? "Fetching..." : "Fetch secure data"}
      </button>
      {secureData && (
        <div>
          <h3>Secure Data:</h3>
          <p><strong>Name:</strong> {secureData.user.given_name} {secureData.user.family_name || secureData.user.name}</p>
          <p><strong>Email:</strong> {secureData.user.email}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
