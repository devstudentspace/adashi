import { CreateSchemeForm } from '@/components/create-scheme-form';

export default function CreateSchemePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Scheme</h1>
        <CreateSchemeForm />
      </div>
    </div>
  );
}