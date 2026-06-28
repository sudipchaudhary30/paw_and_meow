export default function Table({ columns, data, renderRow, emptyMessage = 'No data found.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>{columns.map(col => <th key={col} className="th">{col}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0
            ? <tr><td colSpan={columns.length} className="td text-center text-gray-400 py-10">{emptyMessage}</td></tr>
            : data.map((row, i) => renderRow(row, i))}
        </tbody>
      </table>
    </div>
  );
}
