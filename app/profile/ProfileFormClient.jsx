"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { COUNTRIES, STATES as COUNTRY_STATES } from '../../lib/countries';

export default function ProfileFormClient({ initialProfile = {}, onSaved }) {
  const router = useRouter();

  const initialBilling = initialProfile?.billing || {};
  const initialMeta = initialProfile?.metaData || [];

  const getMetaValue = (key) => {
    const meta = initialMeta.find(m => m.key === key);
    return meta?.value || '';
  };

  // Get saved addresses from metadata
  const savedAddressesRaw = getMetaValue('saved_addresses');
  const initialAddresses = Array.isArray(savedAddressesRaw) ? savedAddressesRaw : [];

  const fullName = `${initialBilling.first_name || ''} ${initialBilling.last_name || ''}`.trim();
  const email = initialProfile?.email || '';

  const [formData, setFormData] = useState({
    full_name: fullName,
    phone: initialBilling.phone || '',
    gender: getMetaValue('gender'),
    profile_image: getMetaValue('profile_image') || initialProfile?.avatar || '',
  });

  const [addresses, setAddresses] = useState(initialAddresses);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    id: '',
    label: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    country: '',
    phone: '',
    setAsDefault: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Email update states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailUpdateStep, setEmailUpdateStep] = useState(1); // 1: enter email, 2: verify OTP
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailUpdateLoading, setEmailUpdateLoading] = useState(false);
  const [emailUpdateMessage, setEmailUpdateMessage] = useState(null);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Delete account states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function onAddressChange(e) {
    const { name, value, type, checked } = e.target;
    if (name === 'country') {
      setAddressForm(prev => ({ ...prev, country: value, state: '' }));
      return;
    }
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function openAddressForm(address = null) {
    if (address) {
      setAddressForm(address);
      setEditingAddressId(address.id);
    } else {
      setAddressForm({
        id: `addr_${Date.now()}`,
        label: `ADDRESS ${addresses.length + 1}`,
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        city: '',
        state: '',
        country: '',
        phone: '',
        setAsDefault: addresses.length === 0,
      });
      setEditingAddressId(null);
    }
    setShowAddressForm(true);
  }

  function closeAddressForm() {
    setShowAddressForm(false);
    setEditingAddressId(null);
  }

  function saveAddress() {
    let updatedAddresses;

    if (editingAddressId) {
      // Update existing
      updatedAddresses = addresses.map(addr =>
        addr.id === editingAddressId ? addressForm : addr
      );
    } else {
      // Add new
      updatedAddresses = [...addresses, addressForm];
    }

    // If this is set as default, unset others
    if (addressForm.setAsDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        setAsDefault: addr.id === addressForm.id
      }));
    }

    setAddresses(updatedAddresses);
    closeAddressForm();
  }

  function deleteAddress(id) {
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses(addresses.filter(addr => addr.id !== id));
    }
  }

  function setDefaultAddress(id) {
    setAddresses(addresses.map(addr => ({
      ...addr,
      setAsDefault: addr.id === id
    })));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        ...formData,
        saved_addresses: addresses,
      };

      const res = await fetch('/api/website/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Update failed');

      setMessage({ type: 'success', text: 'Profile updated successfully' });
      router.refresh();

      if (typeof onSaved === 'function') {
        setTimeout(() => onSaved(), 1000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || String(err) });
    } finally {
      setLoading(false);
    }
  }

  // Countdown timer effect
  React.useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  function openEmailModal() {
    setShowEmailModal(true);
    setEmailUpdateStep(1);
    setNewEmail('');
    setEmailOtp('');
    setEmailUpdateMessage(null);
    setOtpCountdown(0);
  }

  function closeEmailModal() {
    setShowEmailModal(false);
    setEmailUpdateStep(1);
    setNewEmail('');
    setEmailOtp('');
    setEmailUpdateMessage(null);
    setOtpCountdown(0);
  }

  async function handleSendOtp() {
    setEmailUpdateMessage(null);

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(newEmail)) {
      setEmailUpdateMessage({ type: 'error', text: 'Invalid email format' });
      return;
    }

    if (newEmail === email) {
      setEmailUpdateMessage({ type: 'error', text: 'New email must be different from current email' });
      return;
    }

    setEmailUpdateLoading(true);

    try {
      const res = await fetch('/api/website/profile/update-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEmail: email,
          newEmail: newEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to send OTP');
      }

      setEmailUpdateMessage({ type: 'success', text: 'OTP sent to your new email' });
      setEmailUpdateStep(2);
      setOtpCountdown(60); // Start 60 second countdown
    } catch (err) {
      setEmailUpdateMessage({ type: 'error', text: err?.message || String(err) });
    } finally {
      setEmailUpdateLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setEmailUpdateMessage(null);

    if (!emailOtp || emailOtp.length !== 4) {
      setEmailUpdateMessage({ type: 'error', text: 'Please enter a valid 4-digit OTP' });
      return;
    }

    setEmailUpdateLoading(true);

    try {
      const res = await fetch('/api/website/profile/update-email/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: emailOtp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to verify OTP');
      }

      setEmailUpdateMessage({ type: 'success', text: 'Email updated successfully!' });

      // If JWT token is returned, use it to refresh the session
      if (data.jwt) {
        // Sign in with the new JWT token to update the session
        // The credentials provider expects email and password (JWT token as password)
        const signInResult = await signIn('credentials', {
          redirect: false,
          email: data.newEmail,
          password: data.jwt, // JWT token goes in password field
        });

        if (signInResult?.ok) {
          console.log('✅ Session updated with new email');
          // Close modal and refresh page to show updated email
          setTimeout(() => {
            closeEmailModal();
            window.location.reload();
          }, 1500);
        } else {
          console.error('❌ Failed to update session');
          // Still close modal and reload, but session might not be updated
          setTimeout(() => {
            closeEmailModal();
            window.location.reload();
          }, 1500);
        }
      } else {
        // No JWT token, just reload the page
        setTimeout(() => {
          closeEmailModal();
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      setEmailUpdateMessage({ type: 'error', text: err?.message || String(err) });
    } finally {
      setEmailUpdateLoading(false);
    }
  }

  function handleResendOtp() {
    setEmailOtp('');
    handleSendOtp();
  }

  // Delete account handlers
  async function openDeleteModal() {
    setShowDeleteModal(true);
    setDeleteMessage(null);
    setDeleteConfirmed(false);
    setDeleteLoading(true);

    try {
      // Check for active orders and subscriptions
      const res = await fetch('/api/website/profile/delete', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to check account status');
      }

      setActiveOrders(data.activeOrders?.ids || []);
      setActiveSubscriptions(data.activeSubscriptions?.ids || []);

      if (data.activeOrders?.count > 0 || data.activeSubscriptions?.count > 0) {
        setDeleteMessage({
          type: 'warning',
          text: `You have ${data.activeOrders?.count || 0} active order(s) and ${data.activeSubscriptions?.count || 0} active subscription(s). These will be cancelled before deleting your account.`
        });
      }
    } catch (err) {
      setDeleteMessage({ type: 'error', text: err?.message || String(err) });
    } finally {
      setDeleteLoading(false);
    }
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setDeleteMessage(null);
    setDeleteConfirmed(false);
    setActiveOrders([]);
    setActiveSubscriptions([]);
  }

  async function handleDeleteAccount() {
    if (!deleteConfirmed) {
      setDeleteMessage({ type: 'error', text: 'Please confirm that you want to delete your account' });
      return;
    }

    setDeleteLoading(true);
    setDeleteMessage(null);

    try {
      const res = await fetch('/api/website/profile/delete/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to delete account');
      }

      setDeleteMessage({ type: 'success', text: 'Account deleted successfully. Redirecting...' });

      // Redirect to home page after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setDeleteMessage({ type: 'error', text: err?.message || String(err) });
    } finally {
      setDeleteLoading(false);
    }
  }


  const styles = {
    container: {
      maxWidth: 900,
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    },
    section: {
      marginBottom: 40,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: 20,
      paddingBottom: 10,
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 20,
      marginBottom: 20,
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    },
    label: {
      fontSize: 12,
      fontWeight: 500,
      textTransform: 'uppercase',
      color: '#666',
    },
    input: {
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: 4,
      fontSize: 14,
      outline: 'none',
    },
    select: {
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: 4,
      fontSize: 14,
      outline: 'none',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    profilePictureSection: {
      display: 'flex',
      alignItems: 'center',
      gap: 30,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid #f0f0f0',
    },
    avatarPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: '50%',
      backgroundColor: '#f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 48,
      color: '#999',
    },
    buttonGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    },
    uploadButton: {
      padding: '8px 20px',
      backgroundColor: '#6b7c6e',
      color: 'white',
      border: 'none',
      borderRadius: 4,
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 500,
    },
    removeButton: {
      padding: '8px 20px',
      backgroundColor: 'white',
      color: '#666',
      border: '1px solid #ddd',
      borderRadius: 4,
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 500,
    },
    addressCard: {
      border: '1px solid #ddd',
      borderRadius: 4,
      padding: 15,
      marginBottom: 15,
      backgroundColor: '#fafafa',
    },
    addressTitle: {
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 8,
    },
    addressText: {
      fontSize: 13,
      color: '#666',
      lineHeight: 1.6,
    },
    addressActions: {
      display: 'flex',
      gap: 10,
      marginTop: 10,
    },
    addNewLink: {
      color: '#6b7c6e',
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
      textDecoration: 'none',
    },
    actionButtons: {
      display: 'flex',
      gap: 15,
      marginTop: 30,
    },
    saveButton: {
      padding: '12px 30px',
      backgroundColor: '#6b7c6e',
      color: 'white',
      border: 'none',
      borderRadius: 4,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 500,
    },
    cancelButton: {
      padding: '12px 30px',
      backgroundColor: 'white',
      color: '#666',
      border: '1px solid #ddd',
      borderRadius: 4,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 500,
    },
    message: {
      padding: '10px 15px',
      borderRadius: 4,
      marginBottom: 20,
      fontSize: 14,
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: 'white',
      padding: 30,
      borderRadius: 8,
      maxWidth: 600,
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto',
    },
  };

  return (
    <div style={styles.container}>
      <form onSubmit={onSubmit}>
        {message && (
          <div style={{
            ...styles.message,
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          }}>
            {message.text}
          </div>
        )}

        {/* Personal Information */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Personal Information</h3>

          <div style={{ display: 'flex', gap: 40 }}>
            <div style={{ flex: 1 }}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    name="full_name"
                    value={formData.full_name}
                    onChange={onChange}
                    style={styles.input}
                    placeholder="Ahmed Al-Mansouri"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                      type="email"
                      value={email}
                      disabled
                      style={{ ...styles.input, backgroundColor: '#f5f5f5', cursor: 'not-allowed', flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={openEmailModal}
                      style={{
                        ...styles.uploadButton,
                        padding: '10px 16px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Change Email
                    </button>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={onChange}
                    style={styles.input}
                    placeholder="+971 50 123 4567"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={onChange}
                    style={styles.select}
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Profile Picture */}
            <div style={styles.profilePictureSection}>
              {formData.profile_image ? (
                <img src={formData.profile_image} alt="Profile" style={styles.avatar} />
              ) : (
                <div style={styles.avatarPlaceholder}>👤</div>
              )}
              <div style={styles.buttonGroup}>
                <label style={styles.uploadButton}>
                  Upload New Profile Picture
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // Validate file type
                      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
                      if (!allowedTypes.includes(file.type)) {
                        alert('Only JPG, PNG, and WebP images are allowed');
                        return;
                      }

                      // Validate file size (2MB max)
                      const maxSize = 2 * 1024 * 1024;
                      if (file.size > maxSize) {
                        alert('Image too large. Maximum size is 2MB');
                        return;
                      }

                      // Convert to base64
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64String = reader.result;
                        setFormData(prev => ({
                          ...prev,
                          profile_image: base64String,
                          base64Image: base64String
                        }));
                      };
                      reader.onerror = () => {
                        alert('Failed to read image file');
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {formData.profile_image && (
                  <button
                    type="button"
                    style={styles.removeButton}
                    onClick={() => setFormData(prev => ({ ...prev, profile_image: '' }))}
                  >
                    Remove Profile Picture
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Saved Addresses */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <span>Saved Address</span>
            <a
              onClick={() => openAddressForm()}
              style={styles.addNewLink}
            >
              Add new
            </a>
          </h3>

          {addresses.length === 0 ? (
            <div style={{ color: '#999', fontSize: 14, marginBottom: 15 }}>
              No saved addresses yet
            </div>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} style={styles.addressCard}>
                <div style={styles.addressTitle}>
                  {addr.label} {addr.setAsDefault && <span style={{ color: '#6b7c6e' }}>★ Default</span>}
                </div>
                <div style={styles.addressText}>
                  {(addr.firstName || addr.lastName) && <div>{addr.firstName} {addr.lastName}</div>}
                  {addr.address && <div>{addr.address}</div>}
                  {addr.apartment && <div>{addr.apartment}</div>}
                  {addr.city && <div>{addr.city}, {addr.state}</div>}
                  {addr.country && <div>{COUNTRIES[addr.country] || addr.country}</div>}
                  {addr.phone && <div>Phone: {addr.phone}</div>}
                </div>
                <div style={styles.addressActions}>
                  <button
                    type="button"
                    onClick={() => openAddressForm(addr)}
                    style={{ ...styles.removeButton, padding: '6px 12px' }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAddress(addr.id)}
                    style={{ ...styles.removeButton, padding: '6px 12px' }}
                  >
                    Delete
                  </button>
                  {!addr.setAsDefault && (
                    <button
                      type="button"
                      onClick={() => setDefaultAddress(addr.id)}
                      style={{ ...styles.removeButton, padding: '6px 12px' }}
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.saveButton,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onSaved}
            style={styles.cancelButton}
          >
            Cancel
          </button>
        </div>

        {/* Delete Account Section */}
        <div style={{ ...styles.section, marginTop: 60, borderTop: '2px solid #dc3545', paddingTop: 30 }}>
          <h3 style={{ ...styles.sectionTitle, color: '#dc3545', borderBottom: '1px solid #dc3545' }}>Danger Zone</h3>
          <div style={{ padding: '20px', backgroundColor: '#fff5f5', border: '1px solid #dc3545', borderRadius: 4 }}>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 15 }}>
              Once you delete your account, there is no going back. This action will cancel all active subscriptions and permanently delete your account data.
            </p>
            <button
              type="button"
              onClick={openDeleteModal}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </form>

      {/* Address Form Modal */}
      {showAddressForm && (
        <div style={styles.modal} onClick={closeAddressForm}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>

            <div style={{ marginTop: 20 }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Address Label</label>
                <input
                  name="label"
                  value={addressForm.label}
                  onChange={onAddressChange}
                  style={styles.input}
                  placeholder="ADDRESS 1"
                />
              </div>

              <div style={{ ...styles.formGrid, marginTop: 15 }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>First Name</label>
                  <input
                    name="firstName"
                    value={addressForm.firstName}
                    onChange={onAddressChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Last Name</label>
                  <input
                    name="lastName"
                    value={addressForm.lastName}
                    onChange={onAddressChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Address</label>
                  <input
                    name="address"
                    value={addressForm.address}
                    onChange={onAddressChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Apartment / Suite</label>
                  <input
                    name="apartment"
                    value={addressForm.apartment}
                    onChange={onAddressChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>City</label>
                  <input
                    name="city"
                    value={addressForm.city}
                    onChange={onAddressChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone</label>
                  <input
                    name="phone"
                    value={addressForm.phone}
                    onChange={onAddressChange}
                    style={styles.input}
                    placeholder="+971 50 123 4567"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Country</label>
                  <select
                    name="country"
                    value={addressForm.country}
                    onChange={onAddressChange}
                    style={styles.select}
                  >
                    <option value="">Select country...</option>
                    {Object.entries(COUNTRIES).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>State / Region</label>
                  {addressForm.country && COUNTRY_STATES[addressForm.country] ? (
                    <select
                      name="state"
                      value={addressForm.state}
                      onChange={onAddressChange}
                      style={styles.select}
                    >
                      <option value="">Select state...</option>
                      {COUNTRY_STATES[addressForm.country].map(s => (
                        <option key={s.code} value={s.code}>{s.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name="state"
                      value={addressForm.state}
                      onChange={onAddressChange}
                      style={styles.input}
                    />
                  )}
                </div>
              </div>

              <div style={{ marginTop: 15 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="setAsDefault"
                    checked={addressForm.setAsDefault}
                    onChange={onAddressChange}
                  />
                  <span style={{ fontSize: 14 }}>Set as default address</span>
                </label>
              </div>

              <div style={{ ...styles.actionButtons, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={saveAddress}
                  style={styles.saveButton}
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={closeAddressForm}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Update Modal */}
      {showEmailModal && (
        <div style={styles.modal} onClick={closeEmailModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>{emailUpdateStep === 1 ? 'Change Email Address' : 'Verify OTP'}</h3>

            {emailUpdateMessage && (
              <div style={{
                ...styles.message,
                backgroundColor: emailUpdateMessage.type === 'success' ? '#d4edda' : '#f8d7da',
                color: emailUpdateMessage.type === 'success' ? '#155724' : '#721c24',
                border: `1px solid ${emailUpdateMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                marginTop: 15,
              }}>
                {emailUpdateMessage.text}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              {emailUpdateStep === 1 ? (
                <>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Current Email</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      style={{ ...styles.input, backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                    />
                  </div>

                  <div style={{ ...styles.inputGroup, marginTop: 15 }}>
                    <label style={styles.label}>New Email Address</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      style={styles.input}
                      placeholder="Enter new email address"
                      autoFocus
                    />
                  </div>

                  <div style={{ ...styles.actionButtons, marginTop: 20 }}>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={emailUpdateLoading || !newEmail}
                      style={{
                        ...styles.saveButton,
                        opacity: (emailUpdateLoading || !newEmail) ? 0.6 : 1,
                        cursor: (emailUpdateLoading || !newEmail) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {emailUpdateLoading ? 'Sending...' : 'Send OTP'}
                    </button>
                    <button
                      type="button"
                      onClick={closeEmailModal}
                      style={styles.cancelButton}
                      disabled={emailUpdateLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 14, color: '#666', marginBottom: 15 }}>
                    We've sent a 4-digit verification code to <strong>{newEmail}</strong>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Enter OTP</label>
                    <input
                      type="text"
                      value={emailOtp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setEmailOtp(value);
                      }}
                      style={{ ...styles.input, letterSpacing: '8px', fontSize: 18, textAlign: 'center' }}
                      placeholder="0000"
                      maxLength={4}
                      autoFocus
                    />
                  </div>

                  <div style={{ marginTop: 15, fontSize: 13, color: '#666', textAlign: 'center' }}>
                    {otpCountdown > 0 ? (
                      <span>Resend OTP in {otpCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={emailUpdateLoading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6b7c6e',
                          textDecoration: 'underline',
                          cursor: emailUpdateLoading ? 'not-allowed' : 'pointer',
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <div style={{ ...styles.actionButtons, marginTop: 20 }}>
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={emailUpdateLoading || emailOtp.length !== 4}
                      style={{
                        ...styles.saveButton,
                        opacity: (emailUpdateLoading || emailOtp.length !== 4) ? 0.6 : 1,
                        cursor: (emailUpdateLoading || emailOtp.length !== 4) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {emailUpdateLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailUpdateStep(1);
                        setEmailOtp('');
                        setEmailUpdateMessage(null);
                      }}
                      style={styles.cancelButton}
                      disabled={emailUpdateLoading}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={closeEmailModal}
                      style={styles.cancelButton}
                      disabled={emailUpdateLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div style={styles.modal} onClick={closeDeleteModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#dc3545' }}>Delete Account</h3>

            {deleteMessage && (
              <div style={{
                ...styles.message,
                backgroundColor: deleteMessage.type === 'success' ? '#d4edda' : deleteMessage.type === 'warning' ? '#fff3cd' : '#f8d7da',
                color: deleteMessage.type === 'success' ? '#155724' : deleteMessage.type === 'warning' ? '#856404' : '#721c24',
                border: `1px solid ${deleteMessage.type === 'success' ? '#c3e6cb' : deleteMessage.type === 'warning' ? '#ffeeba' : '#f5c6cb'}`,
                marginTop: 15,
              }}>
                {deleteMessage.text}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              {deleteLoading && !deleteMessage ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p>Checking account status...</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>
                      <strong>Warning:</strong> This action cannot be undone. Deleting your account will:
                    </p>
                    <ul style={{ fontSize: 14, color: '#666', paddingLeft: 20 }}>
                      <li>Cancel all active subscriptions ({activeSubscriptions.length})</li>
                      <li>Remove all your personal data</li>
                      <li>Delete your order history</li>
                      <li>Sign you out immediately</li>
                    </ul>
                  </div>

                  {(activeOrders.length > 0 || activeSubscriptions.length > 0) && (
                    <div style={{ marginBottom: 20, padding: 15, backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: 4 }}>
                      <p style={{ fontSize: 13, color: '#856404', marginBottom: 10 }}>
                        <strong>Active Items:</strong>
                      </p>
                      {activeOrders.length > 0 && (
                        <p style={{ fontSize: 13, color: '#856404', marginBottom: 5 }}>
                          • {activeOrders.length} active order(s) (Order IDs: {activeOrders.join(', ')})
                        </p>
                      )}
                      {activeSubscriptions.length > 0 && (
                        <p style={{ fontSize: 13, color: '#856404' }}>
                          • {activeSubscriptions.length} active subscription(s) (Subscription IDs: {activeSubscriptions.join(', ')})
                        </p>
                      )}
                    </div>
                  )}

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={deleteConfirmed}
                        onChange={(e) => setDeleteConfirmed(e.target.checked)}
                      />
                      <span style={{ fontSize: 14, color: '#666' }}>
                        I understand that this action is permanent and cannot be undone
                      </span>
                    </label>
                  </div>

                  <div style={{ ...styles.actionButtons, marginTop: 20 }}>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading || !deleteConfirmed}
                      style={{
                        ...styles.saveButton,
                        backgroundColor: '#dc3545',
                        opacity: (deleteLoading || !deleteConfirmed) ? 0.6 : 1,
                        cursor: (deleteLoading || !deleteConfirmed) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {deleteLoading ? 'Deleting...' : 'Delete My Account'}
                    </button>
                    <button
                      type="button"
                      onClick={closeDeleteModal}
                      style={styles.cancelButton}
                      disabled={deleteLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
