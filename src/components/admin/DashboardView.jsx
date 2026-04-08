import { useMemo } from "react";
import StatCard from "../shared/StatCard";
import CoverageMap from "./CoverageMap";
import {
  formatNumber,
  calculateLiteracyRate,
  calculateGenderRatio,
} from "../../utils/columnMapper";

export default function DashboardView({ censusData, anomalies }) {
  const stats = useMemo(() => {
    const districts = censusData.filter((row) => row.Level === "DISTRICT");

    const totalPopulation = districts.reduce(
      (sum, row) => sum + (row.TOT_P || 0),
      0,
    );
    const totalHouseholds = districts.reduce(
      (sum, row) => sum + (row.No_HH || 0),
      0,
    );
    const totalLiterate = districts.reduce(
      (sum, row) => sum + (row.P_LIT || 0),
      0,
    );
    const totalMale = districts.reduce((sum, row) => sum + (row.TOT_M || 0), 0);
    const totalFemale = districts.reduce(
      (sum, row) => sum + (row.TOT_F || 0),
      0,
    );
    const totalWorkers = districts.reduce(
      (sum, row) => sum + (row.TOT_WORK_P || 0),
      0,
    );

    const literacyRate =
      totalPopulation > 0
        ? ((totalLiterate / totalPopulation) * 100).toFixed(2)
        : 0;
    const femalesPerThousandMales =
      totalMale > 0 ? ((totalFemale / totalMale) * 1000).toFixed(0) : 0;
    const workerParticipationRate =
      totalPopulation > 0
        ? ((totalWorkers / totalPopulation) * 100).toFixed(2)
        : 0;

    return {
      districtsCount: districts.length,
      totalPopulation,
      totalHouseholds,
      literacyRate,
      femalesPerThousandMales,
      workerParticipationRate,
      totalMale,
      totalFemale,
    };
  }, [censusData]);

  const stateStats = useMemo(() => {
    const stateMap = {};

    censusData
      .filter((row) => row.Level === "DISTRICT")
      .forEach((row) => {
        if (!stateMap[row.State]) {
          stateMap[row.State] = {
            name: row.State,
            population: 0,
            households: 0,
            literate: 0,
          };
        }
        stateMap[row.State].population += row.TOT_P || 0;
        stateMap[row.State].households += row.No_HH || 0;
        stateMap[row.State].literate += row.P_LIT || 0;
      });

    return Object.values(stateMap)
      .sort((a, b) => b.population - a.population)
      .slice(0, 5);
  }, [censusData]);

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h2>Census Dashboard</h2>
        <p>Comprehensive analysis of Indian Census 2011 data</p>
      </div>

      <div className="kpi-grid">
        <StatCard
          title="Total Districts"
          value={formatNumber(stats.districtsCount)}
        />
        <StatCard
          title="Population"
          value={formatNumber(stats.totalPopulation)}
        />
        <StatCard
          title="Households"
          value={formatNumber(stats.totalHouseholds)}
        />
        <StatCard
          title="Literacy Rate"
          value={`${stats.literacyRate}%`}
          subtitle="National average"
        />
        <StatCard
          title="Sex Ratio"
          value={stats.femalesPerThousandMales}
          subtitle="Females per 1,000 males"
        />
        <StatCard
          title="Workforce Participation"
          value={`${stats.workerParticipationRate}%`}
          subtitle="Working population"
        />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-left">
          <div className="card">
            <h3>State Coverage Map</h3>
            <CoverageMap censusData={censusData} />
          </div>

          {/* <div className="card">
            <h3>Most Populous States</h3>
            <div className="state-list">
              {stateStats.map((state, idx) => {
                const literacyRate = state.population > 0 ? ((state.literate / state.population) * 100).toFixed(2) : 0
                return (
                  <div key={idx} className="state-item">
                    <div className="state-rank">{idx + 1}</div>
                    <div className="state-info">
                      <div className="state-name">{state.name}</div>
                      <div className="state-stats">
                        <span>Population: {formatNumber(state.population)}</span>
                        <span>Literacy: {literacyRate}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div> */}
        </div>

        <div className="dashboard-right">
          <div className="card">
            <h3>Data Quality Status</h3>
            <div className="data-quality">
              <div className="quality-item">
                <span className="quality-label">Total Issues</span>
                <span className="quality-value">{anomalies.length}</span>
              </div>
              <div className="quality-item high">
                <span className="quality-label">Critical Issues</span>
                <span className="quality-value">
                  {anomalies.filter((a) => a.severity === "high").length}
                </span>
              </div>
              <div className="quality-item medium">
                <span className="quality-label">Moderate Issues</span>
                <span className="quality-value">
                  {anomalies.filter((a) => a.severity === "medium").length}
                </span>
              </div>
              <div className="quality-item low">
                <span className="quality-label">Minor Issues</span>
                <span className="quality-value">
                  {anomalies.filter((a) => a.severity === "low").length}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Gender Distribution</h3>
            <div className="population-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">Male Population</span>
                <span className="breakdown-value">
                  {formatNumber(stats.totalMale)}
                </span>
                <span className="breakdown-percent">
                  {((stats.totalMale / stats.totalPopulation) * 100).toFixed(1)}
                  %
                </span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Female Population</span>
                <span className="breakdown-value">
                  {formatNumber(stats.totalFemale)}
                </span>
                <span className="breakdown-percent">
                  {((stats.totalFemale / stats.totalPopulation) * 100).toFixed(
                    1,
                  )}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
