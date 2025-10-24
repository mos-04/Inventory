import EmployeeForm from '../EmployeeForm';

export default function EmployeeFormExample() {
  return (
    <div className="p-6 bg-background max-w-4xl">
      <EmployeeForm
        onSubmit={(data) => console.log('Form submitted:', data)}
        onCancel={() => console.log('Form cancelled')}
      />
    </div>
  );
}
