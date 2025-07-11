import { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DataTable } from '../components/ui/DataTable';
import { FormCard } from '../components/ui/FormCard';
import { UserForm } from '../components/forms/UserForm';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UserProfile } from '../types';
import { fetchUserProfiles, deleteUser } from '../lib/userService';
import { timeAgo } from '../lib/utils';

export const UsersPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);

  const getUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUserProfiles();
      setUsers(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to fetch users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleSave = () => {
    getUsers();
    setUserToEdit(null);
  };
  
  const handleEdit = (user: User
  
  ) => {
    setUserToEdit(user);
  };

  const handleDelete = async (userId: string) => {
      if (window.confirm('Are you sure you want to delete this user? This action is irreversible.')) {
          try {
            await deleteUser(userId);
            toast.success('User deleted successfully!');
            getUsers();
          } catch (err: any) {
            toast.error(`Failed to delete user: ${err.message}`);
            setError(err.error_description || err.message);
          }
      }
  }

  return (
    <div className="space-y-4">
      <FormCard title={userToEdit ? "Edit User Role" : "Invite New User"}>
        <UserForm onSave={handleSave} userToEdit={userToEdit} />
      </FormCard>
      <DataTable 
        title="User Management"
        columns={['Email', 'Role', 'Status', 'Last Sign In', 'Actions']}
        data={users.map(user => [
          user.email,
          user.role,
          <StatusBadge status={user.id ? 'Active' : 'Invited'} />,
          user.last_sign_in_at ? timeAgo(user.last_sign_in_at) : 'Never',
          <div className="flex space-x-1">
             <button onClick={() => handleEdit(user)} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-black/20"><Edit className="h-4 w-4 text-gray-600 dark:text-gray-300" /></button>
             <button onClick={() => handleDelete(user.id)} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-black/20"><Trash2 className="h-4 w-4 text-red-600 dark:text-red-500" /></button>
          </div>
        ])}
        loading={loading}
        error={error}
      />
    </div>
  );
};
