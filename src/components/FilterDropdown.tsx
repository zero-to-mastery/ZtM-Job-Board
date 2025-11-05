import React, { useEffect, useRef, useState } from "react";


type FiltersShape = { [category: string]: string[] };


interface Props {
  filters: FiltersShape; // expects Country, State, City, Role, Industry (some can be empty)
  selected: FiltersShape;
  toggleFilter: (category: string, value: string) => void;
  clearFilter: (category?: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  nameQuery: string;
  setNameQuery: (v: string) => void;
}


const FilterDropdown: React.FC<Props> = ({
  filters,
  selected,
  toggleFilter,
  clearFilter,
  sortBy,
  setSortBy,
  nameQuery,
  setNameQuery,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [searchInside, setSearchInside] = useState<{ [k: string]: string }>({});


  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        // keep open; no-op
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);


  const activeCount = Object.values(selected || {}).reduce(
    (s, arr) => s + (arr ? arr.length : 0),
    0
  );


  const isChecked = (category: string, opt: string) => {
    const arr = selected?.[category] || [];
    return arr.includes(opt);
  };


  // prioritize location path
  const ordered = (() => {
    const prefer = ["Country", "State", "City", "Role", "Industry"];
    const rest = Object.keys(filters || {}).filter((k) => !prefer.includes(k));
    return [
      ...prefer.filter((p) => filters && p in filters),
      ...rest,
    ];
  })();


  const onSearchInsideChange = (category: string, v: string) => {
    setSearchInside((prev) => ({ ...prev, [category]: v }));
  };


  const hintFor = (category: string) => {
    if (category === "State" && (!filters.Country || (selected.Country || []).length === 0))
      return "Pick a Country to see States";
    if (category === "City") {
      if ((selected.State || []).length > 0) return "No cities under the selected State(s)";
      if ((selected.Country || []).length === 0) return "Pick a Country to see Cities";
      return "Pick a State to narrow Cities (optional)";
    }
    return "No results";
  };


  return (
    <div
      ref={rootRef}
      style={{
        width: 300,
        minWidth: 260,
        background: "#0b0b0b",
        color: "#fff",
        borderRadius: 8,
        padding: 14,
        boxShadow: "0 18px 48px rgba(2,6,23,0.45)",
        zIndex: 1200,
        fontFamily: "inherit",
      }}
      aria-label="Filter sidebar"
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>Filters {activeCount ? `· ${activeCount}` : ""}</div>
        <button
          onClick={() => clearFilter()}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#ddd",
            padding: "6px 8px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 12,
          }}
          aria-label="Clear all filters"
        >
          Clear All
        </button>
      </div>


      {/* Name search */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ display: "block", color: "#cfcfcf", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
          Search by name
        </label>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder="Type a name…"
            aria-label="Search by name"
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
              color: "#fff",
              outline: "none",
              fontSize: 13,
            }}
          />
          {nameQuery ? (
            <button
              onClick={() => setNameQuery("")}
              aria-label="Clear name search"
              title="Clear"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#ddd",
                padding: "6px 10px",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>


      {/* Sort */}
      <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <label style={{ color: "#cfcfcf", fontSize: 13, fontWeight: 700 }}>Sort</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            marginLeft: 6,
            padding: "6px 8px",
            borderRadius: 6,
            background: "rgba(255,255,255,0.03)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.06)",
            fontSize: 13,
          }}
          aria-label="Sort profiles"
        >
          <option value="relevance">Relevance</option>
          <option value="az">A–Z</option>
          <option value="za">Z–A</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>


      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "8px 0 12px" }} />


      {/* Categories */}
      <div style={{ maxHeight: "60vh", overflow: "auto", paddingRight: 6 }}>
        {ordered.map((category) => {
          const opts = filters[category] || [];
          const searchVal = (searchInside[category] || "").toLowerCase();
          const visible = searchVal ? opts.filter((o) => String(o).toLowerCase().includes(searchVal)) : opts;


          return (
            <div key={category} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{category}</div>
                <button
                  onClick={() => clearFilter(category)}
                  style={{ background: "transparent", border: "none", color: "#bdbdbd", fontSize: 12, cursor: "pointer" }}
                >
                  Clear
                </button>
              </div>


              {/* small search inside category */}
              <div style={{ marginBottom: 8 }}>
                <input
                  value={searchInside[category] || ""}
                  onChange={(e) => onSearchInsideChange(category, e.target.value)}
                  placeholder={`Search ${category}`}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                    color: "#fff",
                    outline: "none",
                    fontSize: 13,
                  }}
                />
              </div>


              <div style={{ maxHeight: 140, overflow: "auto", paddingRight: 6 }}>
                {visible.map((opt) => (
                  <label key={opt} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                    <input
                      type="checkbox"
                      checked={isChecked(category, opt)}
                      onChange={() => toggleFilter(category, opt)}
                      aria-checked={isChecked(category, opt)}
                      style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#4aa3f0" }}
                    />
                    <span style={{ fontSize: 14, color: "#eaeaea" }}>{opt}</span>
                  </label>
                ))}


                {visible.length === 0 && (
                  <div style={{ color: "#8d8d8d", fontSize: 13 }}>
                    {hintFor(category)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>


      {/* Footer actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button
          onClick={() => clearFilter()}
          style={{
            flex: 1,
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#fff",
            padding: "10px 12px",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Clear All
        </button>
        <button
          onClick={() => {}}
          style={{
            background: "#4aa3f0",
            border: "none",
            color: "#071226",
            padding: "10px 14px",
            borderRadius: 8,
            fontWeight: 900,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
};


export default FilterDropdown;


