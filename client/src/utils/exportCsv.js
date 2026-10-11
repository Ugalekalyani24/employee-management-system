export const exportToCSV = (data, filename = 'employee_directory.csv') => {
  if (!data || !data.length) return;

  const headers = ['ID', 'Name', 'Role', 'Department', 'Salary'];
  const rows = data.map((emp) => [
    emp.id || emp._id,
    `"${emp.name || ''}"`,
    `"${emp.role || ''}"`,
    `"${emp.department || ''}"`,
    emp.salary || 0,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};