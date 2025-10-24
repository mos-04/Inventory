import AttendanceUpload from '../AttendanceUpload';

export default function AttendanceUploadExample() {
  return (
    <div className="p-6 bg-background max-w-6xl">
      <AttendanceUpload onUpload={(records) => console.log('Uploaded:', records)} />
    </div>
  );
}
