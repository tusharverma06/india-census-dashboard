import React from "react";
import DatamapsIndia from "react-datamaps-india";

const MapChart = () => {
  return (
    <DatamapsIndia
      regionData={{
        Maharashtra: {
          value: 10,
        },
        Rajasthan: {
          value: 1000,
        },
        Gujarat: {
          value: 800,
        },
        Karnataka: {
          value: 700,
        },
        TamilNadu: {
          value: 190,
        },
        Kerala: {
          value: 890,
        },
        "Andaman & Nicobar Island": {
          value: 800,
        },
        "Andhra Pradesh": {
          value: 1000,
        },
        "Arunanchal Pradesh": {
          value: 800,
        },
        Assam: {
          value: 800,
        },
        Bihar: {
          value: 800,
        },
        Chandigarh: {
          value: 800,
        },
        Chhattisgarh: {
          value: 800,
        },
        "Dadara & Nagar Haveli": {
          value: 800,
        },
        "Daman & Diu": {
          value: 800,
        },
        Delhi: {
          value: 800,
        },
        Goa: {
          value: 800,
        },
        Haryana: {
          value: 800,
        },
        "Himachal Pradesh": {
          value: 800,
        },
        "Jammu & Kashmir": {
          value: 800,
        },
        Jharkhand: {
          value: 800,
        },
        Lakshadweep: {
          value: 800,
        },
        "Madhya Pradesh": {
          value: 800,
        },
        Manipur: {
          value: 800,
        },
        Meghalaya: {
          value: 800,
        },
        Mizoram: {
          value: 800,
        },
        Nagaland: {
          value: 800,
        },
        Odisha: {
          value: 800,
        },
        Puducherry: {
          value: 800,
        },
        Punjab: {
          value: 800,
        },
        Sikkim: {
          value: 800,
        },
        "Tamil Nadu": {
          value: 800,
        },
        Telangana: {
          value: 800,
        },
        Tripura: {
          value: 800,
        },
        "Uttar Pradesh": {
          value: 800,
        },
        Uttarakhand: {
          value: 800,
        },
        "West Bengal": {
          value: 800,
        },
      }}
      hoverComponent={({ value }) => {
        return (
          <div>
            <div>{value.name}</div>
          </div>
        );
      }}
      mapLayout={{
        title: "Statewise",
        legendTitle: "Number of Tenders",
        startColor: "pink",
        endColor: "blue",
        hoverTitle: "Count",
        noDataColor: "#f5f5f5",
        borderColor: "black",
        hoverBorderColor: "#8D8D8D",
        hoverColor: "green",
        height: 70,
        weight: 30,
      }}
    />
  );
};

export default MapChart;
