import { useState } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const dummyData = [
  "React",
  "Vue",
  "Svelte",
  "Next.js",
  "Angular",
  "TypeScript",
  "JavaScript"
];

export const GooeySearchBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState<string[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);

    if (value.trim()) {
      setFilteredData(
        dummyData.filter(item =>
          item.toLowerCase().includes(value.toLowerCase())
        )
      );
    } else {
      setFilteredData([]);
    }
  };

  return (
    <div className="relative max-w-md mx-auto">
      {/* Search Results */}
      <AnimatePresence>
        {isExpanded && filteredData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-2 w-full bg-white rounded-lg shadow-lg border p-2 max-h-48 overflow-y-auto z-10"
          >
            {filteredData.map((item, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors"
              >
                {item}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Input */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center bg-white rounded-full shadow-lg border overflow-hidden"
      >
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full py-3 px-6 text-left text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Search topics...
          </button>
        ) : (
          <>
            <input
              type="text"
              value={searchText}
              onChange={handleSearch}
              placeholder="Type to search..."
              className="flex-1 py-3 px-6 outline-none text-gray-900"
              autoFocus
            />
            <div className="p-3">
              <Search size={20} color="#2563eb" />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
