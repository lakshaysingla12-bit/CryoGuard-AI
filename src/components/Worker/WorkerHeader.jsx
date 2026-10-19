import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorker } from "../../context/WorkerContext";
function WorkerHeader() {

  const navigate = useNavigate();

  const {
    worker,
    updateWorker,
    language,
    toggleLanguage,
  } = useWorker();

  const [showProfile, setShowProfile] = useState(false);

  const [editName, setEditName] = useState(worker.name);
  const [editEmail, setEditEmail] = useState(worker.email);
  const [editPhone, setEditPhone] = useState(worker.phone);
  const [errors, setErrors] = useState({});

  const isHindi = language === "HI";


const handleSave = () => {
  const name = editName.trim();
  const email = editEmail.trim();
  const phone = editPhone.trim();

  const newErrors = {};

  if (!name) {
    newErrors.name = "Name is required.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newErrors.email = "Enter a valid email address.";
  }

  if (!/^\d{10}$/.test(phone)) {
    newErrors.phone = "Phone must contain exactly 10 digits.";
  }

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    return;
  }

  updateWorker({ name, email, phone });
  setShowProfile(false);
};


  const handleCancel = () => {
  setEditName(worker.name);
  setEditEmail(worker.email);
  setEditPhone(worker.phone);
  setErrors({});
  setShowProfile(false);
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
  onClick={() => {
    setEditName(worker.name);
    setEditEmail(worker.email);
    setEditPhone(worker.phone);
    setErrors({});
    setShowProfile(true);
  }}
>
  👤 {worker.name}
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

  {/* Full Name */}
  <label>
    {isHindi ? "पूरा नाम" : "Full Name"}

    <input
      type="text"
      value={editName}
      onChange={(e) => {
        setEditName(e.target.value);
        setErrors((prev) => ({ ...prev, name: "" }));
      }}
    />

    {errors.name && (
      <p className="field-error">{errors.name}</p>
    )}
  </label>

  {/* Email */}
  <label>
    {isHindi ? "ईमेल" : "Email"}

    <input
      type="email"
      value={editEmail}
      onChange={(e) => {
        setEditEmail(e.target.value);
        setErrors((prev) => ({ ...prev, email: "" }));
      }}
    />

    {errors.email && (
      <p className="field-error">{errors.email}</p>
    )}
  </label>

  {/* Phone */}
  <label>
    {isHindi ? "फ़ोन" : "Phone"}

    <input
      type="tel"
      value={editPhone}
      onChange={(e) => {
        setEditPhone(e.target.value);
        setErrors((prev) => ({ ...prev, phone: "" }));
      }}
    />

    {errors.phone && (
      <p className="field-error">{errors.phone}</p>
    )}
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