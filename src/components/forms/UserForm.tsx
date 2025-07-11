import { useState, useEffect } from 'react';
import { commonClasses } from '../../lib/commonClasses';
import { inviteUser, updateUserRole } from '../../lib/userService';
import { UserProfile } from '../../types';

interface UserFormProps {
  onSave: () => void;
  userToEdit: UserProfile | null;
}

const ROLES = ['Admin', 'Accountant', 'Sales', 'Inventory'];

export const UserForm = ({ onSave, userToEdit }: UserFormProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Sales');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setEmail(userToEdit.email || '');
      setRole(userToEdit.role || 'Sales');
    } else {
      resetForm();
    }
  }, [userToEdit]);

  const resetForm = () => {
    setEmail('');
    setRole('Sales');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (userToEdit) {
        await updateUserRole(userToEdit.id, role);
      } else {
        await inviteUser(email, role);
      }
      onSave();
      resetForm();
    } catch (err: any) {
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input 
          type="email" 
          className={commonClasses.input} 
          placeholder="User's Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!!userToEdit} // Disable email editing
          required
        />
        <select 
          className={commonClasses.input}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className={commonClasses.button} disabled={loading}>
          {loading ? 'Saving...' : (userToEdit ? 'Update Role' : 'Invite User')}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
};
