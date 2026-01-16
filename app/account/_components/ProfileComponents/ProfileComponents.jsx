"use client";
import React, { useState } from "react";
import styles from "./ProfileComponents.module.css";
import one from "./1.png";

const UAE_STATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

const ProfileComponents = ({ initialData }) => {
  console.log("Initial Data:", initialData.profile);
  console.log(
    "Address:",
    initialData.profile.metaData?.find((item) => item.key === "saved_addresses")
      ?.value
  );
  const [profile, setProfile] = useState(initialData.profile);
  const [editMode, setEditMode] = useState(false);

  const [addresses, setAddresses] = useState(
    (
      initialData.profile.metaData?.find(
        (item) => item.key === "saved_addresses"
      )?.value || []
    ).map((addr, index) => ({
      ...addr,
      id: addr.id || Date.now() + index,
    }))
  );

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showAddressPopup, setShowAddressPopup] = useState(false);

  const [showEditAddressPopup, setShowEditAddressPopup] = useState(false);

  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({});

  const [showDeleteAddressPopup, setShowDeleteAddressPopup] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState(null);

  const handleProfileChange = (field, value) => {
    if (field === "name") {
      const parts = value.split(" ");
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ");
      setProfile((prev) => ({ ...prev, firstName, lastName }));
    } else {
      setProfile((prev) => ({ ...prev, [field]: value }));
    }
  };

  const updateProfileAPI = async (payload) => {
    try {
      const res = await fetch("/api/website/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to update profile");
      return null;
    }
  };

  const saveProfile = async () => {
    // Determine gender from state or metadata
    const gender =
      profile.gender ||
      profile.metaData?.find((item) => item.key === "gender")?.value;

    const payload = {
      full_name: `${profile.firstName} ${profile.lastName}`,
      // email: profile.email,
      phone: profile.phone || profile.shipping?.phone,
      gender: gender,
      // Send saved addresses as well to ensure data consistency
      saved_addresses: transformAddressesForAPI(addresses),
    };

    const result = await updateProfileAPI(payload);
    if (result && result.success) {
      setEditMode(false);
      // Optionally update local state with result.customer if needed
    }
  };

  const transformAddressesForAPI = (addrList) => {
    return addrList.map((addr) => ({
      firstName: addr.firstName || addr.fullName?.split(" ")[0] || "",
      lastName:
        addr.lastName || addr.fullName?.split(" ").slice(1).join(" ") || "",
      address: addr.house || addr.address, // Mapping 'house' to 'address'
      apartment: addr.area || addr.apartment, // Mapping 'area' to 'apartment'
      city: addr.city,
      state: addr.state,
      postcode: addr.postal || addr.postcode,
      country: addr.country,
      phone: addr.phone,
      setAsDefault: addr.isDefault,
      id: addr.id, // Preserve ID
    }));
  };

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
  const otherAddresses = addresses.filter((a) => a !== defaultAddress);

  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      isDefault: false,
      country: "United Arab Emirates (UAE)",
      state: "Dubai",
    });
    setShowAddressPopup(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      ...addr,
      fullName:
        addr.fullName ||
        `${addr.firstName || ""} ${addr.lastName || ""}`.trim(),
    });
    setShowEditAddressPopup(true);
  };

  const saveAddress = async () => {
    // Construct the payload for the SINGLE address
    const fullNameParts = (addressForm.fullName || "").split(" ");
    const firstName = fullNameParts[0];
    const lastName = fullNameParts.slice(1).join(" ");

    const payload = {
      firstName: firstName || "",
      lastName: lastName || "",
      address: addressForm.address || addressForm.house || "", // Backwards compatibility
      apartment: addressForm.apartment || addressForm.area || "", // Backwards compatibility
      city: addressForm.city || "",
      state: addressForm.state || "",
      country: addressForm.country || "",
      phone: addressForm.phone || "",
      setAsDefault: addressForm.isDefault || false,
    };

    if (editingAddressId) {
      payload.address_id = editingAddressId;
    }

    // Call NEW API
    try {
      const res = await fetch("/api/website/profile/address/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Update local state with the returned fresh list of addresses
      if (data.addresses) {
        setAddresses(data.addresses);
      }

      setShowAddressPopup(false);
      setShowEditAddressPopup(false);
      setEditingAddressId(null);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to save address");
    }
  };

  const deleteAddress = async (id) => {
    // Not used directly, confirmDeleteAddress is used.
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const confirmDeleteAddress = async () => {
    const newAddresses = addresses.filter(
      (addr) => addr.id !== deleteAddressId
    );
    setAddresses(newAddresses);
    setShowDeleteAddressPopup(false);
    setDeleteAddressId(null);

    await updateProfileAPI({
      saved_addresses: transformAddressesForAPI(newAddresses),
    });
  };

  const removeProfilePic = async () => {
    if (confirm("Are you sure you want to remove your profile picture?")) {
      const res = await updateProfileAPI({ profile_image: "" });
      if (res && res.success) {
        window.location.reload();
      }
    }
  };

  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainContainer}>
          <div className={styles.Top}>
            <div className={styles.TopLeft}>
              <img
                src={
                  initialData.profile.metaData?.find(
                    (item) => item.key === "profile_image"
                  )?.value?.url || one.src
                }
                alt="Profile Pic"
                // width={500}
                // height={500}
                className={styles.ProfilePic}
              />
            </div>
            <div className={styles.TopRight}>
              <label
                className={styles.pfbtn}
                style={{
                  cursor: "pointer",
                  display: "inline-block",
                  textAlign: "center",
                  paddingTop: "10px",
                }}
              >
                Upload New Profile Picture
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        const base64Image = reader.result;
                        const res = await updateProfileAPI({ base64Image });
                        if (res && res.success) {
                          // Update profile image in state locally if possible
                          // Or reload the page
                          window.location.reload();
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              <button className={styles.pfrembtn} onClick={removeProfilePic}>
                Remove Profile Picture
              </button>
            </div>
          </div>
          <div className={styles.Bottom}>
            <div className={styles.PersonalInfoSection}>
              <h4>PERSONAL INFORMATION</h4>

              <div className={styles.Field}>
                <input
                  value={profile.firstName + " " + profile.lastName}
                  disabled={!editMode}
                  onChange={(e) => handleProfileChange("name", e.target.value)}
                />
                <span onClick={() => setEditMode(true)}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.41176 14.5882H2.59906L12.2334 4.95388L11.0461 3.76659L1.41176 13.4009V14.5882ZM0 16V12.8146L12.4146 0.405411C12.5569 0.276156 12.714 0.176314 12.8859 0.105882C13.058 0.0352941 13.2384 0 13.4271 0C13.6158 0 13.7985 0.0334907 13.9753 0.100471C14.1522 0.167451 14.3089 0.27396 14.4452 0.419999L15.5946 1.58376C15.7406 1.72008 15.8447 1.87694 15.9068 2.05435C15.9689 2.23176 16 2.40918 16 2.58659C16 2.77592 15.9677 2.95655 15.9031 3.12847C15.8384 3.30055 15.7356 3.45773 15.5946 3.6L3.18541 16H0ZM11.6294 4.37059L11.0461 3.76659L12.2334 4.95388L11.6294 4.37059Z"
                      fill="#6E736A"
                    />
                  </svg>
                </span>
              </div>

              <div className={styles.Field}>
                <input
                  value={profile.email}
                  disabled={!editMode}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                />
                <span onClick={() => setEditMode(true)}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.41176 14.5882H2.59906L12.2334 4.95388L11.0461 3.76659L1.41176 13.4009V14.5882ZM0 16V12.8146L12.4146 0.405411C12.5569 0.276156 12.714 0.176314 12.8859 0.105882C13.058 0.0352941 13.2384 0 13.4271 0C13.6158 0 13.7985 0.0334907 13.9753 0.100471C14.1522 0.167451 14.3089 0.27396 14.4452 0.419999L15.5946 1.58376C15.7406 1.72008 15.8447 1.87694 15.9068 2.05435C15.9689 2.23176 16 2.40918 16 2.58659C16 2.77592 15.9677 2.95655 15.9031 3.12847C15.8384 3.30055 15.7356 3.45773 15.5946 3.6L3.18541 16H0ZM11.6294 4.37059L11.0461 3.76659L12.2334 4.95388L11.6294 4.37059Z"
                      fill="#6E736A"
                    />
                  </svg>
                </span>
              </div>

              <div className={styles.Row}>
                <div className={styles.Field}>
                  <input
                    value={profile.phone || profile.shipping?.phone || ""}
                    disabled={!editMode}
                    onChange={(e) =>
                      handleProfileChange("phone", e.target.value)
                    }
                  />
                  <span onClick={() => setEditMode(true)}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.41176 14.5882H2.59906L12.2334 4.95388L11.0461 3.76659L1.41176 13.4009V14.5882ZM0 16V12.8146L12.4146 0.405411C12.5569 0.276156 12.714 0.176314 12.8859 0.105882C13.058 0.0352941 13.2384 0 13.4271 0C13.6158 0 13.7985 0.0334907 13.9753 0.100471C14.1522 0.167451 14.3089 0.27396 14.4452 0.419999L15.5946 1.58376C15.7406 1.72008 15.8447 1.87694 15.9068 2.05435C15.9689 2.23176 16 2.40918 16 2.58659C16 2.77592 15.9677 2.95655 15.9031 3.12847C15.8384 3.30055 15.7356 3.45773 15.5946 3.6L3.18541 16H0ZM11.6294 4.37059L11.0461 3.76659L12.2334 4.95388L11.6294 4.37059Z"
                        fill="#6E736A"
                      />
                    </svg>
                  </span>
                </div>

                <div className={styles.Field}>
                  {editMode ? (
                    <select
                      value={
                        profile.gender ||
                        profile.metaData?.find((item) => item.key === "gender")
                          ?.value
                      }
                      onChange={(e) =>
                        handleProfileChange("gender", e.target.value)
                      }
                    >
                      <option>Male</option>
                      <option>Female</option>
                      {/* <option>Prefer not to say</option> */}
                    </select>
                  ) : (
                    <input
                      value={
                        initialData.profile.metaData?.find(
                          (item) => item.key === "gender"
                        )?.value
                      }
                      style={{ textTransform: "capitalize" }}
                      disabled
                    />
                  )}
                </div>
              </div>

              {editMode && (
                <div className={styles.ActionRow}>
                  <button className={styles.SaveBtn} onClick={saveProfile}>
                    Save Changes
                  </button>
                  <button
                    className={styles.CancelBtn}
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className={styles.AddressSection}>
              <div className={styles.AddressHeader}>
                <h4>SAVED ADDRESS</h4>
                <button onClick={openAddAddress}>Add new Address</button>
              </div>

              {defaultAddress && (
                <>
                  <div className={styles.fixerOne}>
                    <p>Default address</p>

                    <div className={styles.AddressCard}>
                      <div className={styles.AddressText}>
                        <p className={styles.Name}>
                          {defaultAddress.firstName +
                            " " +
                            defaultAddress.lastName}
                        </p>
                        <p>{defaultAddress.address} </p>
                        <p>{defaultAddress.apartment}</p>
                        <p>
                          {defaultAddress.city}, {defaultAddress.state}{" "}
                          {defaultAddress.postalCode}
                        </p>
                        <p className={styles.Phone}>
                          Phone number: {defaultAddress.phone}
                        </p>
                      </div>

                      <div className={styles.AddressActions}>
                        <span onClick={() => openEditAddress(defaultAddress)}>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.41176 14.5882H2.59906L12.2334 4.95388L11.0461 3.76659L1.41176 13.4009V14.5882ZM0 16V12.8146L12.4146 0.405411C12.5569 0.276156 12.714 0.176314 12.8859 0.105882C13.058 0.0352941 13.2384 0 13.4271 0C13.6158 0 13.7985 0.0334907 13.9753 0.100471C14.1522 0.167451 14.3089 0.27396 14.4452 0.419999L15.5946 1.58376C15.7406 1.72008 15.8447 1.87694 15.9068 2.05435C15.9689 2.23176 16 2.40918 16 2.58659C16 2.77592 15.9677 2.95655 15.9031 3.12847C15.8384 3.30055 15.7356 3.45773 15.5946 3.6L3.18541 16H0ZM11.6294 4.37059L11.0461 3.76659L12.2334 4.95388L11.6294 4.37059Z"
                              fill="#6E736A"
                            />
                          </svg>
                        </span>

                        <span
                          onClick={() => {
                            setDeleteAddressId(defaultAddress.id);
                            setShowDeleteAddressPopup(true);
                          }}
                        >
                          <svg
                            width="15"
                            height="16"
                            viewBox="0 0 15 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2.66067 16C2.18812 16 1.78444 15.8327 1.44961 15.498C1.11495 15.1632 0.947615 14.7595 0.947615 14.287V2.25959H0V0.838165H4.26427V0H9.94995V0.838165H14.2142V2.25959H13.2666V14.287C13.2666 14.7657 13.1008 15.1708 12.7691 15.5025C12.4374 15.8342 12.0323 16 11.5536 16H2.66067ZM11.8452 2.25959H2.36904V14.287C2.36904 14.3721 2.39636 14.442 2.45101 14.4966C2.50565 14.5513 2.57554 14.5786 2.66067 14.5786H11.5536C11.6265 14.5786 11.6933 14.5482 11.754 14.4874C11.8148 14.4267 11.8452 14.3599 11.8452 14.287V2.25959ZM4.6471 12.6833H6.06829V4.15482H4.6471V12.6833ZM8.14593 12.6833H9.56712V4.15482H8.14593V12.6833Z"
                              fill="#6E736A"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {otherAddresses.length > 0 && (
                <>
                  <div className={styles.fixerTwo}>
                    <h6 className={styles.other}>Other addresses</h6>

                    {otherAddresses.map((addr) => (
                      <div key={addr.id} className={styles.AddressCard}>
                        <div className={styles.AddressText}>
                          <p className={styles.Name}>
                            {addr.firstName + " " + addr.lastName}
                          </p>
                          <p>{addr.address}</p>
                          <p>{addr.apartment}</p>
                          <p>
                            {addr.city}, {addr.country}
                          </p>
                          <p className={styles.Phone}>
                            Phone number: {addr.phone}
                          </p>
                        </div>

                        <div className={styles.AddressActions}>
                          <span onClick={() => openEditAddress(addr)}>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M1.41176 14.5882H2.59906L12.2334 4.95388L11.0461 3.76659L1.41176 13.4009V14.5882ZM0 16V12.8146L12.4146 0.405411C12.5569 0.276156 12.714 0.176314 12.8859 0.105882C13.058 0.0352941 13.2384 0 13.4271 0C13.6158 0 13.7985 0.0334907 13.9753 0.100471C14.1522 0.167451 14.3089 0.27396 14.4452 0.419999L15.5946 1.58376C15.7406 1.72008 15.8447 1.87694 15.9068 2.05435C15.9689 2.23176 16 2.40918 16 2.58659C16 2.77592 15.9677 2.95655 15.9031 3.12847C15.8384 3.30055 15.7356 3.45773 15.5946 3.6L3.18541 16H0ZM11.6294 4.37059L11.0461 3.76659L12.2334 4.95388L11.6294 4.37059Z"
                                fill="#6E736A"
                              />
                            </svg>
                          </span>

                          <span
                            onClick={() => {
                              setDeleteAddressId(addr.id);
                              setShowDeleteAddressPopup(true);
                            }}
                          >
                            <svg
                              width="15"
                              height="16"
                              viewBox="0 0 15 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M2.66067 16C2.18812 16 1.78444 15.8327 1.44961 15.498C1.11495 15.1632 0.947615 14.7595 0.947615 14.287V2.25959H0V0.838165H4.26427V0H9.94995V0.838165H14.2142V2.25959H13.2666V14.287C13.2666 14.7657 13.1008 15.1708 12.7691 15.5025C12.4374 15.8342 12.0323 16 11.5536 16H2.66067ZM11.8452 2.25959H2.36904V14.287C2.36904 14.3721 2.39636 14.442 2.45101 14.4966C2.50565 14.5513 2.57554 14.5786 2.66067 14.5786H11.5536C11.6265 14.5786 11.6933 14.5482 11.754 14.4874C11.8148 14.4267 11.8452 14.3599 11.8452 14.287V2.25959ZM4.6471 12.6833H6.06829V4.15482H4.6471V12.6833ZM8.14593 12.6833H9.56712V4.15482H8.14593V12.6833Z"
                                fill="#6E736A"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className={styles.DeleteAccount}>
              <h4>DELETE ACCOUNT</h4>
              <button onClick={() => setShowDeletePopup(true)}>
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeletePopup && (
        <div className={styles.DeletePopupOverlay}>
          <div className={styles.DeletePopup}>
            <h3>DELETE ACCOUNT</h3>
            <p>
              Deleting your account permanently removes your order history,
              subscriptions and preferences.
            </p>
            <div className={styles.DeletePopupActions}>
              <button onClick={() => setShowDeletePopup(false)}>
                Keep Account
              </button>
              <button className={styles.DeleteDanger}>Delete Anyway</button>
            </div>
          </div>
        </div>
      )}

      {showAddressPopup && (
        <div className={styles.PopupOverlay}>
          <div className={styles.Popup}>
            <h3>ADD ADDRESS</h3>

            <input
              placeholder="Full Name"
              onChange={(e) =>
                setAddressForm({ ...addressForm, fullName: e.target.value })
              }
            />

            <input
              placeholder="Country / Region"
              // value={addressForm.country || ""}
              onChange={(e) =>
                setAddressForm({ ...addressForm, country: e.target.value })
              }
            />

            <input
              placeholder="House number, Street name"
              value={addressForm.address || ""}
              onChange={(e) =>
                setAddressForm({ ...addressForm, address: e.target.value })
              }
            />

            <input
              placeholder="Apartment, suite, etc."
              value={addressForm.apartment || ""}
              onChange={(e) =>
                setAddressForm({ ...addressForm, apartment: e.target.value })
              }
            />

            <div className={styles.Row} style={{ display: "flex" }}>
              <input
                placeholder="City"
                value={addressForm.city || ""}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, city: e.target.value })
                }
              />

              {/* Check if country is UAE-like to show dropdown */}

              <select
                className={styles.StateSelect} // Ensure you have styles or use inline
                value={addressForm.state || ""}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, state: e.target.value })
                }
                style={{
                  padding: "10px",
                  border: "1px solid #2f362a4d",
                  // borderRadius: "20px",
                  fontSize: "15px",
                  color: "#6e736a",
                  width: "100%",
                  outline: "none",
                }}
              >
                <option value="" disabled>
                  Select Emirate
                </option>
                {UAE_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>

              {/* <input
                placeholder="Postal code"
                value={addressForm.postcode || ""}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, postal: e.target.value })
                }
              /> */}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #2f362a4d",
                padding: "19px 22px",
                fontFamily: "var(--lato)",
                fontSize: "15px",
                color: "#6e736a",
                background: "#fff",
              }}
            >
              <span style={{ marginRight: "8px", userSelect: "none" }}>
                +971
              </span>
              <input
                placeholder="50 123 4567"
                value={
                  addressForm.phone
                    ? addressForm.phone.replace(/^\+971\s?/, "")
                    : ""
                }
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    phone: "+971 " + e.target.value.replace(/^(\+971\s?)/, ""),
                  })
                }
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  padding: 0,
                  fontSize: "15px",
                  color: "#6e736a",
                  background: "transparent",
                }}
              />
            </div>

            <label className={styles.CheckRow}>
              <input
                type="checkbox"
                checked={addressForm.isDefault || false}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    isDefault: e.target.checked,
                  })
                }
              />
              Use this as my default Shipping Address
            </label>

            <div className={styles.PopupActions}>
              <button onClick={() => setShowAddressPopup(false)}>Cancel</button>
              <button className={styles.SaveBtn} onClick={saveAddress}>
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditAddressPopup && (
        <div className={styles.PopupOverlay}>
          <div className={styles.Popup}>
            <h3>EDIT ADDRESS</h3>

            <input
              placeholder="Full Name"
              value={addressForm.fullName || ""}
              onChange={(e) =>
                setAddressForm({ ...addressForm, fullName: e.target.value })
              }
            />

            <input
              placeholder="Country / Region"
              value={addressForm.country || ""}
              onChange={(e) =>
                setAddressForm({ ...addressForm, country: e.target.value })
              }
            />

            <input
              placeholder="House number, Street name"
              value={addressForm.address || ""}
              onChange={(e) =>
                setAddressForm({ ...addressForm, address: e.target.value })
              }
            />

            <input
              placeholder="Apartment, suite, etc."
              value={addressForm.apartment || ""}
              onChange={(e) =>
                setAddressForm({ ...addressForm, apartment: e.target.value })
              }
            />

            <div className={styles.Row} style={{ display: "flex" }}>
              <input
                placeholder="City"
                value={addressForm.city || ""}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, city: e.target.value })
                }
                style={{
                  // padding: "10px",
                  border: "1px solid #2f362a4d",
                  fontSize: "15px",
                  // color: "#6e736a",
                  width: "100%",
                  outline: "none",
                }}
              />
              {/* Check if country is UAE-like to show dropdown */}
              <select
                className={styles.StateSelect}
                value={addressForm.state || ""}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, state: e.target.value })
                }
                style={{
                  padding: "10px",
                  border: "1px solid #2f362a4d",
                  fontSize: "15px",
                  color: "#6e736a",
                  width: "100%",
                  outline: "none",
                }}
              >
                <option value="" disabled>
                  Select Emirate
                </option>
                {UAE_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #2f362a4d",
                padding: "19px 22px",
                fontFamily: "var(--lato)",
                fontSize: "15px",
                color: "#6e736a",
                background: "#fff",
              }}
            >
              <span style={{ marginRight: "8px", userSelect: "none" }}>
                +971
              </span>
              <input
                placeholder="50 123 4567"
                value={
                  addressForm.phone
                    ? addressForm.phone.replace(/^\+971\s?/, "")
                    : ""
                }
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    phone: "+971 " + e.target.value.replace(/^(\+971\s?)/, ""),
                  })
                }
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  padding: 0,
                  fontSize: "15px",
                  color: "#6e736a",
                  background: "transparent",
                }}
              />
            </div>

            <label className={styles.CheckRow}>
              <input
                type="checkbox"
                checked={addressForm.isDefault || false}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    isDefault: e.target.checked,
                  })
                }
              />
              Use this as my default Shipping Address
            </label>

            <div className={styles.PopupActions}>
              <button onClick={() => setShowEditAddressPopup(false)}>
                Cancel
              </button>
              <button className={styles.SaveBtn} onClick={saveAddress}>
                Update Address
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteAddressPopup && (
        <div className={styles.PopupOverlayDeleteAddress}>
          <div className={styles.PopupDeleteAddress}>
            <h3>DELETE CONFIRMATION</h3>
            <p>Are you sure you want to delete this address?</p>

            <div className={styles.PopupActionsDeleteAddress}>
              <button
                className={styles.DeleteAddressCancelBtn}
                onClick={() => setShowDeleteAddressPopup(false)}
              >
                Cancel
              </button>

              <button
                className={styles.DeleteAddressSaveBtn}
                onClick={confirmDeleteAddress}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileComponents;
