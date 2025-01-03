export function SearchBar({ onSearch }) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search by name or interests..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full bg-white/10 backdrop-blur-sm text-white px-4 py-2 pl-10 rounded-lg placeholder-white/50"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
    </div>
  );
}