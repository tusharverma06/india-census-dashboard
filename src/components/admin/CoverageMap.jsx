import { useMemo } from "react";
import DatamapsIndia from "react-datamaps-india";
import { formatNumber, calculateLiteracyRate } from "../../utils/columnMapper";
import { getStateName } from "../../utils/stateMapper";

export default function CoverageMap({ censusData }) {
  const { stateData, maxPopulation, minPopulation } = useMemo(() => {
    const aggregated = {};

    // First, collect STATE level data
    censusData
      .filter((row) => row.Level === "STATE")
      .forEach((row) => {
        const stateName = getStateName(row.State);

        if (!aggregated[stateName]) {
          aggregated[stateName] = {
            population: 0,
            households: 0,
            literate: 0,
            districts: 0,
          };
        }

        aggregated[stateName].population += parseInt(row.TOT_P || 0);
        aggregated[stateName].households += parseInt(row.No_HH || 0);
        aggregated[stateName].literate += parseInt(row.P_LIT || 0);
      });

    // Then count districts
    censusData
      .filter((row) => row.Level === "DISTRICT")
      .forEach((row) => {
        const stateName = getStateName(row.State);
        if (aggregated[stateName]) {
          aggregated[stateName].districts += 1;
        } else {
          // If state data not found, aggregate from districts
          if (!aggregated[stateName]) {
            aggregated[stateName] = {
              population: 0,
              households: 0,
              literate: 0,
              districts: 0,
            };
          }
          aggregated[stateName].population += parseInt(row.TOT_P || 0);
          aggregated[stateName].households += parseInt(row.No_HH || 0);
          aggregated[stateName].literate += parseInt(row.P_LIT || 0);
          aggregated[stateName].districts += 1;
        }
      });

    const regionData = {};
    let max = 0;
    let min = Infinity;

    Object.keys(aggregated).forEach((stateName) => {
      const state = aggregated[stateName];
      state.literacyRate = calculateLiteracyRate(
        state.literate,
        state.population,
      );

      regionData[stateName] = {
        value: state.population,
        ...state,
      };

      if (state.population > max) max = state.population;
      if (state.population < min && state.population > 0)
        min = state.population;
    });

    return {
      stateData: regionData,
      maxPopulation: max,
      minPopulation: min,
    };
  }, [censusData]);

  return (
    <div className="map-container">
      <DatamapsIndia
        regionData={stateData}
        hoverComponent={({ value }) => {
          if (!value || !value.population) return null;

          return (
            <div
              style={{
                background: "white",
                padding: "12px",
                border: "1px solid #CBD5E1",
                borderRadius: "8px",
                fontSize: "13px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                minWidth: "200px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "#1e293b",
                }}
              >
                {value.name}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  color: "#64748b",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Population:</span>
                  <span style={{ fontWeight: "600", color: "#334155" }}>
                    {formatNumber(value.population)}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Households:</span>
                  <span style={{ fontWeight: "600", color: "#334155" }}>
                    {formatNumber(value.households)}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Literacy Rate:</span>
                  <span style={{ fontWeight: "600", color: "#334155" }}>
                    {value.literacyRate}%
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Districts:</span>
                  <span style={{ fontWeight: "600", color: "#334155" }}>
                    {value.districts}
                  </span>
                </div>
              </div>
            </div>
          );
        }}
        mapLayout={{
          title: "",
          legendTitle: "Population",
          startColor: "#E3F2FD",
          endColor: "#1565C0",
          hoverTitle: "State",
          noDataColor: "#f5f5f5",
          borderColor: "#CBD5E1",
          hoverBorderColor: "#2563eb",
          hoverColor: "#BBDEFB",
          height: 60,
          weight: 30,
        }}
      />

      <div className="map-legend">
        <h4>Population Scale</h4>
        <div className="legend-gradient">
          <div
            className="gradient-bar"
            style={{
              background: "linear-gradient(to right, #E3F2FD, #1565C0)",
              height: "12px",
              borderRadius: "6px",
              marginBottom: "8px",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            <span>{formatNumber(minPopulation)}</span> {"-"}
            <span>{formatNumber(maxPopulation)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
