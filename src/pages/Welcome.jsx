import { useState } from 'react';
import { useProfile } from '../contexts/ProfileContext';

const COLORS = [
  { name: 'purple', value: '#7c3aed' },
  { name: 'blue', value: '#3b82f6' },
  { name: 'green', value: '#10b981' },
  { name: 'yellow', value: '#f59e0b' },
  { name: 'red', value: '#ef4444' },
  { name: 'pink', value: '#ec4899' },
  { name: 'cyan', value: '#06b6d4' },
  { name: 'orange', value: '#f97316' },
];

export default function Welcome() {
  const { profiles, loading, selectProfile, createProfile, deleteProfile } = useProfile();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const newProfile = await createProfile({
        name: name.trim(),
        color: selectedColor
      });
      selectProfile(newProfile);
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectProfile = (profile) => {
    selectProfile(profile);
  };

  const handleDeleteProfile = async (e, profileId) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este perfil?')) {
      await deleteProfile(profileId);
    }
  };

  if (loading) {
    return (
      <div className="welcome-page">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="welcome-page">
      <div className="welcome-logo">💰</div>
      <h1 className="welcome-title">Gerenciador de Despesas</h1>
      <p className="welcome-subtitle">Selecione um perfil ou crie um novo</p>

      {profiles.length > 0 && !showForm && (
        <div className="profiles-grid">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="profile-card"
              onClick={() => handleSelectProfile(profile)}
            >
              <div
                className="profile-avatar"
                style={{ backgroundColor: profile.color }}
              >
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <span className="profile-card-name">{profile.name}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={(e) => handleDeleteProfile(e, profile.id)}
                style={{ color: 'var(--danger)', marginTop: 'var(--space-sm)' }}
              >
                🗑️ Excluir
              </button>
            </div>
          ))}
          
          <div
            className="profile-card add-profile-card"
            onClick={() => setShowForm(true)}
          >
            <div className="add-profile-icon">+</div>
            <span className="profile-card-name">Novo Perfil</span>
          </div>
        </div>
      )}

      {(showForm || profiles.length === 0) && (
        <div className="card animate-fadeIn" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: 'var(--space-lg)' }}>
            {profiles.length === 0 ? 'Crie seu primeiro perfil' : 'Novo Perfil'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group mb-lg">
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="input-group mb-lg">
              <label>Cor do perfil</label>
              <div className="color-picker">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    className={`color-option ${selectedColor === color.value ? 'selected' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color.value)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-sm">
              {profiles.length > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!name.trim() || isSubmitting}
                style={{ flex: 1 }}
              >
                {isSubmitting ? 'Criando...' : 'Criar Perfil'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
