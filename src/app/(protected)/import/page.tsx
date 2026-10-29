import { ImportWizard } from '@/features/import/components/ImportWizard';

export default function ImportPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Import Data</h1>
        <p className="mt-1 text-muted-foreground">
          Import your Pipedrive data (Organizations, People, Deals, Activities)
          from CSV files.
        </p>
      </div>
      <ImportWizard />
    </div>
  );
}
