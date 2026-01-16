"use client";
import React, { useState } from 'react';
import ProfileFormClient from './ProfileFormClient';

export default function ProfileAddressClient({ initialProfile = {} }) {
  const [editing, setEditing] = useState(false);

  function closeEditor() {
    setEditing(false);
  }

  if (editing) {
    return <ProfileFormClient initialProfile={initialProfile} onSaved={closeEditor} />;
  }

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <button
        onClick={() => setEditing(true)}
        style={{
          padding: '12px 30px',
          backgroundColor: '#6b7c6e',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Edit Profile
      </button>
    </div>
  );
}
