import UploadForm from '@/components/UploadForm';

export default function UploadPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Upload receipt</h1>
      <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <UploadForm />
      </div>
    </div>
  );
}
