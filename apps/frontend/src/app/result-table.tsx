import { SearchItem } from '@org/db-and-api-interfaces';

export interface IResultTableProps {
  isLoading: boolean;
  tableData: SearchItem[];
}

export function ResultTable({ isLoading, tableData }: IResultTableProps) {
  const tableRows = tableData.length !== 0 ? tableData.map((item, index) => {
    return (
      <tr key={index} className="bg-white border-b">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.email}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {item.number !== undefined ? item.number.replace(/(.{2})(?=.{1,2})/g, "$1-") : '--'}
        </td>
      </tr>
    );
  }) :
  <tr><td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
    No results... yet
  </td></tr>;

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-10">
          <div className="text-white text-lg">Loading...</div>
        </div>
      )}
      <div className='h-full overflow-y-auto'>
        <table className={`relative min-w-full divide-y divide-gray-600 ` +
          `${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          <thead className='sticky top-0'>
            <tr className="bg-white border-b-2">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Email</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Number</td>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">{tableRows}</tbody>
        </table>
      </div>
    </div>
  );
}