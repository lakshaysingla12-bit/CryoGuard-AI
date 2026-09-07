import { useState } from "react";
import { useNavigate } from "react-router-dom";
function WorkerHeader() {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [language, setLanguage] = useState("EN");

  const [name, setName] = useState("Rohit Kumar");
  const [email, setEmail] = useState("rohit@cryoguard.com");
  const [phone, setPhone] = useState("9876543210");

  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editPhone, setEditPhone] = useState(phone);

  const isHindi = language === "HI";

  const handleSave = () => {
    setName(editName);
    setEmail(editEmail);
    setPhone(editPhone);
    setShowProfile(false);
  };

  const handleCancel = () => {
    setEditName(name);
    setEditEmail(email);
    setEditPhone(phone);
    setShowProfile(false);
  };

  const toggleLanguage = () => {
    setLanguage(isHindi ? "EN" : "HI");
  };

  return (
    <>
      <header className="worker-header">

        <div className="worker-title">
          <h2>
            {isHindi ? "वर्कर पोर्टल" : "Worker Portal"}
          </h2>
        </div>

        <div className="worker-profile">

          <button
  onClick={() => navigate("/alerts")}
  className="notification-button"
>
  🔔
</button>

          <button
            className="language-button"
            onClick={toggleLanguage}
          >
            {language}
          </button>

          <button
            className="profile-button"
            onClick={() => setShowProfile(true)}
          >
            👤 {name}
          </button>

        </div>

      </header>


      {/* Profile Modal */}

      {showProfile && (
        <div className="profile-overlay">

          <div className="profile-modal">

            <div className="profile-modal-header">

              <div>
                <h2>
                  {isHindi ? "प्रोफ़ाइल संपादित करें" : "Edit Profile"}
                </h2>

                <p>
                  {isHindi
                    ? "अपनी कर्मचारी जानकारी अपडेट करें।"
                    : "Update your worker details."}
                </p>
              </div>

              <button
                className="close-profile"
                onClick={handleCancel}
              >
                ×
              </button>

            </div>


            <div className="profile-avatar">
              👤
            </div>


            <div className="profile-form">

              <label>
                {isHindi ? "पूरा नाम" : "Full Name"}

                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </label>


              <label>
                {isHindi ? "ईमेल" : "Email"}

                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </label>


              <label>
                {isHindi ? "फ़ोन" : "Phone"}

                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </label>

            </div>


            <div className="profile-actions">

              <button
                className="cancel-profile"
                onClick={handleCancel}
              >
                {isHindi ? "रद्द करें" : "Cancel"}
              </button>

              <button
                className="save-profile"
                onClick={handleSave}
              >
                {isHindi ? "परिवर्तन सहेजें" : "Save Changes"}
              </button>

            </div>

          </div>

        </div>
      )}

    </>
  );
}

export default WorkerHeader;