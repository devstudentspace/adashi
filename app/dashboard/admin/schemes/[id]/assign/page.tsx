import { AssignMembersForm } from '@/components/assign-members-form';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function AssignMembersPage({ params }: Props) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/auth/login');
  }

  // Verify that the user is an admin and owns this scheme
  const { data: scheme, error: schemeError } = await supabase
    .from('schemes')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (schemeError || !scheme) {
    redirect('/dashboard/admin/schemes');
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Assign Members to {scheme.name}</h1>
        <AssignMembersForm schemeId={resolvedParams.id} />
      </div>
    </div>
  );
}